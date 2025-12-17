// src/routes/auth.routes.ts (excerpt)
import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { requireAuth } from '../middleware/authMiddleware';
import { getMe } from '../controllers/auth.controller';

const router = Router();

router.get('/me', requireAuth, getMe);


router.get('/me', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            include: {
                userBadges: {
                    include: { badge: true }
                },
                // include other relations that exist in schema
            }
        });

        return res.json(user);
    } catch (err) {
        console.error('/me error', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

export default router;


// routes/auth.routes.ts
// router.get("/me", requireAuth, getMe);

// export default router;
