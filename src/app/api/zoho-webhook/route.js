import axios from "axios";

export async function POST(request) {
  try {
    const { event } = await request.json();
    const webhookUrl = process.env.ZOHO_FLOW_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error("ZOHO_FLOW_WEBHOOK_URL environment variable is not defined");
      return new Response(JSON.stringify({ error: "Configuration error" }), {
        status: 500,
      });
    }

    await axios.post(webhookUrl, { event });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error sending to Zoho:", error);
    return new Response(JSON.stringify({ error: "Failed to send to Zoho" }), {
      status: 500,
    });
  }
}
