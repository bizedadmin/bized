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
    _id: {
        type: String, // We will manually set this to the Google ID
    },
    // password field removed as we are using Google Auth only
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
    },
    // Forensic & Status Fields
    status: {
        type: String,
        enum: ['active', 'suspended', 'unverified'],
        default: 'active',
    },
    lastActive: {
        type: Date,
        default: Date.now,
    },
    lastIp: {
        type: String,
    },
    userAgent: {
        type: String,
    },
}, { timestamps: true });

// Force recompile model in dev to pick up schema changes
if (process.env.NODE_ENV === 'development' && mongoose.models && mongoose.models.User) {
    delete mongoose.models.User;
}

export default mongoose.models.User || mongoose.model('User', UserSchema);
