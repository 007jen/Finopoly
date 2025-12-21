import { prisma } from "../utils/prisma";

interface EnsureUserInput {
    clerkId: string;
    email?: string;
    name?: string;
}
export async function ensureUserExists({
    clerkId, email, name,
}: EnsureUserInput) {
    let user = await prisma.user.findUnique({
        where: { clerkId },
    });
    if (!user) {
        user = await prisma.user.create({
            data: {
                clerkId,
                email: email ?? "",
                name: name ?? "New User",
                role: "student",
            },
        });
    }
    return user;
}