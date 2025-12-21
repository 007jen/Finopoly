import { ProgressService } from "../services/progress.service";
import { Request, Response } from 'express';

export const getWeeklyXp = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const data = await ProgressService.getWeeklyXp(userId);
        return res.status(200).json(data);
    } catch (err) {
        console.error("getWeeklyXp error", err);
        return res.status(500).json({ error: "Failed to fetch weekly XP" });
    }
}
export const getStreakCalendar = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const data = await ProgressService.getStreakCalendar(userId);
        return res.json({ activeDates: data });
    } catch (err) {
        console.error("getStreakCalendar error", err);
        return res.status(500).json({ error: "Failed to fetch streak calendar" });
    }
}

export const getSubjectAccuracy = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const accuracy = await ProgressService.getSubjectAccuracy(userId);
        return res.json(accuracy);
    } catch (err) {
        console.error("getSubjectAccuracy error", err);
        return res.status(500).json({ error: "Failed to fetch subject accuracy" });
    }
};
