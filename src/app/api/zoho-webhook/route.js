// app/api/zoho-webhook/route.js
import axios from "axios";

export async function POST(request) {
  try {
    const { event } = await request.json();

    await axios.post(
      "https://flow.zoho.com/895989103/flow/webhook/incoming?zapikey=1001.563e7024e0c383d73d4f6bdb92d1a880.958f8a0149546765487064afba19284b&isdebug=false",
      { event },
    );

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to send to Zoho" }), {
      status: 500,
    });
  }
}
