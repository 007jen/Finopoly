import { Router } from "express";
import { completeActivity, getActivities } from "../controllers/activity.controller";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

// POST — user completes activity
router.post("/", requireAuth, completeActivity);

// GET — user activity history
router.get("/", requireAuth, getActivities);

export default router;
