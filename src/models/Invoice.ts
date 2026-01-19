import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Invoice Status mapped to Schema.org (though Schema.org uses strings/text)
 * We use an enum for internal consistency.
 */
export enum InvoiceStatus {
    DRAFT = 'Draft',
    SENT = 'Sent',
    PAID = 'Paid',
    OVERDUE = 'Overdue',
    CANCELLED = 'Cancelled',
    VOID = 'Void',
}

export interface IInvoice extends Document {
    // Schema.org Fields
    identifier: string;            // The identifier for the invoice.
    accountId?: string;           // The identifier for the account the invoice is about.
    billingPeriod?: string;       // The time period covered by this invoice.
    broker?: any;                 // An entity that arranges for an exchange between a buyer and a seller.
    confirmationNumber?: string;  // A number that confirms the invoice.
    customer: {                   // Party placing the order or paying the invoice.
        name: string;
        email: string;
        address?: string;
        id?: mongoose.Types.ObjectId;
    };
    minimumPaymentDue?: {         // The minimum amount due at this time.
        price: number;
        priceCurrency: string;
    };
    paymentDueDate: Date;         // The date that payment is due.
    paymentMethod?: string;       // The name of the credit card or other method of payment.
    paymentMethodId?: string;     // An identifier for the method of payment used.
    paymentStatus: InvoiceStatus; // The status of payment.
    provider: mongoose.Types.ObjectId; // The service provider, service operator, or vendor (Business).
    referencesOrder?: mongoose.Types.ObjectId; // The Order(s) related to this Invoice.
    scheduledPaymentDate?: Date;  // The date the payment is scheduled to occur.
    totalPaymentDue: {            // The total amount due at this time.
        price: number;
        priceCurrency: string;
    };

    // Internal / Custom Fields (Not explicitly in schema.org/Invoice but needed for app)
    items: {
        description: string;
        quantity: number;
        price: number;
        total: number;
    }[];
    subtotal: number;
    tax: number;
    discount: number;
    notes?: string;               // Can be mapped to 'description' from Thing
    createdAt: Date;
    updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
    {
        identifier: { type: String, required: true, unique: true },
        accountId: { type: String },
        billingPeriod: { type: String },
        broker: { type: Schema.Types.Mixed },
        confirmationNumber: { type: String },
        customer: {
            name: { type: String, required: true },
            email: { type: String, required: true },
            address: { type: String },
            id: { type: Schema.Types.ObjectId, ref: 'User' },
        },
        minimumPaymentDue: {
            price: { type: Number },
            priceCurrency: { type: String },
        },
        paymentDueDate: { type: Date, required: true },
        paymentMethod: { type: String },
        paymentMethodId: { type: String },
        paymentStatus: {
            type: String,
            enum: Object.values(InvoiceStatus),
            default: InvoiceStatus.DRAFT,
        },
        provider: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
        referencesOrder: { type: Schema.Types.ObjectId, ref: 'Order' },
        scheduledPaymentDate: { type: Date },
        totalPaymentDue: {
            price: { type: Number, required: true },
            priceCurrency: { type: String, required: true },
        },
        // Line items and totals for internal processing
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
        notes: { type: String },
    },
    { timestamps: true }
);

const Invoice: Model<IInvoice> = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);

export default Invoice;
