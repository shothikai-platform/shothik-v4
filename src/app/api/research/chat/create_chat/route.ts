import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ResearchChat from '@/models/ResearchChat';
import { getAuthenticatedUser } from '@/lib/server-auth';

export async function POST(request: Request) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name } = body;

        // Input validation: ensure name is a string and does not exceed 100 characters
        if (name !== undefined && (typeof name !== 'string' || name.trim().length > 100)) {
            return NextResponse.json(
                { error: 'Name must be a string up to 100 characters long' },
                { status: 400 }
            );
        }

        await dbConnect();

        const newChat = await ResearchChat.create({
            userId: user._id || user.id,
            name: (name && name.trim()) || 'New Research',
            messages: []
        });

        return NextResponse.json(newChat);
    } catch (error) {
        console.error('Error creating research chat:', error);
        return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 });
    }
}
