import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Customer model based on Schema.org (Person/Organization)
 */
export interface ICustomer extends Document {
    identifier: string;             // customerId
    givenName?: string;
    familyName?: string;
    name: string;                   // Full name (Person) or Name (Organization)
    email: string;
    telephone?: string;
    image?: string;
    jobTitle?: string;
    address?: {
        streetAddress?: string;
        addressLocality?: string;
        addressRegion?: string;
        postalCode?: string;
        addressCountry?: string;
    };
    category?: string;              // Segment/Label
    notes?: string;
    businessId: mongoose.Types.ObjectId; // Owner business
    totalOrders: number;
    totalSpent: number;
    lastOrderDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
    {
        identifier: { type: String, unique: true },
        givenName: { type: String },
        familyName: { type: String },
        name: { type: String, required: true },
        email: { type: String, required: true, index: true },
        telephone: { type: String },
        image: { type: String },
        jobTitle: { type: String },
        address: {
            streetAddress: { type: String },
            addressLocality: { type: String },
            addressRegion: { type: String },
            postalCode: { type: String },
            addressCountry: { type: String },
        },
        category: { type: String },
        notes: { type: String },
        businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
        totalOrders: { type: Number, default: 0 },
        totalSpent: { type: Number, default: 0 },
        lastOrderDate: { type: Date },
    },
    { timestamps: true }
);

// Composite index for email per business
CustomerSchema.index({ email: 1, businessId: 1 }, { unique: true });

const Customer: Model<ICustomer> = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);

export default Customer;
