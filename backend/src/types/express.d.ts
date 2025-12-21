// src/types/express.d.ts
import { RequestUser } from './requestUser';
import { User } from '@prisma/client';

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

export { };
