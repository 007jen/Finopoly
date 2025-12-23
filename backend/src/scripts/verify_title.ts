
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("Checking Prisma Client for 'title' field...");
    try {
        // Intentionally try to select 'title' to fail if it doesn't exist (in TS) 
        // or at runtime if DB doesn't have it (though findFirst won't fail if column missing unless querying).
        // Actually, if I write this in TS, and compile, it checks types.
        // But I am running with ts-node.
        const activity = await prisma.activity.findFirst({
            select: { id: true, title: true }
        });
        console.log("Activity fetch success:", activity);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
