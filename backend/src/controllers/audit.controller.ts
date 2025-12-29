
import { Request, Response } from 'express';
import { AuditService } from '../services/audit.service';
import { recordActivity } from '../services/activity.service';
import { prisma } from '../utils/prisma';

export const getPlayableCases = async (req: Request, res: Response) => {
    try {
        const count = req.query.count ? parseInt(req.query.count as string) : 5;
        const cases = await AuditService.getPlayableCases(count);
        res.json(cases);
    } catch (error) {
        console.error('Error fetching playable cases:', error);
        res.status(500).json({ error: 'Failed to fetch cases' });
    }
};

export const listCatalog = async (req: Request, res: Response) => {
    try {
        const cases = await AuditService.getCatalog();
        res.json(cases);
    } catch (error) {
        console.error('Error listing catalog:', error);
        res.status(500).json({ error: 'Failed to list catalog' });
    }
};

export const getPlayableCaseById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const auditCase = await AuditService.getPlayableCaseById(id);
        if (!auditCase) {
            return res.status(404).json({ error: 'Case not found' });
        }
        res.json(auditCase);
    } catch (error) {
        console.error('Error fetching playable case:', error);
        res.status(500).json({ error: 'Failed to fetch case' });
    }
};

export const createAuditCase = async (req: Request, res: Response) => {
    try {
        // Assuming user is attached to req by auth middleware
        const userId = (req as any).user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const newCase = await AuditService.createCase(req.body, userId);
        res.status(201).json(newCase);
    } catch (error) {
        console.error('Error creating audit case:', error);
        res.status(500).json({ error: 'Failed to create case' });
    }
};

export const listAuditCases = async (req: Request, res: Response) => {
    try {
        const cases = await AuditService.getAllCases();
        res.json(cases);
    } catch (error) {
        console.error('Error listing audit cases:', error);
        res.status(500).json({ error: 'Failed to list cases' });
    }
};

export const updateAuditCase = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedCase = await AuditService.updateCase(id, req.body);
        res.json(updatedCase);
    } catch (error) {
        console.error('Error updating audit case:', error);
        res.status(500).json({ error: 'Failed to update case' });
    }
};

export const deleteAuditCase = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await AuditService.deleteCase(id);
        res.json({ message: 'Case deleted successfully' });
    } catch (error) {
        console.error('Error deleting audit case:', error);
        res.status(500).json({ error: 'Failed to delete case' });
    }
};

// 2. Backend (Express) - User Requested Logic
export const completeSession = async (req: Request, res: Response) => {
    // const reqId = Math.random().toString(36).substring(7);
    // console.log(`[${reqId}] --> completeSession HIT`);
    try {
        const userId = req.user?.id; // Postges ID
        // console.log(`[${reqId}] --> User ID found:`, userId);

        if (!userId) {
            // console.log("--> NO USER ID - Unauthorized");
            return res.status(401).json({ error: "Unauthorized" });
        }

        // 1. Fetch user's last update time to prevent double-execution
        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { updatedAt: true }
        });

        if (existingUser) {
            const timeDiff = new Date().getTime() - new Date(existingUser.updatedAt).getTime();
            // console.log(`[${reqId}] --> Time since last update: ${timeDiff}ms`);

            // If updated less than 5 seconds ago, ignore this request (Debounce)
            if (timeDiff < 5000) {
                // console.log(`[${reqId}] --> DEBOUNCED: Duplicate request blocked.`);
                return res.json({ message: 'Session completed (Debounced)', user: existingUser });
            }
        }

        // Direct update as requested ("Check my prisma/schema.prisma logic")
        // console.log(`[${reqId}] --> Attempting Prisma Update for:`, userId);

        const { caseId, score, success = true } = req.body;
        if (!caseId) {
            return res.status(400).json({ error: "caseId is required" });
        }

        const result = await recordActivity({
            userId,
            type: 'audit',
            referenceId: caseId,
            score: score || 0,
            success: Boolean(success)
        });

        // console.log(`[${reqId}] --> Activity Recorded Result:`, result);
        res.json({ message: 'Session completed', ...result });
    } catch (error) {
        console.error('Error completing audit session:', error);
        res.status(500).json({ error: 'Failed to record session completion' });
    }
};
