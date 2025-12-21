import { prisma } from "../utils/prisma";

export class ProfileService {
    static async getProfileOverview(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                xp: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new Error("User not found")
        }

        const currentLevel = Math.floor(user.xp / 500) + 1;
        const nextLevelThreshold = currentLevel * 500;

        return {
            xp: user.xp,
            level: currentLevel,
            xpToNextLevel: Math.max(nextLevelThreshold - user.xp, 0),
            joinedAt: user.createdAt,
        };
    }

    static async getProfileTimeline(userId: string) {
        const activities = await prisma.activity.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
            select: {
                activityType: true,
                xpEarned: true,
                createdAt: true,
            },
        });
        return activities.reverse().map(a => ({// this will reverse the order of the activities like latest first
            label: `${a.activityType.toUpperCase()} completed`,
            xp: a.xpEarned,
            date: a.createdAt,
        }));
    }

    static async getProfileStats(userId: string) {
        const [activityCount, badges,] = await Promise.all([
            prisma.activity.count({ where: { userId } }),
            prisma.userBadge.count({ where: { userId } }),
        ]);
        return {
            activitiesCompleted: activityCount,
            // what is ue of activitiesCompleted instead on stimulationCompleted 
            // stimulationCompleted is not used anywhere whereas activitiesCompleted is used in the frontend 
            badgesEarned: badges,
        };
    }
}
