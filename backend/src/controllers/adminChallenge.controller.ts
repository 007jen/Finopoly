import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { challengeSchema, baseChallengeSchema } from '../utils/validator';

// --- 1. CREATE CHALLENGE ---
export const createChallenge = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const adminId = user?.id;
        if (!adminId) return res.status(401).json({ error: "Unauthorized" });

        const validation = challengeSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: validation.error.flatten() });
        }
        const data = validation.data;

        // C. 🚫 Conflict Check: Ensure Slug is unique
        const existing = await prisma.analystChallenge.findUnique({
            where: { slug: data.slug }
        });
        if (existing) {
            return res.status(409).json({ error: "Slug already exists. Use a unique identifier." });
        }

        // D. 💾 Save to Database
        const challenge = await prisma.analystChallenge.create({
            data: {
                ...data,
                createdBy: adminId,
                // Clean data: If TEXT type, force tolerance to null
                tolerance: data.answerType === "NUMBER" ? data.tolerance : null,
            }
        });

        res.status(201).json(challenge);

    } catch (error) {
        console.error("Create Challenge Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// --- 2. UPDATE CHALLENGE ---
export const updateChallenge = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Bypassing Refinement for updates because .partial() doesn't work on ZodEffects
        const validation = baseChallengeSchema.partial().safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({ error: validation.error.flatten() });
        }

        const challenge = await prisma.analystChallenge.update({
            where: { id },
            data: validation.data
        });

        res.json(challenge);

    } catch (error) {
        if ((error as any).code === 'P2025') {
            return res.status(404).json({ error: "Challenge not found" });
        }
        res.status(500).json({ error: "Update failed" });
    }
};

// --- 3. DELETE (ARCHIVE) CHALLENGE ---
export const deleteChallenge = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // We do NOT delete the row. We just hide it.
        // This preserves the history for students who already solved it.
        const challenge = await prisma.analystChallenge.update({
            where: { id },
            data: { isActive: false }
        });

        res.json({ message: "Challenge archived successfully", id: challenge.id });
    } catch (error) {
        res.status(500).json({ error: "Archive failed" });
    }
};

// --- 4. LIST ALL CHALLENGES (ADMIN VIEW) ---
export const getAllChallenges = async (req: Request, res: Response) => {
    try {
        const challenges = await prisma.analystChallenge.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                creator: {
                    select: { name: true, email: true }
                }
            }
        });
        res.json(challenges);
    } catch (error) {
        res.status(500).json({ error: "Fetch failed" });
    }
};