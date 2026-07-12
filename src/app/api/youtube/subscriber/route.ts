import { NextResponse } from "next/server";

export const revalidate = 300;

export async function GET() {
  const channelId = process.env.YOUTUBE_CHANNEL_ID || process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID;
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!channelId || !apiKey) {
    return NextResponse.json(
      { error: "YouTube API credentials are not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://youtube.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch subscriber count");
    }

    const data = await response.json();
    let subscriberCount = 0;

    if (data.items && data.items[0]) {
      subscriberCount = parseInt(data.items[0].statistics.subscriberCount, 10) || 0;
    }

    return NextResponse.json({ subscriberCount });
  } catch (error: any) {
    console.error("YouTube API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
