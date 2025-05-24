import { Request, Response } from 'express';
import Maintenance from '../models/Maintenance';
import Equipment from '../models/Equipment';

export class MaintenanceController {
    static createMaintenance = async (req: Request, res: Response) => {



        try {
            const maintenance = new Maintenance(req.body)
            maintenance.equipment = req.equipment.id
            req.equipment.maintenance.push(maintenance.id)

            await Promise.allSettled([maintenance.save(), req.equipment.save()])
            res.send('Mantenimiento creado correctamente')

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static getAllMaintenancesByEquipment = async (req: Request, res: Response) => {
        const { equipmentId } = req.params;

        try {
            const maintenances = await Maintenance.find({ equipment: equipmentId }).populate('equipment')
            res.status(200).json(maintenances)
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})

        }
    }

    static getAllMaintenances = async (req: Request, res: Response) => {
        try {
            const maintenances = await Maintenance.find({}).populate('equipment');
            res.status(200).json(maintenances);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener todos los mantenimientos.' });
            return
        }
    };

    static getMaintenanceById = async (req: Request, res: Response) => {


        try {
            const { maintenanceId } = req.params
            const maintenances = await Maintenance.findById(maintenanceId).populate('equipment');;
            res.status(200).json(maintenances);
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})

        }
    }

    static updateMaintenance = async (req: Request, res: Response) => {
        const { type, date, description, cost, performedBy, supervisedBy } = req.body
        try {

            req.maintenance.type = type
            req.maintenance.date = date
            req.maintenance.description = description
            req.maintenance.cost = cost
            req.maintenance.performedBy = performedBy
            req.maintenance.supervisedBy = supervisedBy

            // Actualiza el mantenimiento
            await req.maintenance.save()
            res.send('Mantenimiento actualizado correctamente')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})

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

            // Elimina la referencia del mantenimiento en el array del equipo
            equipment.maintenance = equipment.maintenance.filter(
                (m) => m.toString() !== req.maintenance.id.toString()
            );

            await Promise.allSettled([req.maintenance.deleteOne(), equipment.save()]);
            res.send('Mantenimiento eliminado correctamente')
        } catch (error) {
           res.status(500).json({error: 'Hubo un error'})

        }
    }

    static updateMaintenanceStatus = async (req: Request, res: Response) => {
        try {
            const { completed } = req.body
            req.maintenance.completed = completed
            await req.maintenance.save()
            res.send('Estado del mantenimiento actualizado correctamente')

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error al actualizar el estado' });

        }
    }
}