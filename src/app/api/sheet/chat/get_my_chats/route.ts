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
        // Optimize: select only necessary fields and use lean() for performance
        const sessions = await SheetSession.find({ userId: user._id || user.id })
            .select('title status updatedAt createdAt')
            .sort({ updatedAt: -1 })
            .lean();

        return NextResponse.json(sessions);
    } catch (error) {
        console.error('Error fetching sheet sessions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch chats' },
            { status: 500 }
        );
    }
}
