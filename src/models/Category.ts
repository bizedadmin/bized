import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true,
    },
    name: {
        type: String,
        required: [true, 'Please provide a category name.'],
        maxlength: [50, 'Category name cannot be more than 50 characters'],
    },
    description: {
        type: String,
        maxlength: [200, 'Description cannot be more than 200 characters'],
    },
}, {
    timestamps: true,
});

// Avoid duplicate categories for the same business
CategorySchema.index({ business: 1, name: 1 }, { unique: true });

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
