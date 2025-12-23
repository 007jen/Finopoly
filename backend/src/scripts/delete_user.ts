import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteUser() {
    const email = process.argv[2];

    if (!email) {
        console.error('Please provide an email address as an argument.');
        console.log('Usage: npx ts-node src/scripts/delete_user.ts <email>');
        process.exit(1);
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        console.log(`Found user: ${user.name} (${user.id}). Deleting...`);

        // Perform deletion in a transaction to ensure all or nothing
        await prisma.$transaction(async (tx) => {
            // 1. Delete UserBadges
            const deletedBadges = await tx.userBadge.deleteMany({
                where: { userId: user.id },
            });
            console.log(`- Deleted ${deletedBadges.count} badges`);

            // 2. Delete Activities
            const deletedActivities = await tx.activity.deleteMany({
                where: { userId: user.id },
            });
            console.log(`- Deleted ${deletedActivities.count} activity logs`);

            // 3. Delete CaseSubmissions
            const deletedSubmissions = await tx.caseSubmission.deleteMany({
                where: { userId: user.id },
            });
            console.log(`- Deleted ${deletedSubmissions.count} case submissions`);

            // 4. Delete the User
            await tx.user.delete({
                where: { id: user.id },
            });
            console.log(`- Deleted user record`);
        });

        console.log('✅ User and all related data successfully deleted.');

    } catch (error) {
        console.error('Error deleting user:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

deleteUser();
