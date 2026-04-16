import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SheetSession from "@/models/SheetSession";

export async function GET(request: Request) {
  try {
    await dbConnect();
    // Fetch all sessions sorted by newest updated
    const sessions = await SheetSession.find({}).sort({ updatedAt: -1 }).lean(); // Optimization: Return plain JS objects to bypass Mongoose hydration overhead

    // Optimization impact: Reduces memory usage and CPU cycles, speeding up response times.
    // Map results to re-add the 'id' field, because lean() omits Mongoose virtuals like 'id'.
    const mappedSessions = sessions.map((session: any) => ({
      ...session,
      id: session._id.toString(),
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
