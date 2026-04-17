import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SheetSession from "@/models/SheetSession";

export async function GET(request: Request) {
  try {
    await dbConnect();
    // Optimization: Use .lean() to return plain JS objects instead of heavy Mongoose documents
    // Impact: Significantly reduces memory overhead and improves query execution time for list endpoints.
    const sessions = await SheetSession.find({}).sort({ updatedAt: -1 }).lean();

    // Re-add the id field that is typically provided by Mongoose documents
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
