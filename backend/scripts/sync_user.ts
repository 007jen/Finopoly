
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const clerkId = "user_371JCcIqPA7fkMCznEw5wxIP1zl";
    const email = "manual_sync@finopoly.com"; // Placeholder email

    console.log(`Creating/Syncing user ${clerkId} as ADMIN...`);

    const user = await prisma.user.upsert({
        where: { clerkId },
        update: { role: "admin" }, // Force admin if exists
        create: {
            clerkId,
            email,
            role: "admin",
            xp: 0,
            streak: 0,
        },
    });

    console.log("SUCCESS! User Synced & Promoted:", user);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
