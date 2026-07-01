import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';
import { getAuthenticatedUser } from '@/lib/server-auth';

export async function GET(request: Request) {
    try {
        await dbConnect();

        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = user._id || user.id;

        // Fetch sessions for the authenticated user, sorted by newest updated
        const sessions = await SheetSession.find({ userId }).sort({ updatedAt: -1 });
        return NextResponse.json(sessions);
    } catch (error) {
        console.error('Error fetching sheet sessions:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
