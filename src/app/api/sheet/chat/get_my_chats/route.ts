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

        // Fetch user's sessions sorted by newest updated
        // Optimized: select only needed fields and use lean()
        const sessions = await SheetSession.find({ userId: user._id || user.id })
            .select('title status updatedAt createdAt')
            .sort({ updatedAt: -1 })
            .lean();

        // Map title to name for frontend consistency
        const formattedSessions = sessions.map((session: any) => ({
            ...session,
            id: session._id,
            name: session.title
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
