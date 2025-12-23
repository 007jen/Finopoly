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

    static async addXp(userId: string, amount: number, source: string) {
        return await prisma.$transaction(async (tx) => {
            // Map source to ActivityType enum (default to 'quiz')
            let type: any = "quiz";
            const s = source.toLowerCase();
            if (s.includes("audit")) type = "audit";
            else if (s.includes("tax")) type = "tax";
            else if (s.includes("case")) type = "caselaw";

            // 1. Create activity log
            const activity = await tx.activity.create({
                data: {
                    userId,
                    activityType: type,
                    activityId: `xp-event-${Date.now()}`, // Placeholder ID
                    xpEarned: amount,
                    // 'description' is not in schema, so we omit it. 
                    // We can store source in 'answers' or similar JSON if needed, but for now we skip it.
                }
            });

            // 2. Update User XP
            const user = await tx.user.update({
                where: { id: userId },
                data: {
                    xp: { increment: amount },
                    lastActivityDate: new Date()
                }
            });

            return { user, activity };
        });
    }



    static async getSubjectAccuracy(_userId: string) {
        return {
            audit: 0,
            tax: 0,
            caseLaw: 0,
        };
    }
}   