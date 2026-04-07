import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';

export async function GET(request: Request) {
    try {
        await dbConnect();
        // Fetch all sessions sorted by newest updated
        // Optimization: Use .lean() to return plain JS objects instead of heavy Mongoose documents, reducing memory and CPU overhead.
        const sessions = await SheetSession.find({}).sort({ updatedAt: -1 }).lean();

        // Map results to include the virtual 'id' field stripped by .lean()
        const mappedSessions = sessions.map(session => ({
            ...session,
            id: session._id.toString()
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
