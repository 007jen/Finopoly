import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { reviewCaseSubmission } from "../controllers/caseReview.controller";
import { requiresAdmin } from "../middleware/adminOnly";

const router = Router();

router.patch(
    "/case-submissions/:submissionId/review",
    requireAuth,
    requiresAdmin,
    reviewCaseSubmission
);

export default router;
