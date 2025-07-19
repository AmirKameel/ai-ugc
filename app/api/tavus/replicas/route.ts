import { NextResponse } from 'next/server';
import { tavusAPI } from '@/lib/tavus';

export async function GET() {
  try {
    const replicas = await tavusAPI.getReplicas();
    return NextResponse.json(replicas);
  } catch (error) {
    console.error('Error fetching replicas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch replicas' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { train_video_url, replica_name } = await request.json();

    if (!train_video_url || !replica_name) {
      return NextResponse.json(
        { error: 'train_video_url and replica_name are required' },
        { status: 400 }
      );
    }

    const replica = await tavusAPI.createReplica({
      train_video_url,
      replica_name,
    });

    return NextResponse.json(replica);
  } catch (error) {
    console.error('Error creating replica:', error);
    return NextResponse.json(
      { error: 'Failed to create replica' },
      { status: 500 }
    );
  }
}