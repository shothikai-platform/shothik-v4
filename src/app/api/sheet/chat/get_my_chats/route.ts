import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';
import { getAuthenticatedUser } from '@/lib/server-auth';

export async function GET(request: Request) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        // Optimization: Fetch only user's sessions and use .lean() for performance
        const sessions = await SheetSession.find({ userId: user._id || user.id })
            .sort({ updatedAt: -1 })
            .lean();

        // .lean() strips virtuals, so we must map _id to id to maintain API contract
        const formattedSessions = sessions.map(session => ({
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
