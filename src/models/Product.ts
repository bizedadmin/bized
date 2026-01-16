import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true,
    },
    type: {
        type: String,
        enum: ['Product', 'Service'],
        default: 'Product',
    },
    name: {
        type: String,
        required: [true, 'Please provide a product name.'],
        maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    description: {
        type: String,
        maxlength: [1500, 'Description cannot be more than 1500 characters'],
    },
    image: [String], // URLs to product images
    url: {
        type: String, // URL to the product landing page
    },
    sku: {
        type: String,
    },
    mpn: {
        type: String, // Manufacturer Part Number
    },
    brand: {
        type: String,
    },
    unit: {
        type: String, // e.g., kg, pcs, hour
    },
    category: {
        type: String,
        maxlength: [100, 'Category cannot be more than 100 characters'],
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
            default: 'KES'
        },
        availability: {
            type: String,
            enum: [
                'https://schema.org/InStock',
                'https://schema.org/OutOfStock',
                'https://schema.org/PreOrder',
                'https://schema.org/Discontinued',
                'https://schema.org/InStoreOnly',
                'https://schema.org/OnlineOnly'
            ],
            default: 'https://schema.org/InStock',
        },
        url: String
    },
    status: {
        type: String,
        enum: ['active', 'draft', 'archived', 'online', 'offline'],
        default: 'online',
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);

