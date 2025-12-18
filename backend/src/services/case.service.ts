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
        });
    },
};
