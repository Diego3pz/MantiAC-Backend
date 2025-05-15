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

        }
    }

    static getAllMaintenancesByEquipment = async (req: Request, res: Response) => {
        const { equipmentId } = req.params;

        try {
            const maintenances = await Maintenance.find({ equipment: equipmentId }).populate('equipment')
            res.status(200).json(maintenances)
        } catch (error) {
            console.log(error);

        }
    }

    static getAllMaintenances = async (req: Request, res: Response) => {
        try {
            const maintenances = await Maintenance.find({}).populate('equipment');
            res.status(200).json(maintenances);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error al obtener todos los mantenimientos.' });
        }
    };

    static getMaintenanceById = async (req: Request, res: Response) => {
        const { id } = req.params


        try {
            const maintenances = await Maintenance.findById(id);
            if (!maintenances) {
                res.status(404).json({ message: 'Mantenimiento no encontrado' })
                return
            }
            res.status(200).json(maintenances);
        } catch (error) {
            console.log(error);

        }
    }

    static updateMaintenance = async (req: Request, res: Response) => {
        const { id } = req.params
        const { type, date, description } = req.body
        try {
            const maintenance = await Maintenance.findById(id)
            if (!maintenance) {
                const error = new Error('Mantenimiento no encontrado')
                res.status(404).json({ error: error.message })
                return
            }


            maintenance.type = type
            maintenance.date = date
            maintenance.description = description

            await maintenance.save()
            res.send('Mantenimiento actualizado correctamente')
        } catch (error) {
            console.log(error);

        }
    }

    static deleteMaintenance = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            // Busca el mantenimiento por ID
            const maintenance = await Maintenance.findById(id);
            if (!maintenance) {
                 res.status(404).json({ error: 'Mantenimiento no encontrado' });
                 return
            }

            // Busca el equipo relacionado con el mantenimiento
            const equipment = await Equipment.findById(maintenance.equipment);
            if (!equipment) {
                 res.status(404).json({ error: 'Equipo relacionado no encontrado' });
                 return
            }

            // Elimina la referencia del mantenimiento en el array del equipo
            equipment.maintenance = equipment.maintenance.filter(
                (m) => m.toString() !== maintenance.id.toString()
            );

             await Promise.allSettled([maintenance.deleteOne(), equipment.save()]);
            res.send('Mantenimiento eliminado correctamente')
        } catch (error) {
            console.log(error);

        }
    }
}