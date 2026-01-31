import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ResearchChat from '@/models/ResearchChat';
import { getAuthenticatedUser } from '@/lib/server-auth';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name } = body;

        await dbConnect();

        // 🛡️ Sentinel Security Fix:
        // 1. Replaced findByIdAndUpdate with findOneAndUpdate to enforce ownership check (IDOR prevention)
        // 2. Added userId to query to ensure user can only update their own chats
        // 3. Fixed bug: Updating 'name' field instead of non-existent 'title' field
        const chat = await ResearchChat.findOneAndUpdate(
            { _id: id, userId: user._id || user.id },
            { name: name },
            { new: true }
        );

        if (!chat) {
            return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
        }

        return NextResponse.json(chat);

    } catch (error) {
        console.error('Error updating chat name:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
