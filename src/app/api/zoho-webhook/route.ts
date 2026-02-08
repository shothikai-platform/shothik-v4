import axios from "axios";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server-auth";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { event } = await request.json();
    const zohoWebhookUrl = process.env.ZOHO_WEBHOOK_URL;

    if (!zohoWebhookUrl) {
      console.error("ZOHO_WEBHOOK_URL environment variable is not configured");
      return NextResponse.json({ error: "Failed to send to Zoho" }, {
        status: 500,
      });
    }

    await axios.post(
      zohoWebhookUrl,
      { event },
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error sending to Zoho:", error);
    return NextResponse.json({ error: "Failed to send to Zoho" }, {
      status: 500,
    });
  }
}
