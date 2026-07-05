import { NextResponse } from "next/server";

export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  const channelId = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID;
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!channelId || !apiKey) {
    return NextResponse.json(
      { error: "YouTube API key or channel ID is not configured" },
      { status: 500 },
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
      throw new Error("Failed to fetch from YouTube API");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("YouTube API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
