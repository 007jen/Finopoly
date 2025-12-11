import { Request, Response, NextFunction } from 'express';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Implement Clerk verification
    // const token = req.headers.authorization?.split(' ')[1];
    // if (!token) return res.status(401).json({ error: 'Unauthorized' });

    next();
};
