import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';

export async function GET(request: Request) {
    try {
        await dbConnect();
        // Fetch all sessions sorted by newest updated
        // Optimization: Use .lean() to bypass Mongoose document instantiation and return plain JS objects.
        // Performance Impact: Significantly reduces memory usage and CPU overhead, especially for large lists.
        const sessions = await SheetSession.find({})
            .sort({ updatedAt: -1 })
            .lean();

        // Re-add 'id' field which is stripped out by .lean() but required by the frontend
        const mappedSessions = sessions.map((session: any) => ({
            ...session,
            id: session._id.toString(),
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
