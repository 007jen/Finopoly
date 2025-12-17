import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { getAllTimeLeaderboard } from "../services/leaderboard.service";
export const getLeaderboard = async (_req: Request, res: Response) => {
    const leaderboard = await getAllTimeLeaderboard();
    // return res.json({ leaderboard });
    try {
        const users = await prisma.user.findMany({
            orderBy: { xp: "desc" },
            select: {
                id: true,
                // email: true,
                xp: true,
            },
        });

        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            userId: user.id,
            // email: user.email,
            xp: user.xp,
        }));

        res.json({ leaderboard });
    } catch (error) {
        console.error("Leaderboard error:", error);
        res.status(500).json({ error: "Failed to load leaderboard" });
    }
};
