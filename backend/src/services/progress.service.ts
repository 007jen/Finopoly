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



    static async getSubjectAccuracy(_userId: string) {
        return {
            audit: 0,
            tax: 0,
            caseLaw: 0,
        };
    }
}   