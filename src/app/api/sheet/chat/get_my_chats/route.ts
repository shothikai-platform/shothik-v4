import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';

export async function GET(request: Request) {
    try {
        await dbConnect();
        // Fetch all sessions sorted by newest updated
        // Optimization: Use .lean() to bypass Mongoose document hydration, improving query performance and reducing memory allocation overhead
        const rawSessions = await SheetSession.find({}).sort({ updatedAt: -1 }).lean();
        const sessions = rawSessions.map((s: any) => ({...s, id: s._id.toString()}));
        return NextResponse.json(sessions);
    } catch (error) {
        console.error('Error fetching sheet sessions:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
