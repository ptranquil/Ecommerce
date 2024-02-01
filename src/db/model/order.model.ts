import mongoose, { Schema, Document, Types } from 'mongoose';

export interface orderDocument extends Document {
    userId: Types.ObjectId;
    cartId: Types.ObjectId;
    totalAmount: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

const orderSchema = new Schema<orderDocument>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    cartId: {
        type: Schema.Types.ObjectId,
        ref: 'carts',
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending',
        required: true,
    },
},
    {
        timestamps: true,
        versionKey: false,
        collection: "orders"
    }
);

export const orderModel = mongoose.model('orders', orderSchema);