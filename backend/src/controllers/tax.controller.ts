import { Request, Response } from 'express';
import { TaxService } from '../services/tax.service';

export const getPlayableSimulations = async (req: Request, res: Response) => {
    try {
        const { difficulty } = req.query;
        const sims = await TaxService.getPlayableSimulations(difficulty as string);
        res.json(sims);
    } catch (error) {
        console.error('Error fetching tax simulations:', error);
        res.status(500).json({ error: 'Failed to fetch simulations' });
    }
};

export const getSimulationById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const sim = await TaxService.getSimulationById(id);
        if (!sim) return res.status(404).json({ error: 'Simulation not found' });
        res.json(sim);
    } catch (error) {
        console.error('Error fetching tax simulation:', error);
        res.status(500).json({ error: 'Failed to fetch simulation' });
    }
};

// Admin Controllers
export const listTaxSimulations = async (_req: Request, res: Response) => {
    try {
        const sims = await TaxService.getAllSimulations();
        res.json(sims);
    } catch (error) {
        console.error('Error listing tax simulations:', error);
        res.status(500).json({ error: 'Failed to list simulations' });
    }
};

export const createTaxSimulation = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const newSim = await TaxService.createSimulation(req.body, userId);
        res.status(201).json(newSim);
    } catch (error) {
        console.error('Error creating tax simulation:', error);
        res.status(500).json({ error: 'Failed to create simulation' });
    }
};

export const updateTaxSimulation = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedSim = await TaxService.updateSimulation(id, req.body);
        res.json(updatedSim);
    } catch (error) {
        console.error('Error updating tax simulation:', error);
        res.status(500).json({ error: 'Failed to update simulation' });
    }
};

export const deleteTaxSimulation = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await TaxService.deleteSimulation(id);
        res.json({ message: 'Simulation deleted successfully' });
    } catch (error) {
        console.error('Error deleting tax simulation:', error);
        res.status(500).json({ error: 'Failed to delete simulation' });
    }
};
