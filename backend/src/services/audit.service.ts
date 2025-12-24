
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AuditService {

    // Fetch a random set of audit cases for the game
    static async getPlayableCases(count: number = 5) {
        // Since Prisma doesn't support RAND() natively easily across DBs,
        // and we have few cases, we'll fetch all active ones and shuffle in JS for now.
        // For production with thousands of cases, we'd use raw SQL `ORDER BY RANDOM()`.

        const allCases = await prisma.auditCase.findMany({
            where: { isActive: true },
            // Select only fields needed for gameplay
            select: {
                id: true,
                title: true,
                companyName: true,
                difficulty: true,
                description: true,
                invoiceDetails: true,
                ledgerDetails: true,
                expectedAction: true,
                violationReason: true,
                tags: true,
                xpReward: true,
                timeLimit: true
            }
        });

        // Shuffle array using Fisher-Yates
        for (let i = allCases.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allCases[i], allCases[j]] = [allCases[j], allCases[i]];
        }

        // Return requested count
        // Return requested count
        return allCases.slice(0, count);
    }

    // Fetch ALL active cases (Catalog)
    static async getCatalog() {
        return prisma.auditCase.findMany({
            where: { isActive: true },
            orderBy: { difficulty: 'asc' }, // Order by difficulty for the lobby
            select: {
                id: true,
                title: true,
                companyName: true,
                difficulty: true,
                description: true,
                xpReward: true,
                tags: true
            }
        });
    }

    // Fetch a single playable case by ID
    static async getPlayableCaseById(id: string) {
        return prisma.auditCase.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                companyName: true,
                difficulty: true,
                description: true,
                invoiceDetails: true,
                ledgerDetails: true,
                expectedAction: true,
                violationReason: true,
                tags: true,
                xpReward: true,
                timeLimit: true
            }
        });
    }

    // Admin: Create a new case
    static async createCase(data: any, userId: string) {
        return prisma.auditCase.create({
            data: {
                ...data,
                createdBy: userId
            }
        });
    }

    // Admin: List all cases
    static async getAllCases() {
        return prisma.auditCase.findMany({
            orderBy: { createdAt: 'desc' },
            include: { creator: { select: { name: true } } }
        });
    }

    // Admin: Update a case
    static async updateCase(id: string, data: any) {
        return prisma.auditCase.update({
            where: { id },
            data: data
        });
    }

    // Admin: Delete a case
    static async deleteCase(id: string) {
        return prisma.auditCase.delete({
            where: { id }
        });
    }
}
