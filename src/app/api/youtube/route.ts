import { NextResponse } from "next/server";

export const revalidate = 300;

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!apiKey || !channelId) {
    return NextResponse.json(
      { error: "YouTube API key or Channel ID is not configured" },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(
      `https://youtube.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`,
      {
        headers: { Accept: "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch subscriber count");
    }

    const data = await response.json();
    if (data.items && data.items[0]) {
      return NextResponse.json({
        count: parseInt(data.items[0].statistics.subscriberCount, 10) || 0
      });
    }

    return NextResponse.json({ count: 0 });
  } catch (error: any) {
    console.error("YouTube API error:", error);
    return NextResponse.json({ error: "An error occurred while fetching YouTube subscriber data" }, { status: 500 });
  }
}
