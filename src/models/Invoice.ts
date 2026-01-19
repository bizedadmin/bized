import mongoose, { Schema, Document, Model } from 'mongoose';

export enum InvoiceStatus {
    DRAFT = 'draft',
    SENT = 'sent',
    PAID = 'paid',
    OVERDUE = 'overdue',
    CANCELLED = 'cancelled',
    VOID = 'void',
}

export interface IInvoice extends Document {
    businessId: mongoose.Types.ObjectId;
    orderId?: mongoose.Types.ObjectId;
    customerId?: mongoose.Types.ObjectId;
    invoiceNumber: string;
    customerName: string;
    customerEmail: string;
    customerAddress?: string;
    items: {
        description: string;
        quantity: number;
        price: number;
        total: number;
    }[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    currency: string;
    status: InvoiceStatus;
    dueDate: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
    {
        businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
        orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
        customerId: { type: Schema.Types.ObjectId, ref: 'User' },
        invoiceNumber: { type: String, required: true, unique: true },
        customerName: { type: String, required: true },
        customerEmail: { type: String, required: true },
        customerAddress: { type: String },
        items: [
            {
                description: { type: String, required: true },
                quantity: { type: Number, required: true },
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
            enum: Object.values(InvoiceStatus),
            default: InvoiceStatus.DRAFT,
        },
        dueDate: { type: Date, required: true },
        notes: { type: String },
    },
    { timestamps: true }
);

const Invoice: Model<IInvoice> = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);

export default Invoice;
