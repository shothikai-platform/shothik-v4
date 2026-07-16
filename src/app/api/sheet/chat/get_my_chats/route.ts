import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';

export async function GET(request: Request) {
    try {
        await dbConnect();
        // Fetch all sessions sorted by newest updated
        // ⚡ Bolt: Adding .lean() to Mongoose query to bypass document instantiation.
        // Impact: Reduces memory overhead and serialization cost for faster response times.
        const sessions = await SheetSession.find({}).sort({ updatedAt: -1 }).lean();
        return NextResponse.json(sessions);
    } catch (error) {
        console.error('Error fetching sheet sessions:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
