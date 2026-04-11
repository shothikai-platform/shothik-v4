import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';

export async function GET(request: Request) {
    try {
        await dbConnect();
        // Fetch all sessions sorted by newest updated
        // Optimization: Use .lean() to return plain JS objects instead of heavy Mongoose documents.
        // This significantly reduces memory usage and CPU overhead during object instantiation,
        // making the API response faster.
        const sessions = await SheetSession.find({}).sort({ updatedAt: -1 }).lean();

        // When using .lean(), Mongoose strips virtuals like `id`.
        // We must map the results to add the `id` field back to preserve the API contract.
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
