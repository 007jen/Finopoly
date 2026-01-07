// import { prisma } from "../utils/prisma";
// //const { xpEarned } = req.body;
// // where do i add this const { xpEarned } = req.body;?
// // in service where ?
// interface ActivityInput {
//     clerkId: string;
//     type: "quiz" | "audit" | "tax" | "caselaw";
//     referenceId: string;
//     xpEarned: number;
//     score?: number;
// }

// export const recordActivity = async ({
//     clerkId,
//     type,
//     referenceId,
//     xpEarned,
//     score,
// }: ActivityInput) => {

//     const user = await prisma.user.findUnique({
//         where: { clerkId },
//     });

//     if (!user) {
//         throw new Error("User not found");
//     }

//     const today = new Date();
//     const lastActive = user.lastActivityDate;

//     let newStreak = user.streak;

//     // if (lastActive) {
//     //     const diff =
//     //         (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24);

//     //     if (diff >= 1 && diff < 2) newStreak += 1;
//     //     else if (diff >= 2) newStreak = 1;
//     // } else {
//     //     newStreak = 1;
//     // }
//     function toUTCDay(date: Date) {
//         return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
//     }

//     const todayDay = toUTCDay(new Date());
//     const lastDay = user.lastActivityDate
//         ? toUTCDay(user.lastActivityDate)
//         : null;

//     // let newStreak = 1 ;
//     if (lastDay) {
//         const diffDays = (todayDay - lastDay) / (24 * 60 * 60 * 1000);
//         if (diffDays === 1) newStreak = user.streak + 1;
//         else if (diffDays === 0) newStreak = user.streak;
//         else newStreak = 1;
//     }// this function is used to calculate the streak of the user



//     return prisma.$transaction(async (tx) => {
//         // WARNING: Race condition possible here (user streak calculated outside tx). will be added or solved later
//         const activity = await tx.activity.create({
//             data: {
//                 userId: user.id,
//                 activityType: type,
//                 activityId: referenceId,
//                 xpEarned,
//                 score,
//             },
//         });

//         await tx.user.update({
//             where: { id: user.id },
//             data: {
//                 xp: { increment: xpEarned },
//                 streak: newStreak,
//                 lastActivityDate: today,
//             },
//         });

//         return activity;
//     });
// };


import { prisma } from "../utils/prisma";
import { ActivityType } from "@prisma/client";
import { BadgeService } from "./badge.service";

/**
 * Converts a Date to a UTC calendar day (YYYY-MM-DD)
 */
function toUTCDay(date: Date): string {
    return date.toISOString().split("T")[0];
}

export async function recordActivity({
    userId,
    type,
    referenceId,
    score = 0,
    success = true,
    correctIncrement,
    totalIncrement,
    xpEarned,
}: {
    userId: string;
    type: ActivityType;
    referenceId: string;
    score?: number;
    success?: boolean;
    correctIncrement?: number;
    totalIncrement?: number;
    xpEarned?: number;
}) {
    // Fallbacks for granular increments
    const cInc = correctIncrement !== undefined ? correctIncrement : (success ? 1 : 0);
    const tInc = totalIncrement !== undefined ? totalIncrement : 1;

    return prisma.$transaction(async (tx) => {
        // 🔒 Re-fetch user INSIDE transaction
        const user = await tx.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            console.error(`[ActivityService] CRITICAL: User ${userId} not found in DB`);
            throw new Error("User not found");
        }


        // 🔍 IDEMPOTENCY CHECK (5s window)
        const recentThreshold = new Date(Date.now() - 5000);
        const duplicate = await tx.activity.findFirst({
            where: {
                userId,
                activityType: type,
                activityId: referenceId,
                createdAt: { gte: recentThreshold }
            }
        });

        if (duplicate) {
            return {
                xpEarned: 0,
                totalXp: user.xp,
                streak: user.streak,
                newBadges: [],
                alreadyRecorded: true
            };
        }

        // 🔐 SERVER-SIDE XP CALCULATION
        let xpReward = xpEarned !== undefined ? xpEarned : 0;

        if (xpEarned === undefined) {
            switch (type) {
                case "audit": {
                    const audit = await tx.auditCase.findUnique({
                        where: { id: referenceId },
                    });
                    if (!audit) {
                        console.error(`[ActivityService] ERROR: Audit case ${referenceId} not found`);
                        throw new Error("Invalid audit case: Not found in database");
                    }
                    if (!audit.isActive) {
                        console.error(`[ActivityService] ERROR: Audit case ${referenceId} is inactive`);
                        throw new Error("Invalid audit case: Inactive");
                    }
                    xpReward = audit.xpReward;
                    break;
                }

                case "caselaw": {
                    const caseLaw = await tx.caseLaw.findUnique({
                        where: { id: referenceId },
                    });
                    if (!caseLaw || !caseLaw.isActive) {
                        throw new Error("Invalid case law");
                    }
                    xpReward = caseLaw.xpReward;
                    break;
                }

                case "tax": {
                    const tax = await tx.taxSimulation.findUnique({
                        where: { id: referenceId },
                    });
                    if (!tax || !tax.isActive) {
                        throw new Error("Invalid tax simulation");
                    }
                    xpReward = tax.xpReward;
                    break;
                }

                case "quiz": {
                    xpReward = 50; // default
                    break;
                }

                case "challenge": {
                    const challenge = await tx.analystChallenge.findUnique({
                        where: { id: referenceId },
                    });
                    if (!challenge) {
                        throw new Error("Invalid challenge");
                    }
                    xpReward = challenge.xpReward;
                    break;
                }

                default:
                    throw new Error("Unsupported activity type");
            }

            // ❌ HANDLE FAILURE: No XP reward on failure (if not overridden)
            if (!success && type !== 'quiz') {
                xpReward = 0;
            }
        }

        // 📅 STREAK LOGIC (UTC DAY BASED)
        const today = toUTCDay(new Date());
        const lastDay = user.lastActivityDate
            ? toUTCDay(user.lastActivityDate)
            : null;

        let newStreak = user.streak;

        if (!lastDay) {
            newStreak = 1;
        } else if (lastDay === today) {
            newStreak = user.streak;
        } else {
            const yesterday = toUTCDay(
                new Date(Date.now() - 24 * 60 * 60 * 1000)
            );
            newStreak = lastDay === yesterday ? user.streak + 1 : 1;
        }

        // 🧠 WRITE OPERATIONS (ATOMIC)
        await tx.activity.create({
            data: {
                userId,
                activityType: type,
                activityId: referenceId,
                xpEarned: xpReward,
                score,
            },
        });

        // INCREMENT LOGIC
        const isSimulation = type === 'audit' || type === 'tax';

        const updatedUser = await tx.user.update({
            where: { id: userId },
            data: {
                xp: { increment: xpReward },
                streak: newStreak,
                lastActivityDate: new Date(),
                completedSimulations: (isSimulation && success) ? { increment: 1 } : undefined,
                correctAnswers: { increment: cInc },
                totalQuestions: { increment: tInc },
                auditCorrect: (type === 'audit') ? { increment: cInc } : undefined,
                auditTotal: (type === 'audit') ? { increment: tInc } : undefined,
                taxCorrect: (type === 'tax') ? { increment: cInc } : undefined,
                taxTotal: (type === 'tax') ? { increment: tInc } : undefined,
                caselawCorrect: (type === 'caselaw') ? { increment: cInc } : undefined,
                caselawTotal: (type === 'caselaw') ? { increment: tInc } : undefined,
            },
        });

        console.log(`xp gained on ${type}`);

        // 📊 Update UserStats Table (Normalized)
        const stats = await tx.userStats.upsert({
            where: {
                userId_moduleType: {
                    userId,
                    moduleType: type
                }
            },
            update: {
                correctCount: { increment: cInc },
                totalCount: { increment: tInc },
            },
            create: {
                userId,
                moduleType: type,
                correctCount: cInc,
                totalCount: tInc,
            }
        });

        // Recalculate accuracy for UserStats
        if (stats.totalCount > 0) {
            await tx.userStats.update({
                where: { id: stats.id },
                data: {
                    accuracy: (stats.correctCount / stats.totalCount) * 100
                }
            });
        }

        // 🏅 BADGE CHECK
        // We pass the transaction client 'tx' so it's part of the same atomic operation
        const newBadges = await BadgeService.checkAndAwardBadges(tx as any, userId, updatedUser.xp);

        return {
            xpEarned: xpReward,
            totalXp: updatedUser.xp,
            streak: updatedUser.streak,
            newBadges: newBadges, // Return this so we can show a popup!
            simulationsCompleted: updatedUser.completedSimulations
        };
    });
}

export async function getUserActivities(userId: string) {
    return prisma.activity.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });
}
