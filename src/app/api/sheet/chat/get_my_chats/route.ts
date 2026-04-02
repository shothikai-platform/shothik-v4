import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';

export async function GET(request: Request) {
    try {
        await dbConnect();
        // Fetch all sessions sorted by newest updated
        // Optimization: Added .lean() to reduce memory usage and query time
        const rawSessions = await SheetSession.find({}).sort({ updatedAt: -1 }).lean();

        // Optimization: Re-add the virtual 'id' field that .lean() strips out
        const sessions = rawSessions.map((session: any) => ({
            ...session,
            id: session._id.toString()
        }));

        return NextResponse.json(sessions);
    } catch (error) {
        console.error('Error fetching sheet sessions:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
