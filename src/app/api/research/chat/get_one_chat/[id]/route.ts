import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ResearchChat from '@/models/ResearchChat';
import { getAuthenticatedUser } from '@/lib/server-auth';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await dbConnect();

        // Optimization: Return plain JS object instead of Mongoose document
        const chat = await ResearchChat.findOne({ _id: id, userId: user._id || user.id }).lean();

        if (!chat) {
            return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
        }

        // Map to ensure 'id' virtual property is preserved for API contract
        const formattedChat = {
            ...chat,
            id: chat._id.toString()
        };

        return NextResponse.json(formattedChat);
    } catch (error) {
        console.error('Error fetching one research chat:', error);
        return NextResponse.json({ error: 'Failed to fetch chat' }, { status: 500 });
    }
}
