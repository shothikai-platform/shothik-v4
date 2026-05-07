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

        // Security: Input validation
        if (!name || typeof name !== 'string' || name.length > 100) {
            return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
        }

        await dbConnect();

        // Security: Use findOneAndUpdate with userId to prevent IDOR
        const chat = await ResearchChat.findOneAndUpdate(
            { _id: id, userId: user._id || user.id },
            { name }, // Fixed: Use 'name' field from model schema
            { new: true }
        );

        if (!chat) {
            return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
        }

        return NextResponse.json(chat);

    } catch (error) {
        console.error('Error updating chat name:', error);
        return NextResponse.json({ error: 'Failed to update chat' }, { status: 500 });
    }
}
