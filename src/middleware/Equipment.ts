import type { Request, Response, NextFunction } from 'express'
import Equipment, { IEquipment } from '../models/Equipment';

declare global {
    namespace Express {
        interface Request {
            equipment: IEquipment
        }
    }
}

export const validateEquipmentExists = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { equipmentId } = req.params;
        const equipment = await Equipment.findById(equipmentId);

        if (!equipment) {
            const error = new Error('Equipo no encontrado');
            res.status(404).json({ error: error.message });
            return
        } else {
            req.equipment = equipment;
            next();
        }
    } catch (error) {
        res.status(500).json({ error: 'Hubo un error en el equipo' });

    }
}

