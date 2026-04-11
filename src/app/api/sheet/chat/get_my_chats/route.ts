import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SheetSession from "@/models/SheetSession";

export async function GET(request: Request) {
  try {
    await dbConnect();
    // Fetch all sessions sorted by newest updated
    // Optimization: Added .lean() to reduce memory usage and improve query performance by returning plain JS objects.
    // We explicitly map the results to add the `id` field since .lean() strips virtuals, preserving the API contract.
    const sessionsRaw = await SheetSession.find({})
      .sort({ updatedAt: -1 })
      .lean();
    const sessions = sessionsRaw.map((session: any) => ({
      ...session,
      id: session._id?.toString(),
    }));
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching sheet sessions:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
