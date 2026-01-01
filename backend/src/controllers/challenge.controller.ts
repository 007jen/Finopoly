import { Request, Response } from 'express';
import { challengeService } from '../services/challenge.service';

const getUserId = (req: Request) => req.user?.clerkId || (req as any).auth?.userId;

export const getChallenge = async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized: No user found" });
    }

    try {
        const { id } = req.params;
        const data = await challengeService.getChallenge(userId, id);

        if (!data) return res.status(404).json({ error: "Challenge not found" });

        res.json(data);
    } catch (error) {
        console.error("Get Challenge Error:", error);
        res.status(500).json({ error: "Failed to load challenge" });
    }
};

export const submitSolution = async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
        const { id } = req.params;
        const { answer } = req.body;

        if (!answer) return res.status(400).json({ error: "Answer is required" });

        const result = await challengeService.verifyAttempt(userId, id, answer);

        res.json({
            success: result.isCorrect,
            videoUrl: result.videoUrl,
            newBadges: result.newBadges,
            message: result.isCorrect ? "Correct! Analysis verified." : "Incorrect. Check your calculations."
        });
    } catch (error) {
        console.error("Submit Error:", error);
        res.status(500).json({ error: "Failed to verify solution" });
    }
};

export const surrenderChallenge = async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
        const { id } = req.params;
        const result = await challengeService.surrender(userId, id);

        res.json({ success: true, videoUrl: result.videoUrl });
    } catch (error) {
        res.status(500).json({ error: "Failed to surrender" });
    }
};

export const listChallenges = async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
        const challenges = await challengeService.listChallenges(userId);
        res.json(challenges);
    } catch (error) {
        console.error("List Challenges Error:", error);
        res.status(500).json({ error: "Failed to list challenges" });
    }
};
