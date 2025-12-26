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
        return res.status(500).json({ error: "Failed to fetch profile overview", details: err.message });
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

export const resetProgress = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        await ProfileService.resetProgress(userId);
        return res.json({ message: "Progress reset successfully" });
    } catch (err) {
        console.error("resetProgress error", err);
        return res.status(500).json({ error: "Failed to reset progress" });
    }
};

export const deleteAccount = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        await ProfileService.deleteAccount(userId);
        return res.json({ message: "Account deleted successfully" });
    } catch (err) {
        console.error("deleteAccount error", err);
        return res.status(500).json({ error: "Failed to delete account" });
    }
}


export const getUserBadges = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const badges = await ProfileService.getUserBadges(userId);
        return res.json(badges);
    } catch (err) {
        console.error("getUserBadges error", err);
        return res.status(500).json({ error: "Failed to fetch user badges", details: (err as any).message });
    }
};

export const incrementSimulations = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        await ProfileService.incrementCompletedSimulations(userId);
        return res.json({ message: "Simulation count incremented" });
    } catch (err) {
        console.error("incrementSimulations error", err);
        return res.status(500).json({ error: "Failed to increment simulations" });
    }
};