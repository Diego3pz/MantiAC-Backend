import { Router } from "express";
import { body, param } from 'express-validator';
import { EquipmentController } from "../controllers/EquipmentController";
import { handleInputErrors } from "../middleware/validation";

const router = Router();

// Crear un equipo
router.post(
    '/',
    body('brand')
        .notEmpty().withMessage('La Marca del Equipo es Obligatoria'),
    body('serialNumber')
        .notEmpty().withMessage('El Número de Serie del Equipo es Obligatorio'),
    body('location')
        .notEmpty().withMessage('La Ubicación del Equipo es Obligatoria')
        .isIn([
            'Oficinas administrativas',
            'Oficinas corporativas',
            'Cafetería',
            'Sala de exhibición',
            'Oficinas taller',
            'Refacciones',
            'Sala de espera',
            'SITE',
            'Sala de juntas dirección general',
            'Sala de juntas corporativo',
            'Sala capacitación cafetería',
        ]).withMessage('La ubicación no es válida'),
    handleInputErrors,
    EquipmentController.createEquipment
);

// Obtener todos los equipos
router.get('/', EquipmentController.getAllEquipments);

// Obtener un equipo por ID
router.get(
    '/:id',
    param('id')
        .isMongoId().withMessage('El ID del equipo no es válido'),
    handleInputErrors,
    EquipmentController.getEquipmentByID
);

// Actualizar un equipo por ID
router.put(
    '/:id',
    param('id')
        .isMongoId().withMessage('El ID del equipo no es válido'),
    body('brand')
        .notEmpty().withMessage('La Marca del Equipo no puede estar vacía'),
    body('serialNumber')
        .notEmpty().withMessage('El Número de Serie del Equipo no puede estar vacío'),
    body('location')
        
        .isIn([
            'Oficinas administrativas',
            'Oficinas corporativas',
            'Cafetería',
            'Sala de exhibición',
            'Oficinas taller',
            'Refacciones',
            'Sala de espera',
            'SITE',
            'Sala de juntas dirección general',
            'Sala de juntas corporativo',
            'Sala capacitación cafetería',
        ]).withMessage('La ubicación no es válida'),
    handleInputErrors,
    EquipmentController.updateEquipment
);

// Eliminar un equipo por ID
router.delete(
    '/:id',
    param('id')
        .isMongoId().withMessage('El ID del equipo no es válido'),
    handleInputErrors,
    EquipmentController.deleteEquipment
);

export default router;