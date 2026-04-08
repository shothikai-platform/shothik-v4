import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';

export async function GET(request: Request) {
    try {
        await dbConnect();
        // Fetch all sessions sorted by newest updated
        // Performance optimization: Using .lean() avoids Mongoose document instantiation overhead
        // reducing memory usage and CPU time during serialization for list endpoints.
        const sessionsRaw = await SheetSession.find({}).sort({ updatedAt: -1 }).lean();

        // When using .lean(), virtuals like 'id' are stripped.
        // We explicitly map the results to add 'id' back to maintain the API contract.
        const sessions = sessionsRaw.map((session: any) => ({
            ...session,
            id: session._id.toString(),
        }));

        return NextResponse.json(sessions);
    } catch (error) {
        console.error('Error fetching sheet sessions:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
