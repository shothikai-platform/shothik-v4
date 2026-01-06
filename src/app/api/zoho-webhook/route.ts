// app/api/zoho-webhook/route.ts
import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const webhookUrl = process.env.ZOHO_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error("ZOHO_WEBHOOK_URL is not defined");
    return NextResponse.json({ error: "Configuration error" }, { status: 500 });
  }

  try {
    const { event } = await request.json();

    await axios.post(webhookUrl, { event });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send to Zoho", error);
    return NextResponse.json(
      { error: "Failed to send to Zoho" },
      { status: 500 },
    );
  }
}
