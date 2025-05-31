import { Router } from "express";
import { body, param } from 'express-validator';
import { EquipmentController } from "../controllers/EquipmentController";
import { handleInputErrors } from "../middleware/validation";
import { MaintenanceController } from "../controllers/maintenanceController";
import { validateFilterCleaning, validateMaintenanceData, validateMaintenanceType, validatePreventiveMaintenance } from "../middleware/maintenanceValidation";
import { autenticate } from '../middleware/auth'
import { validateEquipmentExists } from "../middleware/Equipment";
import { hasAuthorization, validateMaintenanceExists } from "../middleware/Maintenance";

const router = Router();

router.use(autenticate)

// Obtener todos los matenimientos para dashboard
router.get('/maintenance',
    MaintenanceController.getAllMaintenances
);

// Router Equipment //
router.param('equipmentId', validateEquipmentExists)

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
    '/:equipmentId',
    param('equipmentId')
        .isMongoId().withMessage('El ID del equipo no es válido'),
    handleInputErrors,
    EquipmentController.getEquipmentByID
);

// Actualizar un equipo por ID
router.put(
    '/:equipmentId',
    param('equipmentId')
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
    hasAuthorization,
    EquipmentController.updateEquipment
);

// Eliminar un equipo por ID
router.delete(
    '/:equipmentId',
    param('equipmentId')
        .isMongoId().withMessage('El ID del equipo no es válido'),
    handleInputErrors,
    EquipmentController.deleteEquipment
);


// Router Maintenance //
router.param('maintenanceId', validateMaintenanceExists)

// Obtener todos los mantenimientos por equipo
router.get('/:equipmentId/maintenance',
    param('equipmentId')
        .isMongoId().withMessage('El ID del equipo no es válido'),
    handleInputErrors,
    hasAuthorization,
    MaintenanceController.getAllMaintenancesByEquipment
);


// Obtener mantenimientos por equipo
router.get('/maintenance/:maintenanceId',
    param('maintenanceId')
        .isMongoId().withMessage('El ID del mantenimiento no es válido'),
    handleInputErrors,
    MaintenanceController.getMaintenanceById
);


// Crear un nuevo mantenimiento
router.post('/:equipmentId/maintenance',
    hasAuthorization,
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
    // Verificar que el tipo sea correctivo para la descripción y el costo
    body('description')
        .if(body('type').equals('Correctivo'))
        .notEmpty().withMessage('La descripción es obligatoria para correctivos'),
    body('cost')
        .if(body('type').equals('Correctivo'))
        .notEmpty().withMessage('El costo es obligatorio para correctivos'),
    body('supervisedBy')
        .isString().withMessage('El nombre del supervisor es obligatorio'),
    handleInputErrors,
    validateMaintenanceType,
    validateMaintenanceData,
    MaintenanceController.createMaintenance
);

// Actualizar un mantenimiento
router.put('/maintenance/:maintenanceId',
    param('maintenanceId')
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

    // Verificar que el tipo sea correctivo para la descripción y el costo
    body('description')
        .if(body('type').equals('Correctivo'))
        .notEmpty().withMessage('La descripción es obligatoria para correctivos'),
    body('cost')
        .if(body('type').equals('Correctivo'))
        .notEmpty().withMessage('El costo es obligatorio para correctivos'),
    body('supervisedBy')
        .notEmpty().withMessage('El nombre del supervisor es obligatorio'),
    handleInputErrors,
    validateMaintenanceType,
    validateMaintenanceData,
    MaintenanceController.updateMaintenance
);

// Eliminar un mantenimiento
router.delete('/maintenance/:maintenanceId',
    param('maintenanceId')
        .isMongoId().withMessage('El ID del mantenimiento no es válido'),
    handleInputErrors,
    MaintenanceController.deleteMaintenance
);

// Actualizar el estado de un mantenimiento
router.post('/:equipmentId/maintenance/:maintenanceId/completed',
    param('equipmentId')
        .isMongoId().withMessage('El ID del equipo no es válido'),
    param('maintenanceId')
        .isMongoId().withMessage('El ID del mantenimiento no es válido'),
    body('completed')
        .notEmpty().withMessage('El estado del mantenimiento es obligatorio')
        .isBoolean().withMessage('El estado del mantenimiento debe ser un booleano'),
    handleInputErrors,
    hasAuthorization,
    MaintenanceController.updateMaintenanceStatus
)

export default router;