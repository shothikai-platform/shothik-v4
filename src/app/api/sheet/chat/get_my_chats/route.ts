import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';
import { getAuthenticatedUser } from '@/lib/server-auth';

export async function GET(request: Request) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) {
            // Security Fix: Return empty list instead of exposing all data
            // Returning [] instead of 401 to prevent UI breakage if used anonymously
            return NextResponse.json([]);
        }

        await dbConnect();

        // Security Fix: Filter by userId to prevent Information Disclosure (IDOR)
        // Optimized: Use .lean() to reduce memory usage
        const sessions = await SheetSession.find({ userId: user._id || user.id })
            .sort({ updatedAt: -1 })
            .lean();

        return NextResponse.json(sessions);
    } catch (error) {
        console.error('Error fetching sheet sessions:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
