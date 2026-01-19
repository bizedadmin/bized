import mongoose, { Schema, Document, Model } from 'mongoose';

export enum OrderStatus {
    PENDING = 'pending',
    PAID = 'paid',
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded',
}

export interface IOrderItem {
    productId?: mongoose.Types.ObjectId;
    serviceId?: mongoose.Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
    total: number;
}

export interface IOrder extends Document {
    businessId: mongoose.Types.ObjectId;
    customerId?: mongoose.Types.ObjectId;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    items: IOrderItem[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    currency: string;
    status: OrderStatus;
    paymentStatus: string;
    paymentMethod?: string;
    shippingAddress?: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
    {
        businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
        customerId: { type: Schema.Types.ObjectId, ref: 'User' },
        customerName: { type: String, required: true },
        customerEmail: { type: String, required: true },
        customerPhone: { type: String },
        items: [
            {
                productId: { type: Schema.Types.ObjectId, ref: 'Product' },
                serviceId: { type: Schema.Types.ObjectId, ref: 'Service' },
                name: { type: String, required: true },
                quantity: { type: Number, required: true, min: 1 },
                price: { type: Number, required: true },
                total: { type: Number, required: true },
            },
        ],
        subtotal: { type: Number, required: true },
        tax: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        total: { type: Number, required: true },
        currency: { type: String, default: 'KES' },
        status: {
            type: String,
            enum: Object.values(OrderStatus),
            default: OrderStatus.PENDING,
        },
        paymentStatus: { type: String, default: 'unpaid' },
        paymentMethod: { type: String },
        shippingAddress: {
            street: { type: String },
            city: { type: String },
            state: { type: String },
            zip: { type: String },
            country: { type: String },
        },
        notes: { type: String },
    },
    { timestamps: true }
);

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
