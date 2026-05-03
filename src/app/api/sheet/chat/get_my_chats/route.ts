import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';

export async function GET(request: Request) {
    try {
        await dbConnect();
        // Fetch all sessions sorted by newest updated
        const sessionsData = await SheetSession.find({}).sort({ updatedAt: -1 }).lean();
        const sessions = sessionsData.map((s: any) => ({ ...s, id: s._id.toString() })); // Optimization: Use .lean() to return plain JS objects and reduce memory overhead
        return NextResponse.json(sessions);
    } catch (error) {
        console.error('Error fetching sheet sessions:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
