import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import {
    getProfileOverview,
    getProfileTimeline,
    getProfileStats,
    resetProgress,
    deleteAccount,

    getUserBadges,
    incrementSimulations
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
router.post("/simulations/increment", incrementSimulations);

export default router;
