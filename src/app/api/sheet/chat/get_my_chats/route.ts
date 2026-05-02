import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';

export async function GET(request: Request) {
    try {
        await dbConnect();
        // Fetch all sessions sorted by newest updated
        // Optimization: Return plain JS objects instead of Mongoose documents
        const sessions = await SheetSession.find({}).sort({ updatedAt: -1 }).lean();
        // Optimization: re-add id field as lean removes mongoose virtuals
        const sessionsWithId = sessions.map(s => ({...s, id: s._id.toString()}));
        return NextResponse.json(sessionsWithId);
    } catch (error) {
        console.error('Error fetching sheet sessions:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
