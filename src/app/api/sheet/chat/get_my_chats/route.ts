import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SheetSession from "@/models/SheetSession";

export async function GET(request: Request) {
  try {
    await dbConnect();
    // Fetch all sessions sorted by newest updated
    const sessions = await SheetSession.find({}).sort({ updatedAt: -1 }).lean();

    // Map the results to include the 'id' field which is stripped by .lean()
    const formattedSessions = sessions.map((session: any) => ({
      ...session,
      id: session._id?.toString(),
    }));

    return NextResponse.json(formattedSessions);
  } catch (error) {
    console.error("Error fetching sheet sessions:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
