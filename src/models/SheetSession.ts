import mongoose from 'mongoose';

const SheetSessionSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true, index: true },
        title: { type: String, default: 'New Chat' },
        status: { type: String, default: 'active' },
    },
    { timestamps: true }
);

// Compound index to optimize get_my_chats query (filter by user + sort by update time)
SheetSessionSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.models.SheetSession || mongoose.model('SheetSession', SheetSessionSchema);
