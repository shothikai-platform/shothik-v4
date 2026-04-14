import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';

export async function GET(request: Request) {
    try {
        await dbConnect();
        // Fetch all sessions sorted by newest updated
        // Optimization: Use .lean() to return plain JS objects instead of Mongoose documents,
        // significantly reducing memory usage and CPU overhead during serialization.
        const sessions = await SheetSession.find({})
            .sort({ updatedAt: -1 })
            .lean();

        // .lean() strips the virtual 'id' getter, so we must manually map '_id' back to 'id'
        const serializedSessions = sessions.map((session: any) => ({
            ...session,
            id: session._id.toString(),
        }));

        return NextResponse.json(serializedSessions);
    } catch (error) {
        console.error('Error fetching sheet sessions:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
