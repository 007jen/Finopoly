import { startOfWeek, endOfWeek } from "date-fns";
import { prisma } from "../utils/prisma";
import { BadgeService } from "./badge.service";

export class ProgressService {

    static async getWeeklyXp(userId: string) {
        const now = new Date()
        const weekStart = startOfWeek(now, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 0 });

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new Error("User not found");
        }

        const activities = await prisma.activity.findMany({
            where: {
                userId,
                createdAt: {
                    gte: weekStart,
                    lte: weekEnd,
                },
            },
            select: {
                xpEarned: true, // XP earned for each activity
                createdAt: true, // Activity creation date
            },
        });

        // Initialize daily XP array
        const dailyXp = [0, 0, 0, 0, 0, 0, 0];
        activities.forEach(a => {
            // Use local day to match user's perspective
            // .getDay() returns 0 for Sunday, 1 for Monday...
            // We want Mon=0, Tue=1 ... Sun=6
            const dayIndex = (a.createdAt.getDay() + 6) % 7;
            dailyXp[dayIndex] += a.xpEarned;
        });

        return {
            dailyXp: {
                Mon: dailyXp[0],
                Tue: dailyXp[1],
                Wed: dailyXp[2],
                Thu: dailyXp[3],
                Fri: dailyXp[4],
                Sat: dailyXp[5],
                Sun: dailyXp[6],
            },
            totalXp: dailyXp.reduce((a, b) => a + b, 0),
        }
    }

    static async getStreakCalendar(userId: string) {
        // Fetch all activities for the user, order by date
        const activities = await prisma.activity.findMany({
            where: { userId },
            select: { createdAt: true },
            orderBy: { createdAt: 'asc' }
        });

        // Extract unique dates in YYYY-MM-DD format using local time
        const uniqueDates = new Set(
            activities.map(a => {
                const d = a.createdAt;
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            })
        );

        return Array.from(uniqueDates);
    }

    static async updateAccuracy(userId: string, isCorrect: boolean) {
        return prisma.user.update({
            where: { id: userId },
            data: {
                totalQuestions: { increment: 1 },
                correctAnswers: isCorrect ? { increment: 1 } : undefined
            },
            select: {
                correctAnswers: true,
                totalQuestions: true
            }
        });
    }

    static async addXp(userId: string, amount: number, source: string) {
        return await prisma.$transaction(async (tx) => {
            // Map source to ActivityType enum (default to 'quiz')
            let type: any = "quiz";
            const s = source.toLowerCase();
            if (s.includes("audit")) type = "audit";
            else if (s.includes("tax")) type = "tax";
            else if (s.includes("case")) type = "caselaw";

            // IDEMPOTENCY CHECK (Time-Window Based)
            // Prevents duplicate XP awards if specific events fire multiple times (e.g. on refresh)
            const recentWindowSeconds = amount > 200 ? 1 : 1;
            const recentThreshold = new Date(Date.now() - recentWindowSeconds * 1000);

            const duplicate = await tx.activity.findFirst({
                where: {
                    userId,
                    title: source.substring(0, 50),
                    xpEarned: amount,
                    createdAt: { gt: recentThreshold }
                }
            });

            if (duplicate) {
                console.log(`[XP] Duplicate event detected (Window: ${recentWindowSeconds}s). Ignoring.`);
                const u = await tx.user.findUnique({ where: { id: userId } });
                return { user: u, activity: duplicate, newBadges: [] };
            }

            // 1. Create activity log
            const activityContent = {
                userId,
                activityType: type,
                activityId: `xp-event-${Date.now()}`,
                xpEarned: amount,
                title: source.substring(0, 50)
            };
            const activity = await tx.activity.create({
                data: activityContent
            });

            // 2. Update User XP
            const user = await tx.user.update({
                where: { id: userId },
                data: {
                    xp: { increment: amount },
                    lastActivityDate: new Date()
                }
            });

            // 3. Check for new Badges
            const newBadges = await BadgeService.checkAndAwardBadges(tx as any, userId, user.xp);

            return { user, activity, newBadges };
        });
    }



    static async getSubjectAccuracy(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                auditCorrect: true,
                auditTotal: true,
                taxCorrect: true,
                taxTotal: true,
                caselawCorrect: true,
                caselawTotal: true
            }
        });

        if (!user) return { audit: 0, tax: 0, caseLaw: 0 };

        const calc = (correct: number, total: number) => {
            if (total === 0) return 0;
            return Math.round((correct / total) * 100);
        };

        return {
            audit: calc(user.auditCorrect, user.auditTotal),
            tax: calc(user.taxCorrect, user.taxTotal),
            caseLaw: calc(user.caselawCorrect, user.caselawTotal)
        };
    }
    static async getDailyGoals(userId: string) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // 1. Fetch User & Today's Activities
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                activities: {
                    where: {
                        createdAt: { gte: todayStart, lte: todayEnd }
                    }
                }
            }
        });

        if (!user) throw new Error("User not found");

        let streakUpdated = false;
        const lastActive = user.lastActivityDate ? new Date(user.lastActivityDate) : new Date(0);
        const isCheckInDone = lastActive.toDateString() === new Date().toDateString();

        // 2. AUTO-CHECK-IN LOGIC
        // Atomic Update: Only update if lastActivityDate is NOT today.
        // This prevents race conditions (double XP) if multiple requests come in simultaneously.

        const updateResult = await prisma.user.updateMany({
            where: {
                id: userId,
                OR: [
                    { lastActivityDate: { lt: todayStart } },
                    { lastActivityDate: null }
                ]
            },
            data: {
                streak: { increment: 1 },
                xp: { increment: 50 },
                lastActivityDate: new Date()
            }
        });

        if (updateResult.count > 0) {
            streakUpdated = true;
            // Only log activity if we actually updated the user (won the race)
            await prisma.activity.create({
                data: {
                    userId,
                    activityType: 'quiz',
                    activityId: `daily-checkin-${Date.now()}`,
                    title: 'Daily Check-in',
                    xpEarned: 50
                }
            });

            // Re-fetch user to get updated values for response
            const updatedUser = await prisma.user.findUnique({
                where: { id: userId },
                include: { activities: { where: { createdAt: { gte: todayStart, lte: todayEnd } } } }
            });
            if (updatedUser) {
                // Update local 'user' variable with new state so response is correct
                user.activities = updatedUser.activities;
                user.streak = updatedUser.streak;
            }
        }

        // 3. Analyze Completion
        const hasSimulation = user.activities.some(a =>
            a.activityType === 'audit' || a.activityType === 'tax'
        );

        const hasQuiz = user.activities.some(a =>
            a.activityType === 'quiz' || a.activityType === 'caselaw'
        );

        const hasRealQuiz = user.activities.some(a =>
            (a.activityType === 'quiz' || a.activityType === 'caselaw') && !a.title?.includes('Check-in')
        );

        return {
            goals: {
                streak: true,
                simulation: hasSimulation,
                quiz: hasRealQuiz
            },
            meta: {
                streakUpdated,
                currentStreak: streakUpdated ? user.streak + 1 : user.streak
            }
        };
    }

    static async getWeeklyGoals(userId: string) {
        const now = new Date();
        const weekStart = startOfWeek(now, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 0 });

        // Fetch User (for Streak) and Weekly Activities
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                activities: {
                    where: {
                        createdAt: { gte: weekStart, lte: weekEnd }
                    }
                }
            }
        });

        if (!user) throw new Error("User not found");

        // 1. Calculate Weekly Simulations
        const weeklySimulations = user.activities.filter(a =>
            a.activityType === 'audit' || a.activityType === 'tax'
        ).length;

        // 2. Calculate Weekly XP
        const weeklyXP = user.activities.reduce((sum, a) => sum + a.xpEarned, 0);

        // 3. Current Streak (from User profile directly)
        const currentStreak = user.streak;

        return {
            goals: [
                {
                    id: 'weekly-sims',
                    label: 'Complete 5 Simulations',
                    current: weeklySimulations,
                    target: 5,
                    color: 'blue',
                    unit: ''
                },
                {
                    id: 'weekly-xp',
                    label: 'Earn 1000 XP (Weekly)',
                    current: weeklyXP,
                    target: 1000,
                    color: 'green',
                    unit: 'XP'
                },
                {
                    id: 'weekly-streak',
                    label: 'Maintain 7-day Streak',
                    current: currentStreak,
                    target: 7,
                    color: 'orange',
                    unit: 'days'
                }
            ]
        };
    }
}