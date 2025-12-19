
import request from 'supertest';
import app from '../src/server';

describe('Case API Automated Tests', () => {
    // TC-001: Public Access to Case List
    it('GET /api/cases should return 200 and a list of cases', async () => {
        const res = await request(app).get('/api/cases');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);

        // Security Check: No sensitive fields
        const firstCase = res.body[0];
        expect(firstCase).toHaveProperty('id');
        expect(firstCase).toHaveProperty('title');
        expect(firstCase).not.toHaveProperty('correctAnswer');
    });

    // TC-002: Specific Case Retrieval
    it('GET /api/cases/:id should return case details without answer', async () => {
        // First get a valid ID
        const listRes = await request(app).get('/api/cases');
        const caseId = listRes.body[0].id;

        const res = await request(app).get(`/api/cases/${caseId}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('facts');
        expect(res.body).toHaveProperty('question');
        // CRITICAL SECURITY CHECK
        expect(res.body).not.toHaveProperty('correctAnswer');
    });
});
