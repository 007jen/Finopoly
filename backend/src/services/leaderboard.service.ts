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
            streak: true,
            completedSimulations: true,
            correctAnswers: true,
            totalQuestions: true,
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
        // Calculate dynamic level
        const computedLevel = Math.floor(user.xp / 500) + 1;

        // Calculate Accuracy
        const accuracy = user.totalQuestions > 0
            ? Math.round((user.correctAnswers / user.totalQuestions) * 100)
            : 0;

        // Determine Display Name
        let displayName = user.name;
        if (!displayName || displayName === "New User") {
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
            streak: user.streak,
            simulations: user.completedSimulations,
            accuracy: accuracy,
            badges: badges,
            badgesCount: badges.length
        };
    });
}
