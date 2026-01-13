import { Router } from 'express';
import { createCourse, getCourses, upload } from '../controllers/course.controller';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Public: Get all courses
router.get('/', getCourses);

// Admin: Upload a new course
// POST /api/courses
router.post('/', requireAuth, requireAdmin, upload.single('video'), createCourse);

export default router;
