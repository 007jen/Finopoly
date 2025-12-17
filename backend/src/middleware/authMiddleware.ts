import { Request, Response, NextFunction } from "express";
import { clerk, verifyToken } from "../config/clerk";

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
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");
        if (!token) return res.status(401).json({ error: "No token" });

        const session = await verifyToken(token);
        req.user = { clerkId: session.sub };

        next();
    } catch {
        res.status(401).json({ error: "Unauthorized" });
    }
};
