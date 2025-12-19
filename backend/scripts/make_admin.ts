
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // This is the Clerk ID from your token in the previous command
    const clerkId = "user_371JCcIqPA7fkMCznEw5wxIP1zl";

    console.log(`Promoting user ${clerkId} to ADMIN...`);

    const user = await prisma.user.update({
        where: { clerkId },
        data: { role: "admin" },
    });

    console.log("SUCCESS! User is now admin:", user);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
