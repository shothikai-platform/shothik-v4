import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SheetSession from "@/models/SheetSession";

export async function GET(request: Request) {
  try {
    await dbConnect();
    // Fetch all sessions sorted by newest updated
    // Optimization: Use .lean() to return plain JS objects instead of heavy Mongoose documents.
    // This reduces memory overhead and CPU time for instantiation, improving response times for list endpoints.
    const sessions = await SheetSession.find({}).sort({ updatedAt: -1 }).lean();

    // Map to include 'id' virtual since .lean() strips it
    const formattedSessions = sessions.map((session) => ({
      ...session,
      id: session._id.toString(),
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
