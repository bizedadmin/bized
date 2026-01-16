import mongoose from 'mongoose';

const AddOnSchema = new mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true,
    },
    name: {
        type: String,
        required: [true, 'Please provide an add-on name.'],
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
    currency: {
        type: String,
        default: 'USD'
    },
    duration: {
        type: Number, // Extra time in minutes
        default: 0
    },
    services: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.models.AddOn || mongoose.model('AddOn', AddOnSchema);
