import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { submitCaseAnswer } from "../controllers/case.controller";

const router = Router();

// POST /api/cases/:id/submissions
router.post("/:id/submissions", requireAuth, submitCaseAnswer);

export default router;
