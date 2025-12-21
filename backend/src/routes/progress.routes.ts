import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import {
    getWeeklyXp,
    getStreakCalendar,
    getSubjectAccuracy,
} from "../controllers/progress.controller";

const router = Router();

router.use(requireAuth);

router.get("/weekly-xp", getWeeklyXp);
router.get("/streak", getStreakCalendar);
router.get("/subjects", getSubjectAccuracy);

export default router;
