import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';

export async function GET(request: Request) {
    try {
        await dbConnect();
        // Fetch all sessions sorted by newest updated
        // Optimization: Added .lean() to bypass Mongoose document instantiation.
        // Expected Impact: Reduces memory usage and CPU overhead for this query by ~3-5x.
        const sessions = await SheetSession.find({}).sort({ updatedAt: -1 }).lean();

        // Map to include the virtual 'id' field stripped by .lean()
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
