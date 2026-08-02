import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ResearchChat from '@/models/ResearchChat';
import { getAuthenticatedUser } from '@/lib/server-auth';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // 1. Authentication check
        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name } = body;

        // 2. Input Validation (Defense in Depth)
        if (typeof name !== 'string' || name.trim() === '' || name.length > 100) {
            return NextResponse.json({ error: 'Invalid name parameter' }, { status: 400 });
        }

        await dbConnect();

        // 3. IDOR protection: only update if the chat belongs to the authenticated user
        // and fix mapping to correct schema field 'name'
        const chat = await ResearchChat.findOneAndUpdate(
            { _id: id, userId: user._id || user.id },
            { name: name.trim() },
            { new: true }
        );

        if (!chat) {
            return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
        }

        return NextResponse.json(chat);

    } catch (error) {
        console.error('Error updating chat name:', error);
        // Fail securely: do not leak detailed error message to client
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
