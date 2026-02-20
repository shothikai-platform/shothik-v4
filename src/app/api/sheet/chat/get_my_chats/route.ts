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
        // Fetch sessions for the authenticated user, sorted by newest updated
        // Optimization: Select only necessary fields and use lean() for performance
        const sessions = await SheetSession.find({ userId: user._id || user.id })
            .select('title status updatedAt createdAt')
            .sort({ updatedAt: -1 })
            .lean();

        // Optimization: Map title to name for frontend compatibility
        // The frontend expects 'name' property but SheetSession uses 'title'
        const formattedSessions = sessions.map(session => ({
            ...session,
            name: session.title || 'Untitled Chat'
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
