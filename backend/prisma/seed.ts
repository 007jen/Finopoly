import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    await prisma.user.upsert({
        where: { email: "admin@finopoly.com" },
        update: {
            role: "admin",
        },
        create: {
            clerkId: "local-admin-seed",
            email: "admin@finopoly.com",
            role: "admin",
            xp: 0,
            streak: 0,
        },
    });

    console.log("Admin user seeded");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
