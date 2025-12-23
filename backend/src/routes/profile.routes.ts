import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import {
    getProfileOverview,
    getProfileTimeline,
    getProfileStats,
    resetProgress,
    deleteAccount,
    getUserBadges
} from "../controllers/profile.controller";

const router = Router();

router.use(requireAuth);

router.get("/overview", getProfileOverview);
router.get("/timeline", getProfileTimeline);
router.get("/stats", getProfileStats);

// Account Management
router.post("/reset", resetProgress);
router.delete("/delete", deleteAccount);

router.get("/badges", getUserBadges);

export default router;
