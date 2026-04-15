import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';

export async function GET(request: Request) {
    try {
        await dbConnect();
        // Fetch all sessions sorted by newest updated
        // Optimization: Use .lean() to return plain JS objects instead of Mongoose documents,
        // reducing memory usage and CPU overhead.
        const sessions = await SheetSession.find({}).sort({ updatedAt: -1 }).lean();

        // Map the results to re-add the 'id' field expected by the frontend
        const optimizedSessions = sessions.map((session: any) => ({
            ...session,
            id: session._id.toString()
        }));

        return NextResponse.json(optimizedSessions);
    } catch (error) {
        console.error('Error fetching sheet sessions:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
