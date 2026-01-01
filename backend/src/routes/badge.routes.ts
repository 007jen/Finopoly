import { Router } from 'express';
import { badgeController } from '../controllers/badge.controller';

const router = Router();

router.get('/', badgeController.getAllBadges);

export default router;
