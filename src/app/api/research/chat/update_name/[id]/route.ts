import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ResearchChat from '@/models/ResearchChat';
import { getAuthenticatedUser } from '@/lib/server-auth';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Authenticate the user to prevent unauthorized access
        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name } = body;

        // Input validation: ensure the name is a non-empty string
        if (typeof name !== 'string' || name.trim().length === 0) {
            return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
        }

        // Input length validation: restrict name to 100 characters to prevent DoS/database bloat
        const sanitizedName = name.slice(0, 100).trim();

        await dbConnect();

        // IDOR protection: query must be scoped by the authenticated user's ID
        const chat = await ResearchChat.findOneAndUpdate(
            { _id: id, userId: user._id || user.id },
            { name: sanitizedName }, // Update the correct model field 'name' (not 'title')
            { new: true }
        );

        if (!chat) {
            // Fails securely: do not reveal whether the chat exists if the user doesn't own it
            return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
        }

        return NextResponse.json(chat);

    } catch (error) {
        console.error('Error updating chat name:', error);
        // Generic error response to avoid stack trace/detail leakage
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
