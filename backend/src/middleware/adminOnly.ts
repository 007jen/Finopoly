import { Request, Response, NextFunction } from 'express';

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    // Check user role from req.user (populated by auth middleware)
    // if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    next();
};
