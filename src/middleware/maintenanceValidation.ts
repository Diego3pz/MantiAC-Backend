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
    if (currentDate < february15 || currentDate > dateNow) {
         res.status(400).json({ message: 'El mantenimiento preventivo completo solo puede realizarse entre el 15 de febrero y el 31 de marzo.' });
         return
    }

    // Validar que no exista otro mantenimiento preventivo completo en el último año
    const existing = await Maintenance.findOne({
        equipment: equipmentId,
        type: 'Preventivo Completo',
        date: { $gte: oneYearAgo },
    });

    if (existing) {
         res.status(400).json({ message: 'Solo se permite un mantenimiento preventivo completo por año.' });
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
         res.status(400).json({ message: 'Solo se permite una limpieza de filtros cada 15 días.' });
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
             res.status(400).json({ message: 'La limpieza de filtros solo puede realizarse 15 días después del mantenimiento preventivo completo.' });
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

        // Si el tipo no requiere validación específica, continuar
        next();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const validateMaintenanceData = async (req: Request, res: Response, next: NextFunction) => {
    const { type, description, cost } = req.body;

    try {
        // Validar descripción para correctivos
        if (type === 'Correctivo' && (!description || description.trim() === '')) {
            res.status(400).json({ message: 'La descripción es obligatoria para mantenimientos correctivos.' });
            return;
        }

        // Validar costo para correctivos
        if (type === 'Correctivo' && (cost === null || cost === undefined)) {
            res.status(400).json({ message: 'El costo es obligatorio para mantenimientos correctivos.' });
            return;
        }

        // Validar que el costo no esté definido para otros tipos
        if ((type === 'Preventivo Completo' || type === 'Limpieza de filtros') && (cost !== null && cost !== undefined)) {
            res.status(400).json({ message: 'El costo solo debe especificarse para mantenimientos correctivos.' });
            return;
        }

        // Validar tipo de mantenimiento
        if (!Object.values(maintenanceType).includes(type)) {
            res.status(400).json({ message: 'El tipo de mantenimiento no es válido.' });
            return;
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Error al validar los datos del mantenimiento.', error: error.message });
    }
};