import mongoose from 'mongoose';

const SystemErrorSchema = new mongoose.Schema({
    path: { type: String, required: true },
    method: { type: String, required: true },
    status: { type: Number, required: true },
    message: { type: String, required: true },
    stack: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
}, {
    timestamps: { createdAt: 'timestamp', updatedAt: false }
});

// TTL Index: Automatically delete logs after 30 days
SystemErrorSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

if (process.env.NODE_ENV === 'development' && mongoose.models && mongoose.models.SystemError) {
    delete mongoose.models.SystemError;
}

export default mongoose.models.SystemError || mongoose.model('SystemError', SystemErrorSchema);
