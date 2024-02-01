import mongoose, { Schema, Document } from 'mongoose';

export interface productDocument extends Document {
    name: string;
    price: number;
    description: string;
    category: string;
    quantity: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const productSchema = new Schema<productDocument>({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        default: false
    }
}, {
    versionKey: false,
    timestamps: true,
    collection: "products",
})

export const productModel = mongoose.model("products", productSchema);