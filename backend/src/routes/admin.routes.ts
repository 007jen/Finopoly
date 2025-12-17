import { Router } from "express";
import { getAdminMetrics } from "../controllers/admin.controller";
import { requireAuth } from "../middleware/authMiddleware";
import { requiresAdmin } from "../middleware/adminOnly";

const router = Router();

/**
 * Admin Analytics (Read-Only)
 */
router.get(
    "/metrics",
    requireAuth,
    requiresAdmin,
    getAdminMetrics
);

export default router;
