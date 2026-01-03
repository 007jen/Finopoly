
import request from "supertest";
import { app } from "../server";
import { prisma } from "../utils/prisma";

// Mock Auth Middleware
jest.mock("../middleware/authMiddleware", () => ({
    requireAuth: (req: any, res: any, next: any) => {
        req.user = { id: "test-user-id" };
        next();
    },
}));

// Mock Prisma
jest.mock("../utils/prisma", () => ({
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
    },
}));

describe("API Verification Tests", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /api/profile/overview", () => {
        it("should return 200 when user exists", async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                id: "test-user-id",
                xp: 1000,
                createdAt: new Date(),
            });

            const res = await request(app).get("/api/profile/overview");
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("level");
        });

        it("should return 404 when user does not exist", async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            const res = await request(app).get("/api/profile/overview");
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: "User not found" });
        });
    });

    describe("GET /api/progress/weekly-xp", () => {
        it("should return 200 when user exists", async () => {
            // Mock user check
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                id: "test-user-id",
            });
            // Mock activity fetch
            (prisma.activity.findMany as jest.Mock).mockResolvedValue([]);

            const res = await request(app).get("/api/progress/weekly-xp");
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("totalXp");
        });

        it("should return 404 when user does not exist", async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            const res = await request(app).get("/api/progress/weekly-xp");
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: "User not found" });
        });
    });

    describe("GET /api/progress/streak", () => {
        it("should return 200 with unique dates", async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "test-user-id" });

            // Mock activities with dupes to test uniqueness
            (prisma.activity.findMany as jest.Mock).mockResolvedValue([
                { createdAt: new Date("2025-01-01T10:00:00Z") },
                { createdAt: new Date("2025-01-01T15:00:00Z") },
                { createdAt: new Date("2025-01-02T12:00:00Z") },
            ]);

            const res = await request(app).get("/api/progress/streak");
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("activeDates");
            expect(res.body.activeDates).toEqual(["2025-01-01", "2025-01-02"]);
        });
    });
});
