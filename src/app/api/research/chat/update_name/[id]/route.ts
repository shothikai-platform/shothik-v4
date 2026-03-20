import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ResearchChat from '@/models/ResearchChat';
import { getAuthenticatedUser } from '@/lib/server-auth';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name } = body;

        await dbConnect();

        // 🛡️ Sentinel: Fix IDOR vulnerability by ensuring the user owns the chat before updating
        const chat = await ResearchChat.findOneAndUpdate(
            { _id: id, userId: user._id || user.id },
            { name }, // The schema uses the 'name' field
            { new: true }
        );

        if (!chat) {
            return NextResponse.json({ error: 'Chat not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json(chat);

    } catch (error) {
        // 🛡️ Sentinel: Do not leak error details to the client
        console.error('Error updating chat name:', error);
        return NextResponse.json({ error: 'Failed to update chat' }, { status: 500 });
    }
}
