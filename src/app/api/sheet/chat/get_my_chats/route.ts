import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SheetSession from "@/models/SheetSession";

export async function GET(request: Request) {
  try {
    await dbConnect();
    // Fetch all sessions sorted by newest updated
    const sessions = await SheetSession.find({})
      .sort({ updatedAt: -1 })
      // ⚡ Bolt Optimization: Return plain JS objects instead of heavy Mongoose documents
      // since this is a read-only endpoint returning data to the client.
      .lean();
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching sheet sessions:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
