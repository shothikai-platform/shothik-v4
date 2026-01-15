import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ResearchChat from "@/models/ResearchChat";
import { getAuthenticatedUser } from "@/lib/server-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const chat = await ResearchChat.findById(id);

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Verify ownership
    // Convert both to string to ensure safe comparison
    if (chat.userId.toString() !== (user._id || user.id).toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 }); // Or 404 to hide existence
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error("Error fetching one research chat:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat" },
      { status: 500 },
    );
  }
}
