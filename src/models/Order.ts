import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Order Status mapped to Schema.org (though Schema.org uses specific URLs for status)
 * We use an enum for internal consistency.
 */
export enum OrderStatus {
    PENDING = 'OrderPending',
    PROCESSING = 'OrderProcessing',
    SHIPPED = 'OrderInTransit',
    DELIVERED = 'OrderDelivered',
    CANCELLED = 'OrderCancelled',
    RETURNED = 'OrderReturned',
    PAYMENT_DUE = 'OrderPaymentDue',
    PICKUP_AVAILABLE = 'OrderPickupAvailable',
    PROBLEM = 'OrderProblem',
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
    // Schema.org Fields
    identifier: string;             // orderNumber
    orderStatus: OrderStatus;
    customer: {
        name: string;
        email: string;
        phone?: string;
        address?: any;
        id?: mongoose.Types.ObjectId;
    };
    seller: mongoose.Types.ObjectId; // merchant (Business)
    orderedItem: IOrderItem[];
    orderDate: Date;
    paymentMethod?: string;
    paymentMethodId?: string;
    price: number;                  // total
    priceCurrency: string;          // currency

    // Fulfillment / Shipping (Schema.org uses 'orderDelivery')
    orderDelivery?: {
        trackingNumber?: string;
        trackingUrl?: string;
        deliveryMethod?: string;
        carrier?: string;
        address?: {
            streetAddress: string;
            addressLocality: string;
            addressRegion: string;
            postalCode: string;
            addressCountry: string;
        };
    };

    // Internal / Legacy fields for consistency
    subtotal: number;
    tax: number;
    discount: number;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
    {
        identifier: { type: String, required: true, unique: true },
        orderStatus: {
            type: String,
            enum: Object.values(OrderStatus),
            default: OrderStatus.PENDING,
        },
        customer: {
            name: { type: String, required: true },
            email: { type: String, required: true },
            phone: { type: String },
            address: { type: Schema.Types.Mixed },
            id: { type: Schema.Types.ObjectId, ref: 'User' },
        },
        seller: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
        orderedItem: [
            {
                productId: { type: Schema.Types.ObjectId, ref: 'Product' },
                serviceId: { type: Schema.Types.ObjectId, ref: 'Service' },
                name: { type: String, required: true },
                quantity: { type: Number, required: true, min: 1 },
                price: { type: Number, required: true },
                total: { type: Number, required: true },
            },
        ],
        orderDate: { type: Date, default: Date.now },
        paymentMethod: { type: String },
        paymentMethodId: { type: String },
        price: { type: Number, required: true },
        priceCurrency: { type: String, default: 'KES' },

        orderDelivery: {
            trackingNumber: { type: String },
            trackingUrl: { type: String },
            deliveryMethod: { type: String },
            carrier: { type: String },
            address: {
                streetAddress: { type: String },
                addressLocality: { type: String },
                addressRegion: { type: String },
                postalCode: { type: String },
                addressCountry: { type: String },
            },
        },

        subtotal: { type: Number, required: true },
        tax: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        notes: { type: String },
    },
    { timestamps: true }
);

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
