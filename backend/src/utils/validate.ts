import { z } from 'zod';

export const validate = (schema: z.ZodSchema) => (req: any, res: any, next: any) => {
    try {
        schema.parse(req.body);
        next();
    } catch (err) {
        res.status(400).json(err);
    }
};
