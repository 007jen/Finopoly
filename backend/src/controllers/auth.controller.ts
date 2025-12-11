import { Request, Response } from 'express';

export const authController = {
    me: (req: Request, res: Response) => {
        res.json({ user: req.user });
    }
};
