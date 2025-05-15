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

        try {
            res.status(200).json(req.equipment);
        } catch (error) {
            console.error(error);

        }
    };

    static updateEquipment = async (req: Request, res: Response) => {
        const { brand, serialNumber, location } = req.body
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

            // Eliminar el equipo
            await req.equipment.deleteOne();
            res.send('Equipo eliminado correctamente');
        } catch (error) {
            console.error(error);

        }
    };
}