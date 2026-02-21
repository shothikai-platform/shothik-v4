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
        // Fetch sessions for authenticated user sorted by newest updated
        // Cast filter to any to avoid TS errors with untyped model
        const sessions = await SheetSession.find({ userId: user._id || user.id } as any).sort({ updatedAt: -1 });

        // Map title to name for frontend compatibility if needed, or frontend handles title
        // Frontend likely expects 'name' based on other chat endpoints, but SheetSession has 'title'.
        // Let's check frontend usage later if needed, but for now secure it.
        // Actually, let's map it to be safe as 'name' is standard for sidebar
        const mappedSessions = sessions.map((session: any) => ({
            ...session.toObject(),
            name: session.title || 'Untitled Spreadsheet',
            id: session._id
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
