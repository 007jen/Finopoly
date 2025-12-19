import { Request, Response } from "express";
import { caseReviewService } from "../services/caseReview.service";

export const reviewCaseSubmission = async (req: Request, res: Response) => {
    try {
        const { submissionId } = req.params;
        const { score, feedback } = req.body;

        if (typeof score !== "number" || !feedback) {
            return res.status(400).json({ status: "error", error: "Invalid input" })
        }
        const result = await caseReviewService.reviewSubmission(submissionId, score, feedback)
        return res.status(200).json({ status: "success", data: result })
    }
    catch (err: any) {
        if (err.message === "SUBMISSION_NOT_FOUND") {
            return res.status(404).json({ status: "error", error: "Submission not found" })
        }
        if (err.message === "ALREADY_REVIEWED") {
            return res.status(409).json({ status: "error", error: "Submission already reviewed" })
        }
        if (err.message === "INVALID_SCORE") {
            return res.status(400).json({ status: "error", error: "Invalid score" })
        }
        return res.status(500).json({ status: "error", error: "Internal server error" })
    }
}