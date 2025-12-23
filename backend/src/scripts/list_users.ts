import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
        });

        console.log('\n--- All Users ---');
        if (users.length === 0) {
            console.log('No users found.');
        } else {
            console.table(users.map(u => ({
                id: u.id,
                email: u.email,
                name: u.name,
                xp: u.xp,
                streak: u.streak,
                clerkId: u.clerkId
            })));
        }
        console.log('-----------------\n');
    } catch (error) {
        console.error('Error listing users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
