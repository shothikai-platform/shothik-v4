import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ResearchChat from '@/models/ResearchChat';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await dbConnect();

        const chat = await ResearchChat.findById(id);

        if (!chat) {
            return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
        }

        return NextResponse.json(chat);
    } catch (error) {
        console.error('Error fetching one research chat:', error);
        return NextResponse.json({ error: 'Failed to fetch chat' }, { status: 500 });
    }
}
