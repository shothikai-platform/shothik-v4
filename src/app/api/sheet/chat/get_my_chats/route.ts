import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';

export async function GET(request: Request) {
    try {
        await dbConnect();
        // Fetch all sessions sorted by newest updated
        // ⚡ Bolt Optimization: Use .lean() to bypass Mongoose hydration for faster execution and lower memory usage
        const sessions = await SheetSession.find({}).sort({ updatedAt: -1 }).lean();
        const optimizedSessions = sessions.map((s: any) => ({...s, id: s._id.toString()}));
        return NextResponse.json(optimizedSessions);
    } catch (error) {
        console.error('Error fetching sheet sessions:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
