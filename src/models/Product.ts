import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true,
    },
    name: {
        type: String,
        required: [true, 'Please provide a product name.'],
        maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    image: {
        type: String, // URL to product image
    },
    url: {
        type: String, // URL to the product page
    },
    sku: {
        type: String,
        // unique: true, // Optional: depends on business logic if global or per-store unique
    },
    category: {
        type: String,
        maxlength: [50, 'Category cannot be more than 50 characters'],
    },
    offers: {
        type: {
            type: String,
            default: 'Offer'
        },
        price: {
            type: Number,
            required: [true, 'Please provide a price.'],
            min: 0,
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
                'https://schema.org/PreOrder',
                'https://schema.org/Discontinued',
                'https://schema.org/InStoreOnly'
            ],
            default: 'https://schema.org/InStock',
        },
        url: String
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
