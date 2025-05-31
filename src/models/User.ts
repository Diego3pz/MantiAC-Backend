import mongoose, { Schema, Document } from "mongoose"

export interface IUser extends Document {
    email: string
    password: string
    name: string
    lastName: string
    confirmed: boolean
    notificationsEnabled: boolean
}

const userSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    notificationsEnabled: {
        type: Boolean,
        default: true
    }
})

// middleware para eliminar los equipos y mantenimientos asociados al usuario
userSchema.pre('deleteOne', { document: true }, async function () {
    const userId = this._id
    if (!userId) return

    // Eliminar los equipos asociados al usuario
    await mongoose.model('Equipment').deleteMany({ technician: userId })

    // Eliminar los mantenimientos asociados al usuario
    await mongoose.model('Maintenance').deleteMany({ performedBy: userId })
})

const User = mongoose.model<IUser>('User', userSchema)
export default User