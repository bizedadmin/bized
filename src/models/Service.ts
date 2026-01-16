import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true,
    },
    name: {
        type: String,
        required: [true, 'Please provide a service name.'],
        maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    description: {
        type: String,
        maxlength: [1500, 'Description cannot be more than 1500 characters'],
    },
    serviceType: {
        type: String, // e.g., "Home Cleaning", "Haircut"
    },
    image: [String],
    category: {
        type: String, // e.g., "Health & Beauty"
    },
    brand: {
        type: String, // e.g., "Bized"
    },
    audience: {
        type: String, // e.g., "Women", "Corporate Professionals"
    },
    areaServed: {
        type: String, // e.g., "Nairobi", "Worldwide"
    },
    availableChannel: {
        type: String, // e.g., "In-store", "Online"
    },
    serviceOutput: {
        type: String, // e.g., "A digital report", "A fresh haircut"
    },
    slogan: {
        type: String,
    },
    offers: {
        price: {
            type: Number,
            required: [true, 'Please provide a price.'],
            min: 0,
        },
        cost: {
            type: Number,
            min: 0,
        },
        discount: {
            type: Number,
            default: 0,
        },
        tax: {
            type: Number,
            default: 0,
        },
        priceCurrency: {
            type: String,
            required: [true, 'Please provide a currency.'],
            default: 'USD'
        },
        availability: {
            type: String,
            enum: [
                'https://schema.org/InStock',
                'https://schema.org/OutOfStock',
                'https://schema.org/OnlineOnly',
                'https://schema.org/InStoreOnly',
                'https://schema.org/PreOrder',
                'https://schema.org/Discontinued'
            ],
            default: 'https://schema.org/InStock',
        },
        url: String
    },
    duration: {
        type: Number, // In minutes
        default: 60
    },
    bufferTime: {
        type: Number, // In minutes
        default: 0
    },
    color: {
        type: String,
    },
    unit: {
        type: String, // e.g., per person, per session
    },
    status: {
        type: String,
        enum: ['online', 'offline', 'active', 'inactive', 'draft', 'archived'],
        default: 'online',
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export default mongoose.models.Service || mongoose.model('Service', ServiceSchema);
