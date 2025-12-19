import { prisma } from "../utils/prisma";

export const caseService = {
    async getAllCases() {
        return prisma.caseLaw.findMany({
            where: { isActive: true },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                title: true,
                category: true,
                difficulty: true,
                xpReward: true,
            },
        });
    },

    async getCaseById(caseId: string) {
        return prisma.caseLaw.findFirst({
            where: {
                id: caseId,
                isActive: true,
            },
            select: {
                id: true,
                title: true,
                category: true,
                difficulty: true,
                facts: true,
                question: true,
                options: true,
                xpReward: true,
                // explicit exclusion of correctAnswer and explanation
            }
        });
    },

    async submitCaseAnswer(
        userId: string,
        caseId: string,
        answer: string
    ) {
        // 1. Ensure case exists and is active
        const caseLaw = await prisma.caseLaw.findFirst({
            where: {
                id: caseId,
                isActive: true,
            },
        });

        if (!caseLaw) {
            throw new Error("CASE_NOT_FOUND");
        }

        // 2. Create submission
        try {
            return await prisma.caseSubmission.create({
                data: {
                    userId,
                    caseId,
                    answer,
                },
            });
        } catch (err: any) {
            // Unique constraint violation (already submitted)
            if (err.code === "P2002") {
                throw new Error("ALREADY_SUBMITTED");
            }
            throw err;
        }
    },
};
