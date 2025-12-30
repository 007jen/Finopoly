import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TaxService {
    static async getPlayableSimulations(difficulty?: string) {
        return prisma.taxSimulation.findMany({
            where: {
                isActive: true,
                ...(difficulty ? { difficulty: difficulty as any } : {})
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    static async getSimulationById(id: string) {
        return prisma.taxSimulation.findUnique({
            where: { id }
        });
    }

    // Admin: Create 
    static async createSimulation(data: any, userId: string) {
        return prisma.taxSimulation.create({
            data: {
                ...data,
                createdBy: userId
            }
        });
    }

    // Admin: List All
    static async getAllSimulations() {
        return prisma.taxSimulation.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                creator: {
                    select: { name: true }
                }
            }
        });
    }

    // Admin: Update
    static async updateSimulation(id: string, data: any) {
        return prisma.taxSimulation.update({
            where: { id },
            data
        });
    }

    // Admin: Delete
    static async deleteSimulation(id: string) {
        return prisma.taxSimulation.delete({
            where: { id }
        });
    }
}
