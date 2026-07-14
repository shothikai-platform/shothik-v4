import { NextResponse } from "next/server";
export const revalidate = 300;
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get("channelId");
    if (!channelId) {
      return NextResponse.json(
        { error: "Channel ID is required" },
        { status: 400 },
      );
    }
    const apiKey =
      process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "YouTube API key is not configured" },
        { status: 500 },
      );
    }
    const response = await fetch(
      `https://youtube.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`,
      { headers: { Accept: "application/json" } },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch from YouTube API");
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching YouTube subscriber count:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
