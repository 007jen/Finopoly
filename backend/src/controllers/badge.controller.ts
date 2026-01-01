import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const badgeController = {
    getAllBadges: async (req: Request, res: Response) => {
        try {
            const badges = await prisma.badge.findMany({
                orderBy: { xpRequirement: 'asc' }
            });
            return res.json(badges);
        } catch (error) {
            console.error('[Badges] Error fetching badges:', error);
            return res.status(500).json({ error: 'Failed to fetch badges' });
        }
    }
};
