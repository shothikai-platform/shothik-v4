import { NextResponse } from 'next/server';

export const revalidate = 300;

export async function GET() {
  try {
    const channelId = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID;
    const apiKey = process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

    if (!channelId || !apiKey) {
      return NextResponse.json({ error: 'Missing YouTube API credentials' }, { status: 500 });
    }

    const response = await fetch(
      `https://youtube.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch subscriber count');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching subscriber count:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
