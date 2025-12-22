
// export async function requireAuth(
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) {
//     try {
//         const header = req.headers.authorization;
//         if (!header) return res.status(401).json({ error: "Missing token" });

//         const token = header.replace("Bearer ", "");
//         const session = await verifyToken(token, {
//             secretKey: process.env.CLERK_SECRET_KEY!,
//         });

//         // Align with RequestUser type: id is the clerkId (sub)
//         req.user = {
//             id: session.sub,
//             // Add other fields if available in session claims, e.g.
//             // role: session.metadata?.role 
//         };

//         next();
//     } catch (err) {
//         console.error("Auth Error:", err);
//         res.status(401).json({ error: "Unauthorized" });
//     }
// }


// middleware/authMiddleware.ts
import { prisma } from "../utils/prisma";

import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../config/clerk";
// import { verifyToken } from "@clerk/clerk-sdk-node";
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Missing or invalid token" });
        }
        const token = authHeader.split(" ")[1];

        const session = await verifyToken(token);
        const clerkId = session.sub as string;
        const email = session.email as string | undefined;
        const name = session.name as string | undefined;

        // 1. Try to find user
        let user = await prisma.user.findUnique({
            where: { clerkId }
        });

        // 2. If missing → fallback create (THIS is where upsert goes)
        if (!user) {
            user = await prisma.user.upsert({
                where: { clerkId },
                update: {},
                create: {
                    clerkId,
                    email: email ?? `${clerkId}@placeholder.finopoly`,
                    name: name ?? "New User",
                    role: "student",
                },
            });
        }

        // 3. Attach to req
        req.user = user;
        next();
    } catch (err) {
        console.error("Auth Error:", err);
        res.status(401).json({ error: "Unauthorized" });
    }
}



// export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const token = req.headers.authorization?.replace("Bearer ", "");
//         if (!token) return res.status(401).json({ error: "No token" });

//         const session = await verifyToken(token);

//         // Find user in DB
//         const user = await prisma.user.findUnique({
//             where: { clerkId: session.sub }
//         });

//         if (!user) {
//             return res.status(401).json({ error: "User not found in database" });
//         }

//         req.user = user;

//         next();
//     } catch (err) {
//         console.error("Auth error:", err);
//         res.status(401).json({ error: "Unauthorized" });
//     }
// };
