import mongoose, { Schema, Document, mongo } from 'mongoose'

const userRol = {
    ADMIN: 'admin',
    TECHNICIAN: 'Tecnico',
    SUPERVISOR: 'Supervisor'
} as const

export type UserRol = typeof userRol[keyof typeof userRol]

export interface IUser extends Document {
    email: string
    password: string
    name: string
    rol: UserRol
    confirmed: boolean
}

const userSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            unique: true
        },
        password: {
            type: String,
            required: true,

        },
        name: {
            type: String,
            required: true,
        },
        rol: {
            type: String,
            enum: Object.values(userRol),
            default: userRol.TECHNICIAN
        },
        confirmed: {
            type: Boolean,
            default: false
        },

    }, { timestamps: true }
)

const User = mongoose.model<IUser>('User', userSchema)
export default User