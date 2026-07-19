import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ResearchChat from '@/models/ResearchChat';
import { getAuthenticatedUser } from '@/lib/server-auth';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Authenticate user
        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name } = body;

        // Input validation: non-empty string and length limits to prevent DoS/abuse
        if (typeof name !== 'string' || !name.trim()) {
            return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
        }
        if (name.length > 100) {
            return NextResponse.json({ error: 'Name exceeds maximum length' }, { status: 400 });
        }

        await dbConnect();

        // Secure IDOR protection: update only if the research chat belongs to the authenticated user.
        // Also correct schema mapping: the field in ResearchChat model is 'name', not 'title'.
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
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
