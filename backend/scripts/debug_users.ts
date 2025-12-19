
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("--- DEBUG: LISTING USERS ---");
    const users = await prisma.user.findMany();
    console.log(users);
    console.log("----------------------------");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
