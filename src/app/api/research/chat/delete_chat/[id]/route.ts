import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ResearchChat from '@/models/ResearchChat';
import { getAuthenticatedUser } from '@/lib/server-auth';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await dbConnect();

        // 🛡️ Sentinel: Fix IDOR vulnerability by ensuring the user owns the chat before deleting
        const chat = await ResearchChat.findOneAndDelete({
            _id: id,
            userId: user._id || user.id
        });

        if (!chat) {
            return NextResponse.json({ error: 'Chat not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        // 🛡️ Sentinel: Do not leak error details to the client
        console.error('Error deleting research chat:', error);
        return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
    }
}
