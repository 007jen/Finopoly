// src/types/express.d.ts
import { RequestUser } from './requestUser';

declare global {
    namespace Express {
        interface Request {
            user?: RequestUser;
        }
    }
}

export { };
