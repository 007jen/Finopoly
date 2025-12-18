import { Router } from "express";
import { getCases, getCaseById } from "../controllers/case.controller";

const router = Router();
router.get("/", getCases);
router.get("/:id", getCaseById);

export default router;