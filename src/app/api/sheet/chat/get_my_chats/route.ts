import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';

export async function GET(request: Request) {
    try {
        await dbConnect();
        // Fetch all sessions sorted by newest updated
        const sessions = await SheetSession.find({})
            .sort({ updatedAt: -1 })
            .lean(); // Optimization: Return plain JS objects instead of Mongoose documents

        // Optimization: Map results to include 'id' explicitly to preserve API contract after lean()
        const formattedSessions = sessions.map((session: any) => ({
            ...session,
            id: session._id.toString()
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
