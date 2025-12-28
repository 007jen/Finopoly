import { Prisma, PrismaClient } from "@prisma/client";

// Define strict types for the transaction client
type TxClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

export class BadgeService {
    /**
     * Checks if the user qualifies for any new badges based on their NEW TOTAL XP.
     * Awards them if they don't have them yet.
     */
    static async checkAndAwardBadges(tx: TxClient, userId: string, totalXp: number) {
        const badgesToAward: string[] = [];

        // 1. Define Badge Milestones (Hardcoded for now, or fetch from DB cache)
        if (totalXp >= 500) badgesToAward.push("Novice Auditor");
        if (totalXp >= 1000) badgesToAward.push("Apprentice");
        if (totalXp >= 2500) badgesToAward.push("Audit Pro");
        if (totalXp >= 5000) badgesToAward.push("Master of Coin");
        if (totalXp >= 10000) badgesToAward.push("Grandmaster");

        // 2. Fetch existing badges for this user to avoid duplicates
        const userBadges = await tx.userBadge.findMany({
            where: { userId },
            include: { badge: true }
        });
        const ownedBadgeNames = new Set(userBadges.map(ub => ub.badge.name));

        // 3. Determine new badges
        const newBadgeNames = badgesToAward.filter(name => !ownedBadgeNames.has(name));

        if (newBadgeNames.length === 0) return [];

        // 4. Award them
        const awarded = [];
        for (const badgeName of newBadgeNames) {
            // Find the badge definition in DB
            const badgeDef = await tx.badge.findUnique({ where: { name: badgeName } });

            if (badgeDef) {
                await tx.userBadge.create({
                    data: {
                        userId,
                        badgeId: badgeDef.id
                    }
                });
                awarded.push(badgeDef);
            }
        }

        return awarded;
    }
}
