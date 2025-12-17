import { prisma } from "../utils/prisma";
export async function getPlatformMetrics() {
    const totalUsers = await prisma.user.count();

    const totalActivities = await prisma.activity.count();

    const xpAggregate = await prisma.activity.aggregate({
        _sum: {
            xpEarned: true,
        },
    });
    const totalXp = xpAggregate._sum.xpEarned ?? 0;

    const avgXpPerUser =
        totalUsers > 0 ? Math.floor(totalXp / totalUsers) : 0;

    return {
        totalUsers,
        totalActivities,
        totalXp,
        avgXpPerUser,
    };
}
