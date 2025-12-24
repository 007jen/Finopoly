
import { Request, Response } from 'express';
import { AuditService } from '../services/audit.service';

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
