import { prisma } from "../utils/prisma";

export async function getAllTimeLeaderboard(limit = 50) {
    const users = await prisma.user.findMany({
        orderBy: { xp: "desc" },
        take: limit,
        select: {
            id: true,
            name: true,
            email: true,
            xp: true,
            userBadges: {
                select: {
                    badge: {
                        select: {
                            id: true,
                            name: true,
                            icon: true,
                            description: true
                        }
                    }
                }
            }
        },
    });

    return users.map((user, index) => {
        // Calculate dynamic level (Same logic as ProfileService)
        const computedLevel = Math.floor(user.xp / 500) + 1;

        // Determine Display Name
        let displayName = user.name;
        if (!displayName || displayName === "New User") {
            // If name is missing or default, try to make email look presentable
            displayName = user.email.split('@')[0];
        }

        // Flatten badges
        const badges = user.userBadges.map(ub => ub.badge);

        return {
            rank: index + 1,
            userId: user.id,
            name: displayName,
            xp: user.xp,
            level: computedLevel,
            badges: badges,
            badgesCount: badges.length
        };
    });
}
