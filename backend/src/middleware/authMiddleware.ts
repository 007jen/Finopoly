
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
        // Construct name from parts if full name isn't directly available
        const name = (session.name as string) ||
            (`${session.given_name || ''} ${session.family_name || ''}`.trim()) ||
            undefined;

        // 1. Try to find user
        let user = await prisma.user.findUnique({
            where: { clerkId }
        });

        // 1.5 Sync email if user exists but has placeholder
        if (user && user.email.includes("@placeholder.finopoly") && email) {
            user = await prisma.user.update({
                where: { clerkId },
                data: { email: email, name: name || user.name },
            });
        }

        // 2. If missing → Check by EMAIL first (Account Linking) to avoid unique constraint error
        if (!user && email) {
            const userByEmail = await prisma.user.findUnique({
                where: { email }
            });

            if (userByEmail) {
                // Link the new Clerk ID to the existing user record
                user = await prisma.user.update({
                    where: { email }, // or id: userByEmail.id
                    data: {
                        clerkId: clerkId,
                        name: name || userByEmail.name,
                        avatar: session.image_url as string | undefined
                    }
                });
            }
        }

        // 3. If still missing → Create new user
        if (!user) {
            user = await prisma.user.create({
                data: {
                    clerkId,
                    email: email ?? `${clerkId}@placeholder.finopoly`,
                    name: name ?? "New User",
                    role: "student",
                    // avatar: session.image_url // Optional if you have avatar field
                },
            });
        }

        // 3. Attach to req
        req.user = user;
        next();
    } catch (err) {
        console.error("Auth Error:", err);
        res.status(401).json({ error: "Unauthorized", details: err instanceof Error ? err.message : String(err) });
    }
}

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Simple role check
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: "Forbidden: Admins only" });
        }

        next();
    } catch (err) {
        console.error("Admin Auth Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



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
