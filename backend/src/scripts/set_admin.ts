
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'accuracy@castudent.com'; // Hardcoded for now based on typical seed or I can findFirst

    // Try to find ANY user to promote if not specific
    // But let's look for the one likely logged in or just the most recent one
    const user = await prisma.user.findFirst({
        orderBy: { updatedAt: 'desc' }
    });

    if (!user) {
        console.log('No user found');
        return;
    }

    console.log(`Promoting user ${user.name} (${user.email}) to Admin...`);

    await prisma.user.update({
        where: { id: user.id },
        data: { role: 'admin' }
    });

    console.log('User promoted successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
