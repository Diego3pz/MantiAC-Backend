import type { Request, Response } from 'express';
import Equipment from '../models/Equipment';

export class EquipmentController {
    static createEquipment = async (req: Request, res: Response) => {
        const equipment = new Equipment(req.body);
        try {
            await equipment.save();
            res.send('Equipo creado correctamente');
        } catch (error) {
            console.error(error);
            
        }
    };

    static getAllEquipments = async (req: Request, res: Response) => {
        try {
            const equipments = await Equipment.find();
            res.status(200).json(equipments);
        } catch (error) {
            console.error(error);
           
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
            res.send('Equipo actualizado correctamente');
        } catch (error) {
            console.error(error);
            
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
            
        }
    };
}