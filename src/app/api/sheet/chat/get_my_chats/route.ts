import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';

export async function GET(request: Request) {
    try {
        await dbConnect();
        // Fetch all sessions sorted by newest updated
        const sessions = await SheetSession.find({})
            .sort({ updatedAt: -1 })
            .lean(); // Optimization: Return plain JS objects to skip Mongoose document hydration, reducing memory usage and CPU overhead

        // Optimization: Map results to include the virtual `id` field that gets stripped by `.lean()`
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
