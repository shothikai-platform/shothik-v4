import { NextResponse } from "next/server";

export const revalidate = 300;

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID || process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID;

  if (!apiKey || !channelId) {
    return NextResponse.json({ error: "YouTube API key or Channel ID is not configured" }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://youtube.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`,
      { headers: { Accept: "application/json" }, next: { revalidate: 300 } }
    );
    if (!response.ok) throw new Error("Invalid response from YouTube API");
    const data = await response.json();
    if (data.items && data.items[0]) {
      const count = parseInt(data.items[0].statistics.subscriberCount, 10);
      return NextResponse.json({ subscriberCount: count, channelId });
    }
    throw new Error("Subscriber count not found");
  } catch (error) {
    console.error("YouTube subscriber fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch subscriber count" }, { status: 500 });
  }
}
