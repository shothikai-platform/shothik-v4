import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';

export async function GET(request: Request) {
    try {
        await dbConnect();
        // Fetch all sessions sorted by newest updated
        const sessions = await SheetSession.find({}).sort({ updatedAt: -1 }).lean();

        // Map to include 'id' since .lean() removes virtuals
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
