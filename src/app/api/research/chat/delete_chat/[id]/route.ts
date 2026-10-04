import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ResearchChat from "@/models/ResearchChat";
import { getAuthenticatedUser } from "@/lib/server-auth";

export async function DELETE(
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

    // Security: Prevent IDOR by verifying ownership
    if (chat.userId !== (user._id || user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await ResearchChat.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting research chat:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
