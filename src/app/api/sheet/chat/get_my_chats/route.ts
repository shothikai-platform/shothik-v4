import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';

export async function GET(request: Request) {
    try {
        await dbConnect();
        // ⚡ Bolt Optimization: Added .lean() to return plain JS objects instead of heavy Mongoose documents, saving memory and CPU.
        const sessions = await SheetSession.find({})
            .sort({ updatedAt: -1 })
            .lean();

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
