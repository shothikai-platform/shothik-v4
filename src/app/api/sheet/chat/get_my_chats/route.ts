import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';

export async function GET(request: Request) {
    try {
        await dbConnect();
        // ⚡ Bolt Optimization: Using .lean() to return plain JS objects instead of heavy Mongoose documents.
        // Impact: Reduces memory allocation and speeds up query execution by bypassing Mongoose hydration.
        const sessions = await SheetSession.find({}).sort({ updatedAt: -1 }).lean();

        // Map to explicitly include `id` to maintain virtuals behavior stripped by .lean()
        const mappedSessions = sessions.map((session: any) => ({
            ...session,
            id: session._id.toString()
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
