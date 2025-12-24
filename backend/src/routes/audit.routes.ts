
import express from 'express';
import { getPlayableCases, getPlayableCaseById, listCatalog, createAuditCase, listAuditCases, updateAuditCase, deleteAuditCase } from '../controllers/audit.controller';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Public / Student Routes
router.get('/play', requireAuth, getPlayableCases);
router.get('/catalog', requireAuth, listCatalog);
router.get('/:id/play', requireAuth, getPlayableCaseById);

// Admin Routes
router.post('/create', requireAuth, requireAdmin, createAuditCase);
router.get('/list', requireAuth, requireAdmin, listAuditCases);
router.put('/:id', requireAuth, requireAdmin, updateAuditCase);
router.delete('/:id', requireAuth, requireAdmin, deleteAuditCase);

export default router;
