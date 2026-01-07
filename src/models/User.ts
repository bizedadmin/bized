import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name for this user.'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email for this user.'],
        maxlength: [60, 'Email cannot be more than 60 characters'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password for this user.'],
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    // Extended Profile Fields
    jobTitle: {
        type: String,
        maxlength: [100, 'Job title cannot be more than 100 characters'],
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot be more than 500 characters'],
    },
    website: {
        type: String,
    },
    image: {
        type: String,
    }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
