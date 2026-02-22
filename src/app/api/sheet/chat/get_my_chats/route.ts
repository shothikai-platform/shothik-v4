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

        // Optimize: Filter by user (IDOR fix), select only needed fields, lean query (Performance)
        const sessions = await SheetSession.find({ userId: user._id || user.id })
            .select('title status createdAt updatedAt')
            .sort({ updatedAt: -1 })
            .lean();

        // Map title to name for frontend compatibility (ChatSidebar expects name)
        const formattedSessions = sessions.map((session: any) => ({
            ...session,
            name: session.title || session.name || 'Untitled'
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
