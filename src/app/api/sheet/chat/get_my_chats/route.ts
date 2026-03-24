import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';

export async function GET(request: Request) {
    try {
        await dbConnect();
        // Fetch all sessions sorted by newest updated
        // Optimization: Use .lean() to return plain JS objects instead of Mongoose documents
        const rawSessions = await SheetSession.find({}).sort({ updatedAt: -1 }).lean();

        // Explicitly map _id to id to retain the expected virtual property stripped by .lean()
        const sessions = rawSessions.map((session: any) => ({
            ...session,
            id: session._id.toString(),
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
