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
}: {
    userId: string;
    type: ActivityType;
    referenceId: string;
}) {
    return prisma.$transaction(async (tx) => {
        // 🔒 Re-fetch user INSIDE transaction
        const user = await tx.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error("User not found");
        }

        // 🔐 SERVER-SIDE XP CALCULATION
        let xpReward = 0;

        switch (type) {
            case "audit": {
                const audit = await tx.auditCase.findUnique({
                    where: { id: referenceId },
                });
                if (!audit || !audit.isActive) {
                    throw new Error("Invalid audit case");
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
                xpReward = 50; // fixed for now
                break;
            }

            default:
                throw new Error("Unsupported activity type");
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
                score: 0,
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
                completedSimulations: isSimulation ? { increment: 1 } : undefined
            },
        });

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
