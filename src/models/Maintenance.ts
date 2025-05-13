import mongoose, { Schema, Document } from 'mongoose';

const maintenanceType = {
    fullPreventive: 'Preventivo Completo',
    filterCleaning: 'Limpieza de filtros',
    corrective: 'Correctivo',
} as const;

export type MaintenanceType = typeof maintenanceType[keyof typeof maintenanceType];

export interface IMaintenance extends Document {
    equipment: mongoose.Types.ObjectId;
    type: MaintenanceType;
    date: Date;
    description?: string;
    cost?: number;
    performedBy: mongoose.Types.ObjectId; 
    supervisedBy: string;
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
            validate: {
                validator: function (this: IMaintenance, value: string) {
                    
                    if (this.type === maintenanceType.corrective && !value) {
                        return false;
                    }
                    return true;
                },
                message: 'La descripción es obligatoria para mantenimientos correctivos.',
            },
        },
        cost: {
            type: Number,
            validate: {
                validator: function (this: IMaintenance, value: number) {
                    
                    if (this.type === maintenanceType.corrective && (value === null || value === undefined)) {
                        return false;
                    }
                    return true;
                },
                message: 'El costo es obligatorio para mantenimientos correctivos.',
            },
        },
        performedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        supervisedBy: {
            type: String,
        },
    },
    { timestamps: true }
);

const Maintenance = mongoose.model<IMaintenance>('Maintenance', maintenanceSchema);
export default Maintenance;