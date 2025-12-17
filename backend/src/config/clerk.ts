import { createClerkClient, verifyToken as clerkVerifyToken } from "@clerk/backend";

export const clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
});

export const verifyToken = async (token: string) => {
    // verifying token usually requires key or client
    // @clerk/backend verifyToken signature might vary, usually takes token and options
    return clerkVerifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
};

export interface ClerkWebhookEvent {
    type: string;
    data: any;
}
