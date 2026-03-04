import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';

export async function GET(request: Request) {
    try {
        await dbConnect();
        // Fetch all sessions sorted by newest updated
        // Optimization: Use .lean({ virtuals: true }) to return plain JS objects instead of Mongoose documents
        // Using virtuals: true ensures we don't break frontend relying on 'id' instead of '_id'
        const sessions = await SheetSession.find({}).sort({ updatedAt: -1 }).lean({ virtuals: true });
        return NextResponse.json(sessions);
    } catch (error) {
        console.error('Error fetching sheet sessions:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
