
import request from 'supertest';
import app from '../server';
import { prisma } from '../utils/prisma';

// Mock unrelated routes to prevent side effects
jest.mock('../routes/auth.routes', () => require('express').Router());
jest.mock('../routes/activity.routes', () => require('express').Router());
jest.mock('../routes/leaderboard.routes', () => require('express').Router());
jest.mock('../routes/admin.routes', () => require('express').Router());
jest.mock('../routes/case.route', () => require('express').Router());
jest.mock('../routes/caseReview.routes', () => require('express').Router());
jest.mock('../webhooks/clerkWebhook', () => ({ clerkWebhook: jest.fn() }));

// Mock Prisma
jest.mock('../utils/prisma', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
        },
        activity: {
            findMany: jest.fn(),
            count: jest.fn(),
        },
        userBadge: {
            count: jest.fn(),
        },
        $queryRaw: jest.fn(),
    },
}));

// Mock Auth Middleware
jest.mock('../middleware/authMiddleware', () => ({
    requireAuth: jest.fn((req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: "No token" });
        }
        if (authHeader === 'Bearer invalid_token') {
            return res.status(401).json({ error: "Unauthorized" });
        }
        // Valid token simulation
        req.user = { id: 'test-user-id', clerkId: 'clerk_123' };
        next();
    }),
}));

const mockUser = {
    id: 'test-user-id',
    clerkId: 'clerk_123',
    email: 'test@example.com',
    xp: 1200, // Level 3
    createdAt: new Date('2024-01-01T00:00:00Z'),
};

const mockActivities = [
    {
        id: 'act1',
        userId: 'test-user-id',
        activityType: 'quiz',
        xpEarned: 100,
        createdAt: new Date(),
    },
    {
        id: 'act2',
        userId: 'test-user-id',
        activityType: 'article',
        xpEarned: 50,
        createdAt: new Date(),
    }
];

describe('Profile & Progress API Audit', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/progress/weekly-xp', () => {
        it('should enforce auth', async () => {
            await request(app).get('/api/progress/weekly-xp').expect(401);
        });

        it('should return valid structure with valid token', async () => {
            (prisma.activity.findMany as jest.Mock).mockResolvedValue(mockActivities);
            const res = await request(app).get('/api/progress/weekly-xp').set('Authorization', 'Bearer valid_token');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('dailyXp');
            expect(typeof res.body.totalXp).toBe('number');
            // Expect keys to be Mon, Tue etc.
            expect(res.body.dailyXp).toHaveProperty('Mon');
        });

        it('should handle empty database gracefully', async () => {
            (prisma.activity.findMany as jest.Mock).mockResolvedValue([]);
            const res = await request(app).get('/api/progress/weekly-xp').set('Authorization', 'Bearer valid_token');
            expect(res.status).toBe(200);
            expect(res.body.totalXp).toBe(0);
        });
    });

    describe('GET /api/progress/streak', () => {
        it('should return status 200 and an array of dates', async () => {
            // Mock $queryRaw for the optimized implementation
            (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ date: '2023-12-01' }, { date: '2023-12-02' }]);

            const res = await request(app).get('/api/progress/streak').set('Authorization', 'Bearer valid_token');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('activeDates');
            expect(Array.isArray(res.body.activeDates)).toBe(true);
            expect(res.body.activeDates).toContain('2023-12-01');
        });
    });

    describe('GET /api/progress/subjects', () => {
        it('should return status 200 and subject stats', async () => {
            const res = await request(app).get('/api/progress/subjects').set('Authorization', 'Bearer valid_token');
            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                audit: 0,
                tax: 0,
                caseLaw: 0,
            });
        });
    });

    describe('GET /api/profile/overview', () => {
        it('should return profile overview', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            const res = await request(app).get('/api/profile/overview').set('Authorization', 'Bearer valid_token');
            expect(res.status).toBe(200);
            expect(res.body.xp).toBe(1200);
            expect(res.body.level).toBe(3);
        });
    });

    describe('GET /api/profile/timeline', () => {
        it('should return timeline array with limit', async () => {
            (prisma.activity.findMany as jest.Mock).mockResolvedValue(mockActivities);
            const res = await request(app).get('/api/profile/timeline').set('Authorization', 'Bearer valid_token');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body[0]).toHaveProperty('label');
        });
    });

    describe('GET /api/profile/stats', () => {
        it('should return stats with corrected key', async () => {
            (prisma.activity.count as jest.Mock).mockResolvedValue(5);
            (prisma.userBadge.count as jest.Mock).mockResolvedValue(2);

            const res = await request(app).get('/api/profile/stats').set('Authorization', 'Bearer valid_token');
            expect(res.status).toBe(200);
            // Expect corrected key 'activitiesCompleted'
            expect(res.body).toEqual({
                activitiesCompleted: 5,
                badgesEarned: 2
            });
        });
    });
});
