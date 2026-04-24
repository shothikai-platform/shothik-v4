import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SheetSession from "@/models/SheetSession";

export async function GET(request: Request) {
  try {
    await dbConnect();
    // Fetch all sessions sorted by newest updated
    // ⚡ Bolt: Added .lean() to improve query performance by returning plain JS objects instead of heavy Mongoose documents
    const sessions = await SheetSession.find({}).sort({ updatedAt: -1 }).lean();

    const mappedSessions = sessions.map((s: any) => ({
      ...s,
      id: s._id.toString(),
    }));

    return NextResponse.json(mappedSessions);
  } catch (error) {
    console.error("Error fetching sheet sessions:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
