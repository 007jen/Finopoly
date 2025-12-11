import { Request, Response } from 'express';

export const clerkWebhook = (req: Request, res: Response) => {
    // Sync logic
    res.send('Webhook received');
};
