import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import {
    getChallenge,
    submitSolution,
    surrenderChallenge,
    listChallenges
} from '../controllers/challenge.controller';

const router = Router();

// Base Path: /api/challenges

// 1. List All Active Challenges for the Lobby
router.get('/', requireAuth, listChallenges);

// 2. Get Challenge Data (Images, Description, Previous Status)
router.get('/:id', requireAuth, getChallenge);

// 2. Submit Answer (The Verification)
router.post('/:id/submit', requireAuth, submitSolution);

// 3. Give Up (Unlock Video, 0 XP)
router.post('/:id/surrender', requireAuth, surrenderChallenge);

export default router;