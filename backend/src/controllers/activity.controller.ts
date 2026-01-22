


import { Request, Response } from "express";
import { recordActivity, getUserActivities } from "../services/activity.service";
import { ActivityType } from "@prisma/client";

export const completeActivity = async (req: Request, res: Response) => {
    const reqId = Math.random().toString(36).substring(7);
    const userId = req.user?.id;


    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { type, referenceId, score, correctIncrement, totalIncrement, xpEarned } = req.body;

    if (!type || !referenceId) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    if (!Object.values(ActivityType).includes(type)) {
        return res.status(400).json({ error: "Invalid activity type" });
    }

    try {
        const result = await recordActivity({
            userId,
            type,
            referenceId,
            score: score || 0,
            correctIncrement: correctIncrement !== undefined ? Number(correctIncrement) : undefined,
            totalIncrement: totalIncrement !== undefined ? Number(totalIncrement) : undefined,
            xpEarned: xpEarned !== undefined ? Number(xpEarned) : undefined
        });

        return res.json(result);
    } catch (err: any) {
        return res.status(400).json({
            error: err.message,
            debugId: reqId
        });
    }
};

export const getActivities = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        // @ts-ignore
        const activities = await getUserActivities(userId);
        return res.json(activities);
    } catch (err) {
        return res.status(500).json({ error: "Failed to fetch activities" });
    }
};
