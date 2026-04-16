import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';

export async function GET(request: Request) {
    try {
        await dbConnect();
        // Fetch all sessions sorted by newest updated
        // Optimization: Return plain JS objects using .lean() to improve query performance and reduce memory usage
        const sessions = await SheetSession.find({}).sort({ updatedAt: -1 }).lean();

        // Map the result to include the `id` field
        const mappedSessions = sessions.map(s => ({ ...s, id: s._id.toString() }));
        return NextResponse.json(mappedSessions);
    } catch (error) {
        console.error('Error fetching sheet sessions:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
