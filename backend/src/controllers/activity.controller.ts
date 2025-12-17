// import { Request, Response } from "express";
// import { recordActivity } from "../services/activity.service";

// const allowedTypes = ["quiz", "audit", "tax", "caselaw"];
// export const logActivity = async (req: Request, res: Response) => {
//     try {
//         const userId = req.user?.clerkId;
//         const { type, referenceId, xpEarned, score } = req.body;

//         if (!type || !referenceId || !xpEarned || !score) {
//             return res.status(400).json({ error: "Missing fields" });
//         }// this function is used to validate the activity type it checks if the required fields are present

//         if (!allowedTypes.includes(type)) {
//             return res.status(400).json({ error: "Invalid activity type" });
//         } // this function is used to validate the activity type it checks if the activity type is allowed

//         const activity = await recordActivity({
//             clerkId: userId!,// what is this ?   
//             type,
//             referenceId,
//             xpEarned,
//             score,
//         });

//         res.status(201).json(activity);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Activity failed" });
//     }
// };


import { Request, Response } from "express";
import { recordActivity, getUserActivities } from "../services/activity.service";
import { ActivityType } from "@prisma/client";

export const completeActivity = async (req: Request, res: Response) => {
    // AUTH BOUNDARY
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    // PRESENCE VALIDATION
    const { type, referenceId } = req.body;
    if (!type || !referenceId) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // ENUM VALIDATION
    if (!Object.values(ActivityType).includes(type)) {
        return res.status(400).json({ error: "Invalid activity type" });
    }

    try {
        const result = await recordActivity({
            userId,
            type,
            referenceId,
        });

        return res.json(result);
    } catch (err: any) {
        return res.status(400).json({ error: err.message });
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
