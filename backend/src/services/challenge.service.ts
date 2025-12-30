import { prisma } from '../utils/prisma';
import { recordActivity } from './activity.service'; // Re-using your existing XP service

export const challengeService = {
    // 1. GET: Fetch challenge & check user status
    getChallenge: async (userId: string, challengeIdOrSlug: string) => {
        // Fetch challenge AND the user's attempt history
        // Try ID first, then Slug
        const challenge = await prisma.analystChallenge.findFirst({
            where: {
                OR: [
                    { id: challengeIdOrSlug },
                    { slug: challengeIdOrSlug }
                ]
            },
            include: {
                attempts: {
                    where: { userId },
                    take: 1
                }
            }
        });

        if (!challenge) return null;

        // ⏭️ FETCH NEXT CHALLENGE (For Dynamic Navigation)
        const nextChallenge = await prisma.analystChallenge.findFirst({
            where: {
                isActive: true,
                createdAt: { gt: challenge.createdAt }
            },
            orderBy: { createdAt: 'asc' },
            select: { slug: true }
        });

        const attempt = challenge.attempts[0];
        const isUnlocked = attempt?.unlockedVideo || false;

        // 🔒 SECURITY GATEKEEPER
        // If not unlocked, HIDE the video and answer
        return {
            ...challenge,
            videoUrl: isUnlocked ? challenge.videoUrl : null,     // Hide URL
            correctVal: isUnlocked ? challenge.correctVal : null, // Hide Answer
            nextChallengeSlug: nextChallenge?.slug || null,       // Dynamic Next Drill
            userStatus: {
                solved: attempt?.isCorrect || false,
                attempts: attempt?.attempts || 0,
                unlocked: isUnlocked
            }
        };
    },

    // 2. VERIFY: Check the answer server-side
    verifyAttempt: async (userId: string, challengeIdOrSlug: string, userInput: string) => {
        const challenge = await prisma.analystChallenge.findFirst({
            where: {
                OR: [
                    { id: challengeIdOrSlug },
                    { slug: challengeIdOrSlug }
                ]
            }
        });

        if (!challenge) throw new Error("Challenge not found");

        // --- THE MATH BRAIN ---
        let isCorrect = false;

        if (challenge.answerType === "NUMBER") {
            const userNum = parseFloat(userInput);
            const correctNum = parseFloat(challenge.correctVal);
            const tolerance = challenge.tolerance || 0;

            // Check if number is valid and within range
            if (!isNaN(userNum)) {
                const diff = Math.abs(userNum - correctNum);
                isCorrect = diff <= tolerance; // e.g., |14.6 - 14.5| <= 0.5
            }
        } else {
            // Text Match (Case Insensitive)
            isCorrect = userInput.trim().toLowerCase() === challenge.correctVal.trim().toLowerCase();
        }

        // --- ATOMIC UPDATE ---
        return await prisma.$transaction(async (tx) => {
            // A. Upsert Attempt Record
            const attempt = await tx.challengeAttempt.upsert({
                where: {
                    userId_challengeId: { userId, challengeId: challenge.id }
                },
                update: {
                    attempts: { increment: 1 },
                    isCorrect: isCorrect ? true : undefined,
                    unlockedVideo: isCorrect ? true : undefined,
                    completedAt: isCorrect ? new Date() : undefined,
                    userInput
                },
                create: {
                    userId,
                    challengeId: challenge.id,
                    userInput,
                    isCorrect,
                    unlockedVideo: isCorrect,
                    completedAt: isCorrect ? new Date() : null
                }
            });

            // B. Award XP (Only if this is the FIRST time they solved it)
            if (isCorrect) {
                // We need the DB UUID for the activity service
                const dbUser = await tx.user.findUnique({
                    where: { clerkId: userId },
                    select: { id: true }
                });

                if (dbUser) {
                    await recordActivity({
                        userId: dbUser.id,
                        type: 'challenge',
                        referenceId: challenge.id,
                        success: true,
                    });
                }
            }

            return { isCorrect, videoUrl: isCorrect ? challenge.videoUrl : null };
        });
    },

    // 3. SURRENDER: Give up to see video
    surrender: async (userId: string, challengeIdOrSlug: string) => {
        const challenge = await prisma.analystChallenge.findFirst({
            where: {
                OR: [
                    { id: challengeIdOrSlug },
                    { slug: challengeIdOrSlug }
                ]
            }
        });

        if (!challenge) throw new Error("Challenge not found");

        const result = await prisma.challengeAttempt.upsert({
            where: { userId_challengeId: { userId, challengeId: challenge.id } },
            update: { unlockedVideo: true, completedAt: new Date() },
            create: {
                userId,
                challengeId: challenge.id,
                userInput: "SURRENDER",
                unlockedVideo: true,
                completedAt: new Date()
            },
            include: { challenge: true }
        });

        return { videoUrl: result.challenge.videoUrl };
    },

    // 4. LIST: Fetch all active challenges for the lobby
    listChallenges: async (userId: string) => {
        const challenges = await prisma.analystChallenge.findMany({
            where: { isActive: true },
            include: {
                attempts: {
                    where: { userId },
                    take: 1
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return challenges.map(c => ({
            id: c.id,
            title: c.title,
            slug: c.slug,
            description: c.description,
            difficulty: c.difficulty,
            xpReward: c.xpReward,
            isSolved: c.attempts[0]?.isCorrect || false,
            isUnlocked: c.attempts[0]?.unlockedVideo || false
        }));
    }
};
