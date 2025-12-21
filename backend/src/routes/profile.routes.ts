import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import {
    getProfileOverview,
    getProfileTimeline,
    getProfileStats,
} from "../controllers/profile.controller";

const router = Router();

router.use(requireAuth);

router.get("/overview", getProfileOverview);
router.get("/timeline", getProfileTimeline);
router.get("/stats", getProfileStats);

export default router;
