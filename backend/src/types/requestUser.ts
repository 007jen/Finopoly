// src/types/requestUser.ts
export interface RequestUser {
    clerkId: string;           // Clerk user ID (sub)
    email?: string;
    role?: 'student' | 'admin';
    [k: string]: any;
}
