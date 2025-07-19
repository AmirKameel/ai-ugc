import { NextResponse } from 'next/server';
import { tavusAPI } from '@/lib/tavus';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;
    const video = await tavusAPI.pollVideoStatus(videoId);
    return NextResponse.json(video);
  } catch (error) {
    console.error('Error polling video status:', error);
    return NextResponse.json(
      { error: 'Failed to poll video status' },
      { status: 500 }
    );
  }
}