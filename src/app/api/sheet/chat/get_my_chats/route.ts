import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';

export async function GET(request: Request) {
    try {
        await dbConnect();
        // Fetch all sessions sorted by newest updated
        // Optimization: Use .lean() to bypass Mongoose document instantiation,
        // which improves performance by significantly reducing memory overhead and CPU usage.
        const rawSessions = await SheetSession.find({}).sort({ updatedAt: -1 }).lean();

        // Map over the lean results to inject the `id` field that Mongoose typically adds to documents
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
