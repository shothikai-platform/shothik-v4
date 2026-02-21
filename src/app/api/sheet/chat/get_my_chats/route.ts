import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SheetSession from "@/models/SheetSession";

export async function GET(request: Request) {
  try {
    await dbConnect();
    // Fetch all sessions sorted by newest updated
    // Optimization: Select only needed fields and use lean() for performance
    const sessions = await SheetSession.find({})
      .sort({ updatedAt: -1 })
      .select("title status createdAt updatedAt")
      .lean();

    // Map title to name for frontend compatibility
    const formattedSessions = sessions.map((session: any) => ({
      ...session,
      id: session._id,
      name: session.title,
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
