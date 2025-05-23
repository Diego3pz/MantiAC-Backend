import { Request, Response, NextFunction } from 'express';
import Maintenance, { maintenanceType } from '../models/Maintenance';


export const validatePreventiveMaintenance = async (req: Request, res: Response, next: NextFunction) => {
    const { equipmentId } = req.params;

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const currentDate = new Date();
    const february15 = new Date(currentDate.getFullYear(), 1, 15);
    const march31 = new Date(currentDate.getFullYear(), 2, 31);
    const dateNow = new Date(); // Fecha actual testeo

    // Validar que la fecha esté dentro del rango permitido
    if (currentDate < february15 || currentDate > march31) {
        const error = new Error('El mantenimiento preventivo completo solo puede realizarse entre el 15 de febrero y el 31 de marzo');
        res.status(400).json({ error: error.message });
        return
    }

    // Validar que no exista otro mantenimiento preventivo completo en el último año
    const existing = await Maintenance.findOne({
        equipment: equipmentId,
        type: 'Preventivo Completo',
        date: { $gte: oneYearAgo },
    });

    if (existing) {
        const error = new Error('Solo se permite un mantenimiento preventivo completo por año.');
        res.status(400).json({ error: error.message });
        return
    }

    next();
};

export const validateFilterCleaning = async (req: Request, res: Response, next: NextFunction) => {
    const { equipmentId } = req.params;

    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    // Validar que no exista otra limpieza de filtros en los últimos 15 días
    const existing = await Maintenance.findOne({
        equipment: equipmentId,
        type: 'Limpieza de filtros',
        date: { $gte: fifteenDaysAgo },
    });

    if (existing) {
        const error = new Error('Solo se permite una limpieza de filtros cada 15 días.');
        res.status(400).json({ error: error.message });
        return
    }

    // Validar que hayan pasado 15 días desde el último mantenimiento preventivo completo
    const lastPreventive = await Maintenance.findOne({
        equipment: equipmentId,
        type: 'Preventivo Completo',
    }).sort({ date: -1 });

    const currentDate = new Date();

    if (lastPreventive) {
        const fifteenDaysAfterPreventive = new Date(lastPreventive.date);
        fifteenDaysAfterPreventive.setDate(fifteenDaysAfterPreventive.getDate() + 15);

        if (currentDate < fifteenDaysAfterPreventive) {
            const error = new Error('La limpieza de filtros solo puede realizarse 15 días después del mantenimiento preventivo completo.');
            res.status(400).json({ error: error.message });
            return
        }
    }

    next();
};

export const validateMaintenanceType = async (req: Request, res: Response, next: NextFunction) => {
    const { type } = req.body;

    try {
        if (type === 'Preventivo Completo') {
            return await validatePreventiveMaintenance(req, res, next);
        }

        if (type === 'Limpieza de filtros') {
            return await validateFilterCleaning(req, res, next);
        }


        next();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const validateMaintenanceData = async (req: Request, res: Response, next: NextFunction) => {
    const { type, description, cost } = req.body;

    try {

        if (type === 'Correctivo' && (!description || description.trim() === '')) {
            const error = new Error('La descripción es obligatoria para mantenimientos correctivos.');
            res.status(400).json({ error: error.message });
            return;
        }


        if (type === 'Correctivo' && (cost === null || cost === undefined)) {
            const error = new Error('El costo es obligatorio para mantenimientos correctivos.');
            res.status(400).json({ error: error.message });
            return;
        }


        if ((type === 'Preventivo Completo' || type === 'Limpieza de filtros') && (cost !== null && cost !== undefined)) {
            const error = new Error('El costo solo debe especificarse para mantenimientos correctivos.');
            res.status(400).json({ error: error.message });
            return;
        }

        // validar que la descripcion sea solamente para correctivos
        if (description && type !== 'Correctivo') {
            const error = new Error('La descripción solo es válida para mantenimientos correctivos.');
            res.status(400).json({ error: error.message });
            return;
        }


        if (!Object.values(maintenanceType).includes(type)) {
           const error = new Error('El tipo de mantenimiento no es válido.');
            res.status(400).json({ error: error.message });
            return;
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Error al validar los datos del mantenimiento.', error: error.message });
        return
    }
};