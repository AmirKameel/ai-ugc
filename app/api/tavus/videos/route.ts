import { NextResponse } from 'next/server';
import { tavusAPI } from '@/lib/tavus';

export async function POST(request: Request) {
  try {
    const { replica_id, script, video_name, product_name, product_description } = await request.json();

    if (!replica_id || !script) {
      return NextResponse.json(
        { error: 'replica_id and script are required' },
        { status: 400 }
      );
    }

    // Generate the video using Tavus
    const video = await tavusAPI.generateVideo({
      replica_id,
      script,
      video_name: video_name || `${product_name} UGC Video`,
    });

    return NextResponse.json(video);
  } catch (error) {
    console.error('Error generating video:', error);
    return NextResponse.json(
      { error: 'Failed to generate video' },
      { status: 500 }
    );
  }
}