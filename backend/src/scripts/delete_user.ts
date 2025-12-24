import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];

    if (!email) {
        console.error('❌ Please provide an email address.');
        console.log('Usage: npx ts-node src/scripts/delete_user.ts <email>');
        process.exit(1);
    }

    console.log(`🔍 Looking for user with email: ${email}...`);

    try {
        // First check if user exists
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.error(`❌ User not found with email: ${email}`);
            process.exit(1);
        }

        console.log(`🗑️ Deleting user: ${user.name} (ID: ${user.id})...`);

        // Delete the user (Cascade should handle relations, but let's be safe if schema doesn't have cascades everywhere)
        // Verified schema: CaseSubmission has Cascade. Others might need manual handling if not set to Cascade.
        // Activity/UserBadge don't have explicit Cascade in schema shown earlier, but usually Prisma implies it or throws.
        // Let's rely on Prisma's delete which throws if relations exist without cascade.
        // Actually earlier ProfileService.deleteAccount handled this manually with a transaction.
        // It's safer to use the EXACT same logic as ProfileService to ensure clean cleanup.

        // Replicating ProfileService logic for safety:
        await prisma.$transaction(async (tx) => {
            // 1. Delete all UserBadges
            await tx.userBadge.deleteMany({ where: { userId: user.id } });

            // 2. Delete all Activities
            await tx.activity.deleteMany({ where: { userId: user.id } });

            // 3. Delete all CaseSubmissions
            await tx.caseSubmission.deleteMany({ where: { userId: user.id } });

            // 4. Delete the User record
            await tx.user.delete({ where: { id: user.id } });
        });

        console.log(`✅ User ${email} deleted successfully!`);

    } catch (e) {
        console.error('❌ Error deleting user:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
