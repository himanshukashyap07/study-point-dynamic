import mongoose, { Schema, model, models, Document } from 'mongoose';


export interface IUser extends Document {
    username: string;
    avatar:string;
    email: string;
    password: string;
    role: 'student' | 'admin';
    verificationCode:string;
    isBlock: boolean;
    isVerified: boolean;
}

const UserSchema = new Schema<IUser>({
    username: { type: String, required: true },
    avatar: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },

    verificationCode:{type:String},
    isBlock: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false }
}, { timestamps: true });

export const User = models.User || model<IUser>('User', UserSchema);
