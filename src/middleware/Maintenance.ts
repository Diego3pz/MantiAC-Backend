import type { Request, Response, NextFunction } from 'express'
import Maintenance, { IMaintenance } from '../models/Maintenance';

declare global {
    namespace Express {
        interface Request {
            maintenance: IMaintenance
        }
    }
}

export const validateMaintenanceExists = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { maintenanceId } = req.params;
        const maintenance = await Maintenance.findById(maintenanceId);

        if (!maintenance) {
            const error = new Error('Mantenimiento no encontrado');
            res.status(404).json({ error: error.message });
            return
        } else {
            req.maintenance = maintenance;
            next();
        }
    } catch (error) {
        res.status(500).json({ error: 'Hubo un error en el mantenimiento' });

    }
}

export function hasAuthorization(req: Request, res: Response, next: NextFunction) {
    if (req.user.id.toString() !== req.equipment.technician.toString()) {
        const error = new Error('Acción no válida')
        res.status(400).json({ error: error.message })
        return
    }
    next()
}

