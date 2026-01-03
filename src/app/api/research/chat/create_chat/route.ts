import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ResearchChat from '@/models/ResearchChat';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name } = body;

        await dbConnect();

        const newChat = await ResearchChat.create({
            userId: 'temp-user', // TODO: Auth
            name: name || 'New Research',
            messages: []
        });

        return NextResponse.json(newChat);
    } catch (error) {
        console.error('Error creating research chat:', error);
        return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 });
    }
}
