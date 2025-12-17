import { Request, Response } from "express";
import { Webhook } from "svix";
import { prisma } from "../utils/prisma";
import { ClerkWebhookEvent } from "../types/clerk";

const verifySvix = (req: Request) => {
    const svixId = req.headers["svix-id"] as string;
    const svixTimestamp = req.headers["svix-timestamp"] as string;
    const svixSignature = req.headers["svix-signature"] as string;

    if (!svixId || !svixTimestamp || !svixSignature) {
        throw new Error("Missing svix headers");
    }

    if (!process.env.CLERK_WEBHOOK_SECRET) {
        throw new Error("Missing CLERK_WEBHOOK_SECRET in environment");
    }

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    return wh.verify(req.body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
};

export const clerkWebhook = async (req: Request, res: Response) => {
    try {
        const evt = verifySvix(req);

        if (evt.type === "user.created" || evt.type === "user.updated") {
            const user = evt.data;

            await prisma.user.upsert({
                where: { clerkId: user.id },
                update: {
                    email: user.email_addresses?.[0]?.email_address,
                },
                create: {
                    clerkId: user.id,
                    email: user.email_addresses?.[0]?.email_address,
                    role: "student",
                },
            });
        }

        res.status(200).json({ ok: true });
    } catch (err) {
        console.error("[WEBHOOK_FAILED_NON_BLOCKING]", err);
        // IMPORTANT: still return 200 so Clerk doesn't retry forever
        res.status(200).json({ ok: true });
    }
};

