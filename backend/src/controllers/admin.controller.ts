import { Request, Response } from "express";
import { getPlatformMetrics } from "../services/admin.service";

export async function getAdminMetrics(req: Request, res: Response) {
    try {
        const metrics = await getPlatformMetrics();
        return res.status(200).json(metrics);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to fetch metrics" });
    }
}   