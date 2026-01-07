import { ProgressService } from "../services/progress.service";
import { Request, Response } from 'express';

// Weekly Goals
export const getWeeklyGoals = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const goals = await ProgressService.getWeeklyGoals(userId);
        return res.json(goals);
    } catch (err: any) {
        console.error("getWeeklyGoals error", err);
        return res.status(500).json({ error: "Failed to fetch weekly goals", details: err.message });
    }
};

export const getDailyGoals = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const goals = await ProgressService.getDailyGoals(userId);
        return res.json(goals);
    } catch (err: any) {
        console.error("getDailyGoals error", err);
        return res.status(500).json({ error: "Failed to fetch daily goals", details: err.message });
    }
};

export const getWeeklyXp = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const data = await ProgressService.getWeeklyXp(userId);
        return res.status(200).json(data);
    } catch (err: any) {
        console.error("getWeeklyXp error", err);
        if (err.message === "User not found") {
            return res.status(404).json({ error: "User not found" });
        }
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

export const addXp = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { amount, source } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!amount || !source) {
            return res.status(400).json({ message: "Amount and source are required" });
        }

        const data = await ProgressService.addXp(userId, Number(amount), String(source));
        return res.status(200).json(data);
    } catch (err: any) {
        console.error("Error adding XP:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const updateAccuracy = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { isCorrect } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (typeof isCorrect !== 'boolean') {
            return res.status(400).json({ message: "isCorrect boolean is required" });
        }

        const data = await ProgressService.updateAccuracy(userId, isCorrect);
        return res.status(200).json(data);
    } catch (err: any) {
        console.error("Error updating accuracy:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const logActivity = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { seconds } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (typeof seconds !== 'number' || seconds < 0) {
            return res.status(400).json({ message: "Seconds (number >= 0) is required" });
        }

        const data = await ProgressService.logActivity(userId, seconds);
        return res.status(200).json(data);
    } catch (err: any) {
        console.error("Error logging activity:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}
