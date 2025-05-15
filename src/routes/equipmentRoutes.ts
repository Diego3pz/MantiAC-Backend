import { Router } from "express";
import { body, param } from 'express-validator';
import { EquipmentController } from "../controllers/EquipmentController";
import { handleInputErrors } from "../middleware/validation";
import { MaintenanceController } from "../controllers/maintenanceController";
import { validateFilterCleaning, validateMaintenanceData, validateMaintenanceType, validatePreventiveMaintenance } from "../middleware/maintenanceValidation";
import { validateEquipmentExists } from "../middleware/Equipment";

const router = Router();

// Obtener todos los matenimientos para dashboard
router.get('/maintenance',
    MaintenanceController.getAllMaintenances
);

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


// Router Maintenance //

// Obtener todos los mantenimientos por equipo
router.get('/:equipmentId/maintenance',
    param('equipmentId')
        .isMongoId().withMessage('El ID del equipo no es válido'),
    validateEquipmentExists,
    handleInputErrors,
    MaintenanceController.getAllMaintenancesByEquipment
);


// Obtener mantenimientos por equipo
router.get('/maintenance/:id',
    param('id')
        .isMongoId().withMessage('El ID del mantenimiento no es válido'),
    handleInputErrors,
    MaintenanceController.getMaintenanceById
);


// Crear un nuevo mantenimiento
router.post('/:equipmentId/maintenance',
    param('equipmentId')
        .isMongoId().withMessage('El ID del equipo no es válido'),
    body('type')
        .notEmpty().withMessage('El tipo de mantenimiento es obligatorio')
        .isIn([
            'Preventivo Completo',
            'Limpieza de filtros',
            'Correctivo'
        ]).withMessage('El tipo de mantenimiento no es válido'),
    body('date')
        .notEmpty().withMessage('La fecha del mantenimiento es obligatoria')
        .isDate().withMessage('La fecha del mantenimiento no es válida'),
    body('description')
        .notEmpty().withMessage('La descripción del mantenimiento es obligatoria'),
    body('performedBy')
        .isMongoId().withMessage('El ID del usuario que realizó el mantenimiento no es válido'),
    body('supervisedBy')
        .isString().withMessage('El nombre del supervisor es obligatorio'),
    validateEquipmentExists,
    validateMaintenanceType,
    validateMaintenanceData,
    handleInputErrors,
    MaintenanceController.createMaintenance
);

// Actualizar un mantenimiento
router.put('/maintenance/:id',
    param('id')
        .isMongoId().withMessage('El ID del mantenimiento no es válido'),
    body('type')
        .notEmpty().withMessage('El tipo de mantenimiento es obligatorio')
        .isIn([
            'Preventivo Completo',
            'Limpieza de filtros',
            'Correctivo'
        ]).withMessage('El tipo de mantenimiento no es válido'),
    body('date')
        .notEmpty().withMessage('La fecha del mantenimiento es obligatoria')
        .isDate().withMessage('La fecha del mantenimiento no es válida'),
    body('description')
        .notEmpty().withMessage('La descripción del mantenimiento es obligatoria'),
    body('performedBy')
        .notEmpty().isMongoId().withMessage('El ID del usuario que realizó el mantenimiento no es válido'),
    body('supervisedBy')
        .notEmpty().withMessage('El nombre del supervisor es obligatorio'),
    validateMaintenanceType,
    validateMaintenanceData,
    handleInputErrors,
    MaintenanceController.updateMaintenance
);

// Eliminar un mantenimiento
router.delete('/maintenance/:id',
    param('id')
        .isMongoId().withMessage('El ID del mantenimiento no es válido'),
    handleInputErrors,
    MaintenanceController.deleteMaintenance
);

export default router;