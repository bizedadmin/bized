import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please provide an email address.'],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email address',
        ],
        unique: true,
    },
    source: {
        type: String,
        default: 'landing_waitlist',
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'converted'],
        default: 'new',
    },
    ipAddress: {
        type: String,
        select: false,
    },
    userAgent: {
        type: String,
        select: false,
    }
}, { timestamps: true });

// Prevent overwrite errors in hot-reloading environment
export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
