import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import {
    getWeeklyXp,
    getStreakCalendar,
    getSubjectAccuracy,
    addXp,
    updateAccuracy,
    logActivity,
    getDailyGoals,
    getWeeklyGoals
} from "../controllers/progress.controller";

const router = Router();

router.use(requireAuth);

// Daily Goals (Auto-checkin)
router.get('/goals', getDailyGoals);
router.get('/weekly-goals', getWeeklyGoals);

router.get("/weekly-xp", getWeeklyXp);
router.get("/streak", getStreakCalendar);
router.get("/subjects", getSubjectAccuracy);
router.post("/xp", addXp);
router.post("/accuracy", updateAccuracy);
// router.post("/activity", logActivity);

export default router;
