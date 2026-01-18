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

        // 1. Authenticate user
        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name } = body;

        await dbConnect();

        // 2. Update chat with ownership check
        // Securely update by both ID and userId to prevent IDOR
        // Use 'name' instead of 'title' as per the schema (schema has 'name')
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
