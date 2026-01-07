import { Router } from "express";
import { getAdminMetrics, listUsers, updateUser, removeUser, getUserReport } from "../controllers/admin.controller";
import { requireAuth } from "../middleware/authMiddleware";
import { requiresAdmin } from "../middleware/adminOnly";

const router = Router();

/**
 * Admin Analytics (Read-Only)
 */
router.get("/metrics", requireAuth, requiresAdmin, getAdminMetrics);

/**
 * User Management
 */
router.get("/users", requireAuth, requiresAdmin, listUsers);
router.put("/users/:id", requireAuth, requiresAdmin, updateUser);
router.delete("/users/:id", requireAuth, requiresAdmin, removeUser);
router.get("/users/:id/report", requireAuth, requiresAdmin, getUserReport);

export default router;
