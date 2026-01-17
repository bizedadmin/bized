import mongoose, { Schema, Document, Model } from 'mongoose';

export enum BookingStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    CANCELLED = 'cancelled',
    COMPLETED = 'completed',
}

export interface IBooking extends Document {
    businessId: mongoose.Types.ObjectId;
    serviceId: mongoose.Types.ObjectId;
    customerId?: mongoose.Types.ObjectId;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    date: Date;
    startTime: string;
    endTime: string;
    status: BookingStatus;
    notes?: string;
    totalPrice: number;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
    {
        businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
        serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
        customerId: { type: Schema.Types.ObjectId, ref: 'User' },
        customerName: { type: String, required: true },
        customerEmail: { type: String, required: true },
        customerPhone: { type: String, required: true },
        date: { type: Date, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        status: { type: String, enum: Object.values(BookingStatus), default: BookingStatus.PENDING },
        notes: { type: String },
        totalPrice: { type: Number, required: true },
        currency: { type: String, default: 'KES' },
    },
    { timestamps: true }
);

const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
