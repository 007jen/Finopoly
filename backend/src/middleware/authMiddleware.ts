
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
import { ensureUserExists } from "../services/user.service";
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../config/clerk";
// import { verifyToken } from "@clerk/clerk-sdk-node";
export async function requireAuth(req: Request, res: Response, next: NextFunction   ){
    try {
        const authHeader =req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({error:"Missing or invalid token"});
        }
    const token = authHeader.split(" ")[1];
    
    const session = await verifyToken(token);

    const dbuser = await ensureUserExists({
        clerkId: session.sub as string,
        email: session.email as string | undefined,
        name: session.name as string | undefined,
    });
    req.user = dbuser;
    next(); 
    } catch (err) 
    {
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
