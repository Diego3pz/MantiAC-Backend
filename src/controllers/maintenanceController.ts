import { Request, Response } from 'express';
import Maintenance from '../models/Maintenance';
import Equipment, { IEquipment } from '../models/Equipment';
import User from '../models/User';
import { AuthEmail } from '../emails/AuthEmail';

export class MaintenanceController {
    static createMaintenance = async (req: Request, res: Response) => {
        try {
            // Busca el usuario técnico responsable
            const user = await User.findById(req.user.id);
            if (user && user.notificationsEnabled) {
                await AuthEmail.sendMaintenanceNotification({
                    email: user.email,
                    name: user.name,
                    equipment: req.equipment.brand || 'Equipo',
                    date: req.body.date,
                    type: req.body.type
                });
            }

            if (req.body.date) {
                req.body.date = new Date(req.body.date + "T12:00:00");
            }
            const maintenance = new Maintenance(req.body);
            maintenance.equipment = req.equipment.id;
            maintenance.performedBy = req.user.id;
            req.equipment.maintenance.push(maintenance.id);

            await Promise.allSettled([maintenance.save(), req.equipment.save()]);
            res.send('Mantenimiento creado correctamente');
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }
    }

    static getAllMaintenancesByEquipment = async (req: Request, res: Response) => {
        const { equipmentId } = req.params;
        try {
            const maintenances = await Maintenance.find({ equipment: equipmentId }).populate('equipment')
            res.status(200).json(maintenances)
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })

        }
    }

    static getAllMaintenances = async (req: Request, res: Response) => {
        try {
            const maintenances = await Maintenance.find({ performedBy: req.user.id }).populate('equipment');
            res.status(200).json(maintenances);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener todos los mantenimientos.' });
            return
        }
    };

    static getMaintenanceById = async (req: Request, res: Response) => {


        try {
            const { maintenanceId } = req.params

            // Verificar si el mantenimiento pertenece al técnico autenticado
            if (req.maintenance.performedBy.toString() !== req.user.id.toString()) {
                const error = new Error('Acción no válida');
                res.status(404).json({ error: error.message });
            }
            const maintenances = await Maintenance.findById(maintenanceId).populate('equipment');;
            res.status(200).json(maintenances);
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })

        }
    }

    static updateMaintenance = async (req: Request, res: Response) => {
        const { type, date, description, cost, performedBy, supervisedBy } = req.body;
        try {
            // Verificar si el mantenimiento pertenece al técnico autenticado
            if (req.maintenance.performedBy.toString() !== req.user.id.toString()) {
                const error = new Error('Acción no válida');
                res.status(404).json({ error: error.message });
                return;
            }

            req.maintenance.type = type;
            req.maintenance.date = date ? new Date(date + "T12:00:00") : req.maintenance.date;
            req.maintenance.description = description;
            req.maintenance.cost = cost;
            req.maintenance.supervisedBy = supervisedBy;

            await req.maintenance.save();
            res.send('Mantenimiento actualizado correctamente');
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }
    }

    static deleteMaintenance = async (req: Request, res: Response) => {
        try {

            // Busca el equipo relacionado con el mantenimiento
            const equipment = await Equipment.findById(req.maintenance.equipment);
            if (!equipment) {
                res.status(404).json({ error: 'Equipo relacionado no encontrado' });
                return
            }
            // Verificar si el mantenimiento pertenece al técnico autenticado
            if (req.maintenance.performedBy.toString() !== req.user.id.toString()) {
                const error = new Error('Acción no válida');
                res.status(404).json({ error: error.message });
                return;
            }
            // Elimina la referencia del mantenimiento en el array del equipo
            equipment.maintenance = equipment.maintenance.filter(
                (m) => m.toString() !== req.maintenance.id.toString()
            );

            await Promise.allSettled([req.maintenance.deleteOne(), equipment.save()]);
            res.send('Mantenimiento eliminado correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })

        }
    }

    static updateMaintenanceStatus = async (req: Request, res: Response) => {
        try {
            const { completed } = req.body
            req.maintenance.completed = completed
            await req.maintenance.save()

            // Notificar solo si se completó
            if (completed) {
                await req.maintenance.populate('equipment');
                const equipment = req.maintenance.equipment;
                let equipmentBrand = 'Equipo';

                if (equipment && typeof equipment === 'object' && 'brand' in equipment) {
                    equipmentBrand = (equipment as unknown as IEquipment).brand;
                }

                const user = await User.findById(req.maintenance.performedBy);
                if (user && user.notificationsEnabled) {
                    await AuthEmail.sendMaintenanceCompletedNotification({
                        email: user.email,
                        name: user.name,
                        equipment: equipmentBrand,
                        date: req.maintenance.date?.toISOString().split('T')[0] || '',
                        type: req.maintenance.type
                    });
                }
            }

            res.send('Estado del mantenimiento actualizado correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error al actualizar el estado' });
        }
    }
}