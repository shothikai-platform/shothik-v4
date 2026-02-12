import mongoose from 'mongoose';

const SheetSessionSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true, index: true },
        title: { type: String, default: 'New Chat' },
        status: { type: String, default: 'active' },
    },
    { timestamps: true }
);

// Compound index for efficient user-based queries sorted by update time
SheetSessionSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.models.SheetSession || mongoose.model('SheetSession', SheetSessionSchema);
