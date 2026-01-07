import { Request, Response } from "express";
import * as AdminService from "../services/admin.service";

export async function getAdminMetrics(req: Request, res: Response) {
    try {
        const metrics = await AdminService.getPlatformMetrics();
        return res.status(200).json(metrics);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to fetch metrics" });
    }
}

export async function listUsers(req: Request, res: Response) {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = (req.query.search as string) || "";
        const role = req.query.role as string;
        const status = req.query.status as string;

        const result = await AdminService.getUsers(page, limit, search, role, status);
        return res.status(200).json(result);
    } catch (error) {
        console.error("[AdminController] listUsers error:", error);
        return res.status(500).json({ error: "Failed to fetch users" });
    }
}

export async function updateUser(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const result = await AdminService.updateUser(id, req.body);
        return res.status(200).json(result);
    } catch (error) {
        console.error("[AdminController] updateUser error:", error);
        return res.status(500).json({ error: "Failed to update user" });
    }
}

export async function removeUser(req: Request, res: Response) {
    try {
        const { id } = req.params;
        await AdminService.deleteUser(id);
        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("[AdminController] deleteUser error:", error);
        return res.status(500).json({ error: "Failed to delete user" });
    }
}

export async function getUserReport(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const trend = await AdminService.getUserActivityTrend(id);
        return res.status(200).json({ trend });
    } catch (error) {
        console.error("[AdminController] getUserReport error:", error);
        return res.status(500).json({ error: "Failed to fetch user report" });
    }
}