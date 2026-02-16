import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';
import { Model } from 'mongoose';
import { getAuthenticatedUser } from '@/lib/server-auth';

export async function GET(request: Request) {
    try {
        const user = await getAuthenticatedUser();

        await dbConnect();

        // Cast to any to avoid TS errors with the model definition
        const SheetSessionModel = SheetSession as Model<any>;

        if (user) {
             // Securely fetch chats for the authenticated user
             const sessions = await SheetSessionModel.find({ userId: user._id || user.id })
                .sort({ updatedAt: -1 })
                .lean();
             return NextResponse.json(sessions);
        } else {
             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

    } catch (error) {
        console.error('Error fetching sheet sessions:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
