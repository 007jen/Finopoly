// controllers/auth.controller.ts
import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { clerk } from "../config/clerk";
import { verifyToken } from "../config/clerk";

export const getMe = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: "Missing Authorization header" });
        }

        const token = authHeader.replace("Bearer ", "");
        const session = await verifyToken(token);

        const clerkId = session.sub;
        const email = session.email as string;// why is this used ? 
        // this is used to get the email of the user from the session 

        const user = await prisma.user.upsert({
            where: { clerkId },
            update: {},
            create: {
                clerkId,
                email,
                role: "student",
            },
        });

        return res.json(user);
    } catch (err) {
        console.error("[AUTH_ME_ERROR]", err);
        return res.status(401).json({ error: "Unauthorized" });
    }
};
