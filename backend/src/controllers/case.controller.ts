import { Request, Response } from "express";
import { caseService } from "../services/case.service";

export const getCases = async (_req: Request, res: Response) => {
    try {
        const cases = await caseService.getAllCases();
        res.json(cases);
    } catch (err) {
        console.error("Get cases failed:", err);
        res.status(500).json({ error: "Failed to fetch cases" });
    }
};

export const getCaseById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Case ID is required" });
        }

        const caseData = await caseService.getCaseById(id);
        if (!caseData) {
            return res.status(404).json({ error: "Case not found" });
        }

        res.json(caseData);
    } catch (err) {
        console.error("Get case failed:", err);
        res.status(500).json({ error: "Failed to fetch case" });
    }
};
