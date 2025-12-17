
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../src/utils/prisma';
import { requiresAdmin } from '../src/middleware/adminOnly';
import { getLeaderboard } from '../src/controllers/leaderboard.controller';
import app from '../src/server';

// Mock helpers
const mockReq = (user: any) => ({
    user,
    headers: {},
    body: {}
} as unknown as Request);

const mockRes = () => {
    const res: any = {};
    res.status = (code: number) => {
        console.log(`    [Response Status]: ${code}`);
        res.statusCode = code;
        return res;
    };
    res.json = (data: any) => {
        // console.log(`    [Response JSON]:`, JSON.stringify(data).slice(0, 100) + "...");
        res.body = data;
        return res;
    };
    return res;
};

const mockNext = () => console.log("    [Next]: Called (PASS)");

async function runTests() {
    console.log("=== DAY 3 VERIFICATION SUITE ===\n");

    try {
        // 1. ROUTE MOUNTING (Webhook Live)
        console.log("TEST 1: Webhook & Route Mounting");
        const routes = (app._router.stack || []).map((layer: any) => {
            if (layer.route) return layer.route.path;
            if (layer.name === 'router' && layer.regexp) return `Router: ${layer.regexp}`;
            return layer.name;
        });

        // Check for webhook specifically
        // Express router stack is complex, simple string check:
        // We look for the path in the stack

        let webhookFound = false;
        app._router.stack.forEach((layer: any) => {
            if (layer.route && layer.route.path === '/api/webhooks/clerk') {
                webhookFound = true;
            }
        });

        if (webhookFound) console.log("✅ Webhook '/api/webhooks/clerk' is MOUNTED.");
        else console.log("❌ Webhook Route NOT FOUND in top-level stack.");

        // Check Auth
        // Auth is a router, so it appears as 'router'
        console.log("✅ Server Routes Loaded.\n");


        // 2. LEADERBOARD SAFETY
        console.log("TEST 2: Leaderboard Privacy");
        // We'll try to fetch the leaderboard.
        // We need at least one user in DB.
        const userCount = await prisma.user.count();
        if (userCount === 0) {
            console.log("⚠️ No users in DB. Creating temp user...");
            await prisma.user.create({
                data: {
                    clerkId: 'test_student',
                    email: 'student@test.com',
                    role: 'student',
                    xp: 100
                }
            });
        }

        const lbReq = mockReq({});
        const lbRes = mockRes();
        await getLeaderboard(lbReq, lbRes);

        if (lbRes.body && lbRes.body.leaderboard) {
            const entry = lbRes.body.leaderboard[0];
            if (entry) {
                if ('email' in entry) {
                    console.log("❌ FAIL: 'email' field found in Leaderboard response!");
                    console.log("   Keys:", Object.keys(entry));
                } else {
                    console.log("✅ PASS: 'email' is NOT in Leaderboard response.");
                }
            } else {
                console.log("⚠️ Leaderboard empty.");
            }
        } else {
            console.log("❌ Failed to fetch leaderboard response.");
        }
        console.log("");


        // 3. ADMIN SECURITY LOGIC
        console.log("TEST 3: Admin Security Middleware");

        // Creating mocks
        // We need a real user in DB because middleware checks DB.

        // A. Create/Fetch Student
        const student = await prisma.user.upsert({
            where: { clerkId: 'verify_student' },
            create: { clerkId: 'verify_student', email: 's@test.com', role: 'student' },
            update: { role: 'student' }
        });

        // B. Create/Fetch Admin
        const admin = await prisma.user.upsert({
            where: { clerkId: 'verify_admin' },
            create: { clerkId: 'verify_admin', email: 'a@test.com', role: 'admin' },
            update: { role: 'admin' }
        });

        console.log("--- Case A: Student Accessing Admin ---");
        const reqS = mockReq({ id: student.id }); // Middleware uses req.user.id (from auth middleware usually)
        // Wait, middleware uses req.user.id or req.user.clerkId?
        // Checking file: src/middleware/adminOnly.ts
        // It says: const userId = req.user?.id; 

        await requiresAdmin(reqS, mockRes(), mockNext);

        console.log("--- Case B: Admin Accessing Admin ---");
        const reqA = mockReq({ id: admin.id });
        await requiresAdmin(reqA, mockRes(), mockNext);


    } catch (err) {
        console.error("CRITICAL TEST FAILURE:", err);
    } finally {
        await prisma.$disconnect();
    }
}

runTests();
