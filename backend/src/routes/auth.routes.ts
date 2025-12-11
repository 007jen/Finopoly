import { Router } from 'express';
import { authController } from '../controllers/auth.controller';

const router = Router();

router.get('/me', authController.me);

export default router;
