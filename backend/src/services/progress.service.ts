import { Prisma } from "@prisma/client";
import { startOfWeek, endOfWeek } from "date-fns";
import { prisma } from "../utils/prisma";

export class ProgressService {

    static async getWeeklyXp(userId: string) {
        const now = new Date()
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

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
            const dayIndex = (a.createdAt.getUTCDay() + 6) % 7;
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

        // Extract unique dates in YYYY-MM-DD format using a Set
        // This avoids DB-specific raw queries (e.g. SQLite vs Postgres differences on DATE())
        const uniqueDates = new Set(
            activities.map(a => a.createdAt.toISOString().split('T')[0])
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
            const recentWindowSeconds = amount > 200 ? 20 : 2;
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
            // Get all badges that the user qualifies for with their NEW xp
            const eligibleBadges = await tx.badge.findMany({
                where: { xpRequirement: { lte: user.xp } }
            });

            // Get badges the user ALREADY has
            const ownedUserBadges = await tx.userBadge.findMany({
                where: { userId },
                select: { badgeId: true }
            });
            const ownedBadgeIds = new Set(ownedUserBadges.map(ub => ub.badgeId));

            // Determine new badges to award
            const newBadgesToAward = eligibleBadges.filter(b => !ownedBadgeIds.has(b.id));

            // Award them
            if (newBadgesToAward.length > 0) {
                await tx.userBadge.createMany({
                    data: newBadgesToAward.map(b => ({
                        userId,
                        badgeId: b.id
                    }))
                });
                console.log(`Awarded ${newBadgesToAward.length} badges to user ${user.id}`);
            }

            return { user, activity, newBadges: newBadgesToAward };
        });
    }



    static async getSubjectAccuracy(userId: string) {
        // Query activities that are of type audit, tax, or caselaw
        // Note: The schema enum is ActivityType. 
        // We need to cast the string array to the Enum type or let Prisma handle it if the strings match.
        // Schema: audit, tax, caselaw, quiz
        const activities = await prisma.activity.findMany({
            where: {
                userId,
                activityType: { in: ["audit", "tax", "caselaw"] }
            },
            select: {
                activityType: true,
                score: true
            }
        });

        // Initialize accumulator
        const subjects: Record<string, { totalScore: number; attempts: number }> = {
            audit: { totalScore: 0, attempts: 0 },
            tax: { totalScore: 0, attempts: 0 },
            caselaw: { totalScore: 0, attempts: 0 }
        };

        // Aggregate scores
        for (const activity of activities) {
            if (activity.score === null) continue;

            // activity.activityType is the Enum (audit, tax, caselaw) 
            // capable of being used as index if we trust the return
            const type = activity.activityType;
            if (subjects[type]) {
                subjects[type].totalScore += (activity.score || 0);
                subjects[type].attempts += 1;
            }
        }

        // Helper to format
        const formatSubject = (subject: { totalScore: number; attempts: number }) => {
            if (subject.attempts === 0) {
                // Return 0 if no attempts, but can return null if UI wants to handle "No Data" differently
                // For now, matching previous behavior of returning numbers
                return 0; // The UI expects a number percentage
            }
            return Math.round(subject.totalScore / subject.attempts);
        };

        // Update: The UI seems to expect { audit: number, tax: number, ... } 
        // based on the previous mock: return { audit: 0 ... }
        // The user's snippet returned objects { accuracy: number, attempts: number }.
        // I should check what the Frontend expects.
        // Frontend code: `accuracyData = { audit: subjectData?.audit ?? ... }`
        // And rendering: `item.accuracy * 2.51` -> implies it expects a simple NUMBER.
        // User's snippet returned valid object structure but existing frontend code expects number.
        // Let's stick to returning simple valid numbers for now to avoid breaking Frontend 
        // OR update to return the object and usage.

        // Wait, looking at Profile/Progress code:
        // `const accuracyData = { audit: subjectData?.audit ?? ... }`
        // Then it uses `item.accuracy`.
        // If subjectData.audit is a number, it works.
        // If subjectData.audit is { accuracy: 50 }, then accuracyData.audit is that object.
        // Then `item.accuracy` would be `accuracyData.audit`.
        // BUT the mapping says: `{[ { subject: 'Audit', accuracy: accuracyData.audit ... } ]}`
        // So `item.accuracy` becomes the value.
        // IF `accuracyData.audit` is an object, then inside the map `item.accuracy` is that object.
        // Then `item.accuracy * 2.51` = Object * 2.51 = NaN.

        // CONCLUSION: The Frontend expects a direct NUMBER for the percentage.
        // I will adapt the user's logic to return just the percentage number.

        return {
            audit: formatSubject(subjects.audit),
            tax: formatSubject(subjects.tax),
            caseLaw: formatSubject(subjects.caselaw) // Note: camelCase 'caseLaw' in frontend vs 'caselaw' in DB/enum
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
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

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