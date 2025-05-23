import mongoose, { Schema, Document, mongo } from 'mongoose'


export interface IUser extends Document {
    email: string
    password: string
    name: string
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
        confirmed: {
            type: Boolean,
            default: false
        },

    }, { timestamps: true }
)

const User = mongoose.model<IUser>('User', userSchema)
export default User