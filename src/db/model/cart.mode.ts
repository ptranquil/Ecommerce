import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface cartItemDocument extends Document {
    productId: ObjectId;
    quantity: number;
    price: number;
    totalPrice: number;
}

export interface cartDocument extends Document {
    userId: ObjectId;
    items: [cartItemDocument];
    cartTotal: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'products'
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    price: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: false
    }
})

const cartSchema = new mongoose.Schema<cartDocument>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    items: [cartItemSchema],
    cartTotal: {
        type: Number,
        required: false
    },
    status: {
        type: String,
        enum: ['inCart', 'ordered', 'purchased'],
        default: 'inCart'
    }
}, {
    versionKey: false,
    timestamps: true,
    collection: "carts"
})

export const cartModel = mongoose.model("carts", cartSchema);