import mongoose from 'mongoose';

const BusinessSchema = new mongoose.Schema({
    // --- Identity ---
    name: {
        type: String,
        required: [true, 'Please provide a name for your business.'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    alternateName: {
        type: String,
        maxlength: [60, 'Alternate name cannot be more than 60 characters'],
    },
    slug: {
        type: String,
        required: [true, 'Please provide a slug/username for your business.'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot be more than 500 characters'],
    },

    // --- Visuals ---
    logo: {
        type: String, // URL to the logo image
    },
    image: {
        type: String, // URL to a representative image/cover
    },

    // --- Contact & Location ---
    url: {
        type: String, // Official website URL
    },
    email: {
        type: String, // Public contact email
    },
    telephone: {
        type: String, // Public contact phone
    },
    address: {
        streetAddress: String,
        addressLocality: String,
        addressRegion: String,
        postalCode: String,
        addressCountry: String,
        lat: Number,
        lng: Number,
        mapSnapshotUrl: String,
    },

    // --- Social & Metadata ---
    sameAs: [{
        type: String, // Array of social media URLs (e.g. Facebook, Twitter/X, LinkedIn)
    }],

    // --- System / Platform Specific ---
    owner: {
        type: String, // Changed from ObjectId to String to support Google IDs
        ref: 'User',
        required: true,
    },
    plan: {
        type: String,
        enum: ['BASIC', 'PRO', 'ENTERPRISE'],
        default: 'BASIC',
    },
    domain: {
        type: String, // Custom domain connected to the platform
    },

    // --- Wizard Setup Fields ---
    industry: {
        type: String,
        required: false,
        // Enum removed to allow for a broader range of business categories
    },
    schemaOrgType: {
        type: String,
        default: 'LocalBusiness',
    },
    goals: [{
        type: String,
        enum: ['appointments', 'sales', 'payments', 'orders', 'deliveries', 'online_presence'],
    }],
    phone: {
        code: String,
        number: String,
    },
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
        default: 'xl', // rounded-xl by default
    },
    businessCategories: [{
        type: String,
    }],
    professionalTitle: String,
    professionalSubtitle: String,
    selectedFacilities: [{
        type: String,
    }],
    showBookNow: {
        type: Boolean,
        default: true,
    },
    showShopNow: {
        type: Boolean,
        default: true,
    },
    showQuoteRequest: {
        type: Boolean,
        default: true,
    },
    whatsappNumber: String,
    whatsappConnected: {
        type: Boolean,
        default: false,
    },
    businessHours: [{
        day: String,
        isOpen: Boolean,
        openTime: String,
        closeTime: String,
    }],
    deliveryMethods: [{
        type: {
            type: String,
            enum: ['delivery', 'pickup', 'dineIn'],
        },
        fee: Number,
    }],
    paymentMethods: [{
        type: {
            type: String,
            enum: ['cash', 'mpesa', 'bank', 'card'],
        },
        details: mongoose.Schema.Types.Mixed,
    }],
    setupCompleted: {
        type: Boolean,
        default: false,
    },
    isDraft: {
        type: Boolean,
        default: false,
    },
    pages: [{
        title: String,
        slug: String,
        enabled: { type: Boolean, default: true },
        type: { type: String, enum: ['profile', 'bookings', 'shop', 'quote', 'storefront'] },
        settings: { type: mongoose.Schema.Types.Mixed, default: {} }
    }],
    setupStep: {
        type: Number,
        default: 1,
        min: 1,
        max: 8,
    },
    lastGoogleSync: {
        type: Date,
    },
    businessType: {
        type: String,
        required: false,
    },
    // --- Configuration & Settings ---
    configuration: {
        invoice: {
            prefix: { type: String, default: 'INV' },
            footerMessage: { type: String, default: '' },
            defaultTerms: { type: String, default: 'Payment due upon receipt.' },
            taxRate: { type: Number, default: 0 },
            taxName: { type: String, default: 'Tax' },
            showLogo: { type: Boolean, default: true },
        },
        order: {
            prefix: { type: String, default: 'ORD' },
            defaultStatus: { type: String, default: 'pending' },
            enableNotifications: { type: Boolean, default: true },
        },
        customer: {
            welcomeMessage: { type: String, default: '' },
            requirePhone: { type: Boolean, default: false },
        },
    },
}, { timestamps: true });

// Force recompile model in dev to pick up schema changes
if (process.env.NODE_ENV === 'development' && mongoose.models && mongoose.models.Business) {
    delete mongoose.models.Business;
}

export default mongoose.models.Business || mongoose.model('Business', BusinessSchema);
