import { Prisma, PrismaClient } from "@prisma/client";

// Define strict types for the transaction client
type TxClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

export class BadgeService {
    /**
     * Checks if the user qualifies for any new badges based on their NEW TOTAL XP.
     * Awards them if they don't have them yet.
     */
    static async checkAndAwardBadges(tx: TxClient, userId: string, totalXp: number) {
        // 1. Fetch ALL eligible badges from the DB based on XP Requirement
        const eligibleBadges = await tx.badge.findMany({
            where: {
                xpRequirement: { lte: totalXp }
            }
        });

        if (eligibleBadges.length === 0) return [];

        // 2. Fetch existing badges for this user to avoid duplicates
        const ownedUserBadges = await tx.userBadge.findMany({
            where: { userId },
            select: { badgeId: true }
        });
        const ownedBadgeIds = new Set(ownedUserBadges.map(ub => ub.badgeId));

        // 3. Determine new badges to award
        const newBadgesToAward = eligibleBadges.filter(b => !ownedBadgeIds.has(b.id));

        if (newBadgesToAward.length === 0) return [];

        // 4. Award them atomically
        await tx.userBadge.createMany({
            data: newBadgesToAward.map(b => ({
                userId,
                badgeId: b.id
            }))
        });

        console.log(`[Badges] Awarded ${newBadgesToAward.length} new badges to user ${userId}`);
        return newBadgesToAward;
    }
}
