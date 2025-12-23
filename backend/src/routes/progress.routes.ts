import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import {
    getWeeklyXp,
    getStreakCalendar,
    getSubjectAccuracy,
    addXp,
} from "../controllers/progress.controller";

const router = Router();

router.use(requireAuth);

router.get("/weekly-xp", getWeeklyXp);
router.get("/streak", getStreakCalendar);
router.get("/subjects", getSubjectAccuracy);
router.post("/xp", addXp);

export default router;
