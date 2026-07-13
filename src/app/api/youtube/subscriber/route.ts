import { NextResponse } from "next/server";

export const revalidate = 300;

export async function GET() {
  const apiKey =
    process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  const channelId = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID;

  if (!apiKey || !channelId) {
    return NextResponse.json(
      { error: "YouTube configuration missing" },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(
      `https://youtube.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`,
      { headers: { Accept: "application/json" } },
    );
    if (!response.ok) throw new Error("Failed to fetch subscriber count");
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch subscriber data" }, { status: 500 });
  }
}
