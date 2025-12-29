import { prisma } from "../utils/prisma";

export class ProfileService {
    static async getProfileOverview(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                xp: true,
                createdAt: true,
                correctAnswers: true,
                streak: true,
                totalQuestions: true,
                completedSimulations: true,
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
            correctAnswers: user.correctAnswers,
            streak: user.streak,
            totalQuestions: user.totalQuestions,
            completedSimulations: user.completedSimulations
        };
    };


    static async getProfileTimeline(userId: string) {
        const activities = await prisma.activity.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
            select: {
                activityType: true,
                xpEarned: true,
                createdAt: true,
                title: true,
                activityId: true
            },
        });
        return activities.map(a => ({
            label: `${a.activityType.toUpperCase()} completed`,
            xp: a.xpEarned,
            date: a.createdAt,
            title: a.title,
            type: a.activityType,
            id: a.activityId
        }));
    }

    static async getProfileStats(userId: string) {
        const [activityCount, badges,] = await Promise.all([
            prisma.activity.count({ where: { userId } }),
            prisma.userBadge.count({ where: { userId } }),
        ]);
        return {
            activitiesCompleted: activityCount,
            badgesEarned: badges,
        };
    }

    static async resetProgress(userId: string) {
        return prisma.$transaction(async (tx) => {
            // 1. Delete all UserBadges
            await tx.userBadge.deleteMany({ where: { userId } });

            // 2. Delete all Activities
            await tx.activity.deleteMany({ where: { userId } });

            // 3. Delete all CaseSubmissions
            await tx.caseSubmission.deleteMany({ where: { userId } });

            // 4. Reset User stats
            return tx.user.update({
                where: { id: userId },
                data: {
                    xp: 0,
                    streak: 0,
                    lastActivityDate: null,
                },
            });
        });
    }

    static async deleteAccount(userId: string) {
        return prisma.$transaction(async (tx) => {
            // 1. Delete all UserBadges
            await tx.userBadge.deleteMany({ where: { userId } });

            // 2. Delete all Activities
            await tx.activity.deleteMany({ where: { userId } });

            // 3. Delete all CaseSubmissions
            await tx.caseSubmission.deleteMany({ where: { userId } });

            // 4. Delete the User record
            return tx.user.delete({ where: { id: userId } });
        });
    }

    static async getUserBadges(userId: string) {
        // Fetch UserBadges and include the Badge details
        const userBadges = await prisma.userBadge.findMany({
            where: { userId },
            include: { badge: true },
            orderBy: { earnedAt: 'desc' }
        });

        // Map to frontend friendly format
        return userBadges.map(ub => ({
            id: ub.id,
            name: ub.badge.name,
            description: ub.badge.description,
            icon: ub.badge.icon,
            earnedDate: ub.earnedAt.toISOString(),
            xpRequirement: ub.badge.xpRequirement
        }));
    }
    static async incrementCompletedSimulations(userId: string) {
        return prisma.user.update({
            where: { id: userId },
            data: {
                completedSimulations: { increment: 1 }
            }
        });
    }
}
