import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
    event_id: {
        type: String, // UUID
        required: true,
        unique: true,
    },
    actor: {
        id: { type: String, required: true },
        email: { type: String, required: true },
        role: { type: String, required: true },
        ip: { type: String },
        user_agent: { type: String },
    },
    action: {
        type: { type: String, required: true }, // e.g. AUTH_LOGIN, USER_UPDATE
        description: { type: String },
    },
    resource: {
        type: { type: String }, // e.g. User, Business, System
        id: { type: String },
    },
    metadata: {
        changes: { type: Map, of: String }, // Flattened JSON or key-value diff
        reason: { type: String },
        is_impersonation: { type: Boolean, default: false },
    },
    status: {
        type: String,
        enum: ['SUCCESS', 'FAILURE', 'DENIED'],
        default: 'SUCCESS',
    },
    severity: {
        type: String,
        enum: ['INFO', 'WARNING', 'CRITICAL'],
        default: 'INFO',
    },
}, {
    timestamps: { createdAt: 'timestamp', updatedAt: false }
});

// TTL Index: Automatically delete logs after 90 days
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Force recompile model in dev to pick up schema changes
if (process.env.NODE_ENV === 'development' && mongoose.models && mongoose.models.AuditLog) {
    delete mongoose.models.AuditLog;
}

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
