import { prisma } from "../utils/prisma";

export const caseService = {
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
