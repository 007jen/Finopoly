import { Request, Response } from "express";
import { getAllTimeLeaderboard } from "../services/leaderboard.service";

export const getLeaderboard = async (_req: Request, res: Response) => {
    try {
        const leaderboard = await getAllTimeLeaderboard();
        res.json({ leaderboard });
    } catch (error) {
        console.error("Leaderboard error:", error);
        res.status(500).json({ error: "Failed to load leaderboard" });
    }
};
