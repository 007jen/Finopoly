import { Request, Response } from 'express';
import { ProfileService } from '../services/profile.service';

export const getProfileOverview = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const overview = await ProfileService.getProfileOverview(userId);
        return res.json(overview);
    } catch (err: any) {
        console.error("getProfileOverview error", err);
        if (err.message === "User not found") {
            return res.status(404).json({ error: "User not found" });
        }
        return res.status(500).json({ error: "Failed to fetch profile overview" });
    }
};

export const getProfileTimeline = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const timeline = await ProfileService.getProfileTimeline(userId);
        return res.json(timeline);
    } catch (err) {
        console.error("getProfileTimeline error", err);
        return res.status(500).json({ error: "Failed to fetch profile timeline" });
    }
};

export const getProfileStats = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const stats = await ProfileService.getProfileStats(userId);
        return res.json(stats);
    } catch (err) {
        console.error("getProfileStats error", err);
        return res.status(500).json({ error: "Failed to fetch profile stats" });
    }
};  