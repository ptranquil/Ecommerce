import mongoose, { Schema, Document } from 'mongoose';

export interface userDocument extends Document {
    name: string;
    email: string;
    password: string;
    phoneNo: string;
    address: string;
    token: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<userDocument>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true
    },
    phoneNo: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: false,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: false
    }
}, {
    versionKey: false,
    timestamps: true,
    collection: "users",
})

export const userModel = mongoose.model("users", userSchema);