import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';

export async function GET(request: Request) {
    try {
        await dbConnect();
        // Fetch all sessions sorted by newest updated
        // Optimization: Use .lean() to return plain objects and avoid Mongoose overhead
        const docs = await SheetSession.find({}).sort({ updatedAt: -1 }).lean();
        // Optimization: Map the lean objects to retain the 'id' property expected by the frontend
        const sessions = docs.map((doc: any) => ({
            ...doc,
            id: doc._id.toString()
        }));
        return NextResponse.json(sessions);
    } catch (error) {
        console.error('Error fetching sheet sessions:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
