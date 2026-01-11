
import express from 'express';
import { getPlayableCases, getPlayableCaseById, listCatalog, createAuditCase, listAuditCases, updateAuditCase, deleteAuditCase, completeSession } from '../controllers/audit.controller';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Public / Student Routes
router.get('/playable', requireAuth, getPlayableCases);
router.get('/catalog', requireAuth, listCatalog);
router.post('/complete', requireAuth, completeSession);
router.get('/playable/:id', requireAuth, getPlayableCaseById);

/* --- AZURE CLOUD START --- */
import { analyzeInvoice } from '../controllers/audit.controller';
router.post('/analyze-invoice', requireAuth, analyzeInvoice);
/* --- AZURE CLOUD END --- */


// Admin Routes
router.post('/create', requireAuth, requireAdmin, createAuditCase);
router.get('/list', requireAuth, requireAdmin, listAuditCases);
router.put('/:id', requireAuth, requireAdmin, updateAuditCase);
router.delete('/:id', requireAuth, requireAdmin, deleteAuditCase);

export default router;
