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
    phone: {
        type: String,
        maxlength: [20, 'Phone number cannot be more than 20 characters'],
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        sparse: true, // Allow existing users to not have it initially
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
    // --- Profile Customization ---
    themeColor: {
        type: String,
        default: '#1f2937',
    },
    secondaryColor: {
        type: String,
        default: '#f3f4f6',
    },
    buttonColor: {
        type: String,
        default: '#1f2937',
    },
    fontFamily: {
        type: String,
        default: 'system',
    },
    glassmorphism: {
        type: Boolean,
        default: false,
    },
    borderRadius: {
        type: String,
        default: 'xl',
    },
    pages: [{
        title: String,
        slug: String,
        enabled: { type: Boolean, default: true },
        type: { type: String, enum: ['profile', 'bookings', 'shop', 'quote', 'storefront'] },
        settings: { type: mongoose.Schema.Types.Mixed, default: {} }
    }],
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
