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
        const body = await request.json();
        const { name } = body;

        // Security: Ensure user is authenticated
        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Security: Scope update to authenticated user to prevent IDOR
        // Fix: Use 'name' field instead of 'title' to match schema
        const chat = await ResearchChat.findOneAndUpdate(
            { _id: id, userId: user._id || user.id },
            { name },
            { new: true }
        );

        if (!chat) {
            return NextResponse.json({ error: 'Chat not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json(chat);

    } catch (error) {
        console.error('Error updating chat name:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
