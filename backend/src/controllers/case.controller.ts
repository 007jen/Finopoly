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

export const submitCaseAnswer = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const caseId = req.params.id;
        const { answer } = req.body;

        // 1. Auth check
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // 2. Input validation
        if (!answer || typeof answer !== "string" || answer.trim().length < 10) {
            return res.status(400).json({
                error: "Answer must be at least 10 characters",
            });
        }

        // 3. Call service
        await caseService.submitCaseAnswer(userId, caseId, answer.trim());

        return res.status(201).json({ status: "submitted" });
    } catch (err: any) {
        if (err.message === "CASE_NOT_FOUND") {
            return res.status(404).json({ error: "Case not found" });
        }

        if (err.message === "ALREADY_SUBMITTED") {
            return res.status(409).json({ error: "Already submitted" });
        }

        console.error("Submit case error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
