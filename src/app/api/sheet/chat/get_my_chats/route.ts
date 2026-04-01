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
        // Fetch user's sessions sorted by newest updated, optimized with lean()
        const sessions = await SheetSession.find({ userId: user._id || user.id })
            .sort({ updatedAt: -1 })
            .lean();

        // Map _id to id to retain expected virtuals since we are using lean()
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
