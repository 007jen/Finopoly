// // src/middleware/adminOnly.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

// export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const userId = req.user?.id;
//         if (!userId) return res.status(401).json({ error: 'Unauthorized' });

//         const user = await prisma.user.findUnique({ where: { clerkId: userId } });
//         if (!user || user.role !== 'admin') {
//             return res.status(403).json({ error: 'Forbidden' });
//         }

//         return next();
//     } catch (err) {
//         console.error('[ADMIN CHECK]', err);
//         return res.status(500).json({ error: 'Server error' });
//     }
// };

// middleware/adminOnly.ts
// export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
//     const clerkId = req.user?.clerkId;
//     if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

//     const user = await prisma.user.findUnique({ where: { clerkId } });
//     if (user?.role !== "admin") {
//         return res.status(403).json({ error: "Forbidden" });
//     }

//     return next();
// };


export async function requiresAdmin(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });
        if (!user || user.role !== "admin") {
            return res.status(403).json({ error: "Forbidden" });
        }

        next();
    } catch (err) {
        console.error("[ADMIN CHECK] failed", err);
        return res.status(500).json({ error: "Server error" });
    }
}   