import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/authMiddleware'; // You must have this middleware!
import {
    createChallenge,
    updateChallenge,
    deleteChallenge,
    getAllChallenges
} from '../controllers/adminChallenge.controller';

const router = Router();

// 🔒 GLOBAL LOCK: All routes below this line require Admin Role
router.use(requireAuth, requireAdmin);

router.get('/', getAllChallenges);     // List All
router.post('/', createChallenge);      // Create
router.put('/:id', updateChallenge);    // Edit
router.delete('/:id', deleteChallenge); // Archive

export default router;