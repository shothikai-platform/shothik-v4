import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';

export async function GET(request: Request) {
    try {
        await dbConnect();
        // Fetch all sessions sorted by newest updated
        const sessionsRaw = await SheetSession.find({}).sort({ updatedAt: -1 }).lean(); // Optimization: Return plain JS objects instead of Mongoose documents for better performance
        const sessions = sessionsRaw.map(s => ({ ...s, id: s._id.toString() })); // Re-add id field for client compatibility
        return NextResponse.json(sessions);
    } catch (error) {
        console.error('Error fetching sheet sessions:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
