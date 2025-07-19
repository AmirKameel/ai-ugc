import { useState, useCallback } from 'react';
import { TavusReplica, TavusVideo } from '@/lib/tavus';

export function useTavus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateVideo = useCallback(async (data: {
    replica_id: string;
    product_name: string;
    product_description: string;
    style?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      // First generate the script
      const scriptResponse = await fetch('/api/script/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: data.product_name,
          product_description: data.product_description,
          style: data.style || 'enthusiastic',
        }),
      });

      if (!scriptResponse.ok) {
        throw new Error('Failed to generate script');
      }

      const { script } = await scriptResponse.json();

      // Then generate the video
      const videoResponse = await fetch('/api/tavus/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          replica_id: data.replica_id,
          script,
          video_name: `${data.product_name} UGC Video`,
          product_name: data.product_name,
          product_description: data.product_description,
        }),
      });

      if (!videoResponse.ok) {
        throw new Error('Failed to generate video');
      }

      const video = await videoResponse.json();

      // Poll for completion
      const pollResponse = await fetch(`/api/tavus/videos/${video.video_id}/poll`, {
        method: 'POST',
      });

      if (!pollResponse.ok) {
        throw new Error('Failed to complete video generation');
      }

      const completedVideo = await pollResponse.json();
      return completedVideo;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReplicas = useCallback(async (): Promise<TavusReplica[]> => {
    try {
      const response = await fetch('/api/tavus/replicas');
      if (!response.ok) {
        throw new Error('Failed to fetch replicas');
      }
      return response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch replicas';
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    generateVideo,
    fetchReplicas,
    loading,
    error,
  };
}