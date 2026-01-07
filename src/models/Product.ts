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
    price: {
        type: Number,
        required: [true, 'Please provide a price.'],
        min: 0,
    },
    image: {
        type: String, // URL to product image
    },
    category: {
        type: String,
        maxlength: [50, 'Category cannot be more than 50 characters'],
    },
    available: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
