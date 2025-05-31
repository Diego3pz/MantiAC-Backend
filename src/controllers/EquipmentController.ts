import type { Request, Response } from 'express';
import Equipment from '../models/Equipment';

export class EquipmentController {
    static createEquipment = async (req: Request, res: Response) => {
        const equipment = new Equipment(req.body);

        // Asignar el técnico al equipo
        equipment.technician = req.user.id;

        // Validar si el número de serie ya existe
        const existingEquipment = await Equipment.findOne({ serialNumber: equipment.serialNumber });
        if (existingEquipment) {
            res.status(400).json({ error: 'El numero de serie ya existe' });
            return
        }

        try {
            await equipment.save();
            res.send('Equipo creado correctamente');
        } catch (error) {
            console.error(error);

        }
    };

    static getAllEquipments = async (req: Request, res: Response) => {
        try {
            const equipments = await Equipment.find({
                $or: [
                    { technician: { $in: req.user.id } },
                ]
            });
            res.status(200).json(equipments);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener los contactos' });
        }
    };

    static getEquipmentByID = async (req: Request, res: Response) => {

        try {
            // Verificar si el equipo pertenece al técnico autenticado
            if (req.equipment.technician.toString() !== req.user.id.toString()) {
                const error = new Error('Acción no válida');
                res.status(404).json({ error: error.message });
                return;
            }

            res.status(200).json(req.equipment);
        } catch (error) {
            console.error(error);

        }
    };

    static updateEquipment = async (req: Request, res: Response) => {
        const { brand, serialNumber, location } = req.body

        // Validar si el número de serie ya existe
        const existingEquipment = await Equipment.findOne({
            serialNumber: serialNumber,
            _id: { $ne: req.equipment._id }
        });


        if (existingEquipment) {
            res.status(400).json({ error: 'El numero de serie ya existe' });
            return;
        }

        try {
            req.equipment.brand = brand
            req.equipment.serialNumber = serialNumber
            req.equipment.location = location

            // Actualizar el equipo 
            await req.equipment.save()

            res.send('Equipo actualizado correctamente');
        } catch (error) {
            console.error(error);

        }
    };

    static deleteEquipment = async (req: Request, res: Response) => {
        try {
            // Verificar si el contacto pertenece al usuario autenticado
            if (req.equipment.technician.toString() !== req.user.id.toString()) {
                const error = new Error('Solo el propietario puede eliminar el contacto');
                res.status(404).json({ error: error.message });
                return;
            }

            // Eliminar el equipo
            await req.equipment.deleteOne();
            res.send('Equipo eliminado correctamente');
        } catch (error) {
            console.error(error);

        }
    };
}