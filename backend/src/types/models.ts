export interface RequestUser {
    id: string;
    role: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: RequestUser;
        }
    }
}
