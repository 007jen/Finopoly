import express from 'express';
import {
    getPlayableSimulations,
    getSimulationById,
    listTaxSimulations,
    createTaxSimulation,
    updateTaxSimulation,
    deleteTaxSimulation
} from '../controllers/tax.controller';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Public / Student Routes
router.get('/playable', requireAuth, getPlayableSimulations);
router.get('/playable/:id', requireAuth, getSimulationById);

// Admin Routes
router.get('/list', requireAuth, requireAdmin, listTaxSimulations);
router.post('/create', requireAuth, requireAdmin, createTaxSimulation);
router.put('/:id', requireAuth, requireAdmin, updateTaxSimulation);
router.delete('/:id', requireAuth, requireAdmin, deleteTaxSimulation);

export default router;
