import { Request, Response } from 'express';
import Maintenance from '../models/Maintenance';
import Equipment from '../models/Equipment';
import mongoose from 'mongoose';

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

    static getAllMaintenances = async (req: Request, res: Response) => {
        try {

        } catch (error) {
            console.log(error);

        }
    }

    static getMaintenanceById = async (req: Request, res: Response) => {
        try {

        } catch (error) {
            console.log(error);

        }
    }

    static updateMaintenance = async (req: Request, res: Response) => {
        try {

        } catch (error) {
            console.log(error);

        }
    }

    static deleteMaintenance = async (req: Request, res: Response) => {
        try {

        } catch (error) {
            console.log(error);

        }
    }
}