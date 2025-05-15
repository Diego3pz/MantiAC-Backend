import mongoose, { Schema, Document, PopulatedDoc, Types } from 'mongoose'
import Maintenance, { IMaintenance } from './Maintenance';

const locationEquipment = {
    administrativeOffices: 'Oficinas administrativas',
    corporateOffices: 'Oficinas corporativas',
    cafeteria: 'Cafetería',
    showroom: 'Sala de exhibición',
    workshopOffices: 'Oficinas taller',
    spareParts: 'Refacciones',
    waitingRoom: 'Sala de espera',
    site: 'SITE',
    generalManagementMeetingRoom: 'Sala de juntas dirección general',
    corporateMeetingRoom: 'Sala de juntas corporativo',
    cafeteriaTrainingRoom: 'Sala capacitación cafetería',
} as const;

export type LocationEquipment = typeof locationEquipment[keyof typeof locationEquipment];

export interface IEquipment extends Document {
    brand: string;
    serialNumber: string;
    location: LocationEquipment;
    maintenance: PopulatedDoc<IMaintenance & Document>[];
}

const equipmentSchema = new Schema<IEquipment>(
    {

        brand: {
            type: String,
            required: true,
        },
        serialNumber: {
            type: String,
            required: true,
            unique: true,
            validate: {
                validator: function (this: IEquipment, value: string) {
                    return /^[A-Za-z0-9]+$/.test(value);
                },
                message: 'El número de serie solo puede contener letras y números.',
            },
        },
        location: {
            type: String,
            enum: Object.values(locationEquipment),
            default: locationEquipment.administrativeOffices,
            required: true,
        },
        maintenance: [
            {
                type: Types.ObjectId,
                ref: 'Maintenance',
            },
        ],
    }, { timestamps: true }
);

/* Middleware */
equipmentSchema.pre('deleteOne', { document: true }, async function () {
    const equipmentId = this._id
    if (!equipmentId) return

    // Eliminar los mantenimientos asociados al equipo
    await Maintenance.deleteMany({ equipment: equipmentId })

})


const Equipment = mongoose.model<IEquipment>('Equipment', equipmentSchema)
export default Equipment