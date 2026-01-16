import mongoose from 'mongoose';

const ServiceAreaSchema = new mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true,
    },
    name: {
        type: String,
        required: [true, 'Please provide an area name.'],
        maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    type: {
        type: String,
        enum: ['City', 'Region', 'Radius', 'Virtual', 'Custom'],
        default: 'City'
    },
    radius: {
        type: Number, // Only if type is Radius
    },
    unit: {
        type: String,
        enum: ['km', 'miles'],
        default: 'km'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.models.ServiceArea || mongoose.model('ServiceArea', ServiceAreaSchema);
