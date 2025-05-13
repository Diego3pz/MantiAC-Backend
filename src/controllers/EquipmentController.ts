import type { Request, Response } from 'express';
import Equipment from '../models/Equipment';

export class EquipmentController {
    static createEquipment = async (req: Request, res: Response) => {
        const equipment = new Equipment(req.body);

        try {
            await equipment.save();
            res.status(201).json({ message: 'Equipo creado correctamente', equipment });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear el equipo', error });
        }
    };

    static getAllEquipments = async (req: Request, res: Response) => {
        try {
            const equipments = await Equipment.find();
            res.status(200).json(equipments);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener los equipos', error });
        }
    };

    static getEquipmentByID = async (req: Request, res: Response) => {
        const { id } = req.params;

        try {
            const equipment = await Equipment.findById(id);
            if (!equipment) {
                res.status(404).json({ message: 'Equipo no encontrado' });
                return
            }
            res.status(200).json(equipment);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener el equipo', error });
        }
    };

    static updateEquipment = async (req: Request, res: Response) => {
        const { id } = req.params;

        try {
            const equipment = await Equipment.findByIdAndUpdate(id, req.body, { new: true });
            if (!equipment) {
                res.status(404).json({ message: 'Equipo no encontrado' });
                return
            }
            res.status(200).json({ message: 'Equipo actualizado correctamente', equipment });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar el equipo', error });
        }
    };

    static deleteEquipment = async (req: Request, res: Response) => {
        const { id } = req.params;

        try {
            const equipment = await Equipment.findByIdAndDelete(id);
            if (!equipment) {
                res.status(404).json({ message: 'Equipo no encontrado' });
                return
            }
            res.status(200).json({ message: 'Equipo eliminado correctamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al eliminar el equipo', error });
        }
    };
}