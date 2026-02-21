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

        // Optimization:
        // 1. Scope to userId (Security + Performance)
        // 2. Select only necessary fields (Performance)
        // 3. Use lean() to return plain objects (Performance)
        const sessions = await SheetSession.find({ userId: user._id || user.id })
            .select('userId title status updatedAt createdAt')
            .sort({ updatedAt: -1 })
            .lean();

        // Map title to name for frontend consistency
        const mappedSessions = sessions.map(session => ({
            ...session,
            name: session.title || 'New Chat'
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
