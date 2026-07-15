import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    const channelId = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID;

    if (!apiKey) {
      return NextResponse.json({ error: "YouTube API key not configured" }, { status: 500 });
    }

    if (!channelId) {
      return NextResponse.json({ error: "YouTube channel ID not configured" }, { status: 500 });
    }

    const response = await fetch(
      `https://youtube.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`,
      {
        headers: { Accept: "application/json" },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch from YouTube" }, { status: response.status });
    }

    const data = await response.json();
    if (data.items && data.items[0]) {
      const count = parseInt(data.items[0].statistics.subscriberCount, 10);
      return NextResponse.json({ subscriberCount: count || 0 });
    }

    return NextResponse.json({ error: "Channel not found" }, { status: 404 });
  } catch (error) {
    console.error("YouTube API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}