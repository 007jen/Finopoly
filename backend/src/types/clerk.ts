export interface ClerkWebhookEvent {
    type: string;
    data: ClerkUser;
}

export interface ClerkUser {
    id: string;
    email_addresses: {
        email_address: string;
    }[];
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
}


// src/config/clerk.ts
import { verifyToken } from '@clerk/backend'; // correct named import
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.CLERK_SECRET_KEY) {
    console.warn('CLERK_SECRET_KEY missing in .env');
}

export async function clerkVerifyToken(token: string) {
    // Use Clerk's server-side verifyToken which returns session claims
    return verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY! });
}
