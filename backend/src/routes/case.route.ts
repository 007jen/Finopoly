import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { getCases, getCaseById, submitCaseAnswer } from "../controllers/case.controller";

const router = Router();

router.get("/", getCases);
router.get("/:id", getCaseById);

// POST /api/cases/:id/submissions
router.post("/:id/submissions", requireAuth, submitCaseAnswer);

export default router;
