import mongoose from 'mongoose';

const ServiceBundleSchema = new mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true,
    },
    name: {
        type: String,
        required: [true, 'Please provide a bundle name.'],
        maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    description: {
        type: String,
        maxlength: [1500, 'Description cannot be more than 1500 characters'],
    },
    services: [{
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
            required: true
        },
        quantity: {
            type: Number,
            default: 1
        }
    }],
    price: {
        type: Number,
        required: [true, 'Please provide a bundle price.'],
        min: 0,
    },
    currency: {
        type: String,
        default: 'USD'
    },
    image: [String],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.models.ServiceBundle || mongoose.model('ServiceBundle', ServiceBundleSchema);
