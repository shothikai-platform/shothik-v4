import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';

export async function GET(request: Request) {
    try {
        await dbConnect();
        // Fetch all sessions sorted by newest updated
        // ⚡ Bolt Optimization: Use .lean() to bypass heavy Mongoose Document instantiation for a read-only list query
        const sessions = await SheetSession.find({}).sort({ updatedAt: -1 }).lean();
        // ⚡ Bolt Optimization: Manually map _id to id to preserve the API contract lost by using .lean()
        const mappedSessions = sessions.map((session: any) => ({
            ...session,
            id: session._id.toString(),
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
