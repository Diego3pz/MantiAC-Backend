import mongoose, { Schema, Document, Types } from 'mongoose';
import Equipment from './Equipment';

export const maintenanceType = {
    fullPreventive: 'Preventivo Completo',
    filterCleaning: 'Limpieza de filtros',
    corrective: 'Correctivo',
} as const;

export type MaintenanceType = typeof maintenanceType[keyof typeof maintenanceType];

export interface IMaintenance extends Document {
    equipment: Types.ObjectId;
    type: MaintenanceType;
    date: Date;
    description?: string;
    cost?: number;
    performedBy: Types.ObjectId;
    supervisedBy: string;
    completed: boolean;
}

const maintenanceSchema = new Schema<IMaintenance>(
    {
        equipment: {
            type: Schema.Types.ObjectId,
            ref: 'Equipment',
            required: true,
        },
        type: {
            type: String,
            enum: Object.values(maintenanceType),
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        description: {
            type: String,
        },
        cost: {
            type: Number,
        },
        performedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        supervisedBy: {
            type: String,
        },
        completed: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Middleware para actualizar el array de mantenimientos en el equipo relacionado
maintenanceSchema.pre('deleteOne', { document: true }, async function () {
    const maintenanceId = this._id;
    if (!maintenanceId) return;
    // Quitar la referencia al mantenimiento en el array del equipo
    await Equipment.updateOne(
        { _id: this.equipment },
        { $pull: { maintenance: maintenanceId } }
    );
})


const Maintenance = mongoose.model<IMaintenance>('Maintenance', maintenanceSchema);
export default Maintenance;