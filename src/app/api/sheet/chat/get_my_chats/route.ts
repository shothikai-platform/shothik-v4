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

        // Fetch sessions for the authenticated user only
        // Optimization: Use .select(), .lean() and scope by userId
        const sessions = await SheetSession.find({ userId: user._id || user.id })
            .select('_id title createdAt updatedAt')
            .sort({ updatedAt: -1 })
            .lean();

        // Map sessions to match frontend expectations (title -> name)
        const mappedSessions = sessions.map((session: any) => ({
            ...session,
            id: session._id,
            name: session.title || 'New Chat',
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
