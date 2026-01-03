import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ResearchChat from '@/models/ResearchChat';

export async function GET(request: Request) {
    try {
        await dbConnect();
        // Return all chats for development
        const chats = await ResearchChat.find({}).sort({ updatedAt: -1 });
        return NextResponse.json(chats);
    } catch (error) {
        console.error('Error fetching research chats:', error);
        return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
    }
}
