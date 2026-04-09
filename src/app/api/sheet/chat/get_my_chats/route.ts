import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';

export async function GET(request: Request) {
    try {
        await dbConnect();
        // Optimization: Use .lean() to return plain JavaScript objects instead of heavy Mongoose documents.
        // Impact: Reduces memory usage and CPU overhead since we only need read-only data.
        const sessions = await SheetSession.find({}).sort({ updatedAt: -1 }).lean();

        // Explicitly map results to restore the virtual 'id' field which .lean() strips out
        const mappedSessions = sessions.map((session: any) => ({
            ...session,
            id: session._id?.toString()
        }));

        return NextResponse.json(mappedSessions);
    } catch (error) {
        console.error('Error fetching sheet sessions:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
