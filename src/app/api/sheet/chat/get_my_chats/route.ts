import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SheetSession from "@/models/SheetSession";

export async function GET(request: Request) {
  try {
    await dbConnect();
    // Fetch all sessions sorted by newest updated
    const rawSessions = await SheetSession.find({})
      .sort({ updatedAt: -1 })
      .lean(); // Optimization: Return plain JS objects instead of Mongoose documents for faster read performance

    // Mongoose normally adds 'id' virtual getter, but with .lean() we need to map it manually
    const sessions = rawSessions.map((s: any) => ({
      ...s,
      id: s._id.toString(),
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
