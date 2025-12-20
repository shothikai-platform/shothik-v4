import axios from "axios";

export async function POST(request) {
  try {
    // Get the raw request body and headers for debugging
    const requestBody = await request.json();
    const headers = Object.fromEntries(request.headers.entries());

    console.log("=== WEBHOOK DEBUG INFO ===");
    console.log("Request Headers:", headers);
    console.log("Request Body:", JSON.stringify(requestBody, null, 2));

    // Handle different payload structures flexibly
    let eventData;

    if (requestBody.event) {
      // Original expected format: { event: {...} }
      eventData = requestBody.event;
      console.log("Using nested event structure");
    } else if (requestBody.event_name) {
      // Your actual format: { event_name, parameters, sessionId, etc. }
      eventData = requestBody;
      console.log("Using flat event structure");
    } else {
      // Fallback: use entire payload
      eventData = requestBody;
      console.log("Using entire payload as event data");
    }

    console.log("Processed Event Data:", JSON.stringify(eventData, null, 2));

    // Prepare the payload for Zoho - try different formats
    const zohoPayload = {
      // Option 1: Wrap in a data object
      data: eventData,
      // Option 2: Add metadata
      event_type: eventData.event_name || "unknown",
      timestamp: eventData.timestamp || new Date().toISOString(),
      source: "nextjs-webhook",
      // Option 3: Keep original structure but ensure all fields are present
      event_name: eventData.event_name,
      parameters: eventData.parameters || {},
      session_id: eventData.sessionId,
      user_id: eventData.userId,
      webhook_timestamp: new Date().toISOString(),
    };

    console.log("Sending to Zoho:", JSON.stringify(zohoPayload, null, 2));

    // Test network connectivity first
    console.log("Testing basic connectivity...");
    await axios.get("https://httpbin.org/status/200", { timeout: 5000 });
    console.log("Network connectivity confirmed");

    const zohoResponse = await axios.post(
      "https://flow.zoho.com/895989103/flow/webhook/incoming?zapikey=1001.563e7024e0c383d73d4f6bdb92d1a880.958f8a0149546765487064afba19284b&isdebug=false",
      zohoPayload,
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "NextJS-Webhook/1.0",
          Accept: "application/json",
        },
        timeout: 15000, // 15 second timeout
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        validateStatus: function (status) {
          return status >= 200 && status < 500; // Don't throw on 4xx errors
        },
      },
    );

    console.log("Zoho Response Status:", zohoResponse.status);
    console.log("Zoho Response Data:", zohoResponse.data);

    return new Response(
      JSON.stringify({
        success: true,
        data: zohoResponse.data,
        status: zohoResponse.status,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("=== WEBHOOK ERROR ===");
    console.error("Error Message:", error.message);
    console.error("Error Stack:", error.stack);

    if (error.response) {
      console.error("Response Status:", error.response.status);
      console.error("Response Headers:", error.response.headers);
      console.error("Response Data:", error.response.data);
    }

    if (error.request) {
      console.error("Request Config:", error.request);
    }

    return new Response(
      JSON.stringify({
        error: "Failed to send to Zoho",
        details: error.response?.data || error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        code: error.code,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
        },
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
