import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';

export async function GET(request: Request) {
    try {
        await dbConnect();
        // Fetch all sessions sorted by newest updated
        // Optimization: Use .lean() to return plain JS objects and bypass Mongoose document hydration.
        // Impact: Significantly reduces memory footprint and execution time for list queries.
        const sessions = await SheetSession.find({}).sort({ updatedAt: -1 }).lean();

        // Map the lean objects to explicitly add the 'id' field expected by clients
        const mappedSessions = sessions.map((s: any) => ({ ...s, id: s._id.toString() }));
        return NextResponse.json(mappedSessions);
    } catch (error) {
        console.error('Error fetching sheet sessions:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
