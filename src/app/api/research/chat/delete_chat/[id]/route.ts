import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ResearchChat from '@/models/ResearchChat';
import { getAuthenticatedUser } from '@/lib/server-auth';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await dbConnect();

        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Sentinel: Prevent IDOR by ensuring the user can only delete their own chat
        const chat = await ResearchChat.findOneAndDelete({ _id: id, userId: user._id });

        if (!chat) {
            return NextResponse.json({ error: 'Chat not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting research chat:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
