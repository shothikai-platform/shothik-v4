// app/api/zoho-webhook/route.js
import axios from "axios";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || !body.event) {
      return new Response(JSON.stringify({ error: "Invalid request payload" }), {
        status: 400,
      });
    }

    const { event } = body;
    const zohoUrl = process.env.ZOHO_WEBHOOK_URL;

    if (!zohoUrl) {
      console.error("ZOHO_WEBHOOK_URL environment variable is not set");
      return new Response(JSON.stringify({ error: "Configuration error" }), {
        status: 500,
      });
    }

    await axios.post(zohoUrl, { event });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Zoho webhook error:", error.message);
    return new Response(JSON.stringify({ error: "Failed to send to Zoho" }), {
      status: 500,
    });
  }
}
