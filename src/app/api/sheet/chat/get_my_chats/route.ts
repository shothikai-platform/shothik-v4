import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';

export async function GET(request: Request) {
    try {
        await dbConnect();
        // Fetch all sessions sorted by newest updated
        // Optimization: Use .lean() to return plain JS objects instead of Mongoose documents.
        // Impact: Significantly reduces memory usage and CPU serialization overhead for list queries.
        const sessions = await SheetSession.find({}).sort({ updatedAt: -1 }).lean();

        // Map over the lean results to preserve the 'id' field, as .lean() strips virtuals
        const formattedSessions = sessions.map((session: any) => ({
            ...session,
            id: session._id.toString(),
        }));

        return NextResponse.json(formattedSessions);
    } catch (error) {
        console.error('Error fetching sheet sessions:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
