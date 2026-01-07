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

export async function getUsers(page: number = 1, limit: number = 10, search: string = "", role?: string, status?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
        ];
    }
    if (role && role !== 'All') {
        where.role = role.toLowerCase();
    }
    if (status && status !== 'All') {
        // Map 'Inactive' (from old frontend) or 'Suspended' (new) to SUSPENDED
        if (status.toUpperCase() === 'INACTIVE' || status.toUpperCase() === 'SUSPENDED') {
            where.status = 'SUSPENDED';
        } else if (status.toUpperCase() === 'ACTIVE') {
            where.status = 'ACTIVE';
        }
    }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                xp: true,
                level: true,
                avatar: true,
                createdAt: true,
                lastActivityDate: true,
                activeSeconds: true,
                completedSimulations: true,
                auditCorrect: true,
                auditTotal: true,
                taxCorrect: true,
                taxTotal: true,
                caselawCorrect: true,
                caselawTotal: true,
                correctAnswers: true,
                totalQuestions: true,
                stats: {
                    select: {
                        moduleType: true,
                        correctCount: true,
                        totalCount: true,
                        accuracy: true
                    }
                }
            }
        }),
        prisma.user.count({ where })
    ]);

    return {
        users,
        pagination: {
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
            limit
        }
    };
}

export async function updateUser(id: string, data: { name?: string; email?: string; role?: string; status?: string }) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role.toLowerCase() as any;
    if (data.status !== undefined) updateData.status = data.status.toUpperCase() as any;

    return await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true
        }
    });
}

export async function deleteUser(id: string) {
    return await prisma.user.delete({
        where: { id }
    });
}

export async function getUserActivityTrend(userId: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activities = await prisma.activity.findMany({
        where: {
            userId,
            createdAt: { gte: sevenDaysAgo }
        },
        select: {
            activityType: true,
            activityId: true,
            createdAt: true
        },
        orderBy: { createdAt: 'asc' }
    });

    // Initialize daily structure with all subject keys
    const trend: Record<string, any> = {};
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        trend[dateKey] = {
            date: dateKey,
            audit: 0,
            tax: 0,
            caselaw: 0,
            quiz: 0,
            drill: 0,
            total: 0
        };
    }

    // Keep track of primary session IDs to avoid counting redundant XP events
    const seenSessions = new Set<string>();

    activities.forEach(act => {
        const dateKey = act.createdAt.toISOString().split('T')[0];
        if (trend[dateKey]) {
            let typeKey: string = act.activityType;
            if (typeKey === 'challenge') typeKey = 'drill';

            // 🛑 DATA ACCURACY FIX: 
            // 1. Skip redundant XP-only logs (xp-event-) if it's a simulation type, 
            //    since simulations already have a primary session log (recordActivity).
            const isSimulator = ['audit', 'tax', 'caselaw', 'drill'].includes(typeKey);
            const isXpOnly = act.activityId.startsWith('xp-event-');

            if (isSimulator && isXpOnly) return;

            // 2. Prevent duplicate counts of the same session ID on the same day (e.g. from retries or UI glitches)
            const sessionKey = `${dateKey}-${typeKey}-${act.activityId}`;
            if (seenSessions.has(sessionKey)) return;
            seenSessions.add(sessionKey);

            if (trend[dateKey][typeKey] !== undefined) {
                trend[dateKey][typeKey]++;
                trend[dateKey].total++;
            }
        }
    });

    return Object.values(trend)
        .sort((a: any, b: any) => a.date.localeCompare(b.date));
}
