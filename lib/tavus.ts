const TAVUS_API_KEY = process.env.TAVUS_API_KEY;
const TAVUS_BASE_URL = 'https://tavusapi.com/v2';

export interface TavusReplica {
  replica_id: string;
  replica_name: string;
  status: 'training' | 'ready' | 'error';
  created_at: string;
}

export interface TavusVideo {
  video_id: string;
  video_name: string;
  status: 'queued' | 'generating' | 'ready' | 'deleted' | 'error';
  hosted_url: string;
  download_url?: string;
  created_at: string;
}

export interface TavusPersona {
  persona_id: string;
  persona_name: string;
  created_at: string;
}

class TavusAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    if (!TAVUS_API_KEY) {
      throw new Error('TAVUS_API_KEY is required');
    }
    this.apiKey = TAVUS_API_KEY;
    this.baseUrl = TAVUS_BASE_URL;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Tavus API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async createReplica(data: {
    train_video_url: string;
    replica_name: string;
    callback_url?: string;
  }): Promise<TavusReplica> {
    return this.request('/replicas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getReplicas(): Promise<TavusReplica[]> {
    const response = await this.request('/replicas');
    return response.replicas || [];
  }

  async createPersona(data: {
    persona_name: string;
    system_prompt: string;
    context?: string;
    default_replica_id?: string;
  }): Promise<TavusPersona> {
    return this.request('/personas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateVideo(data: {
    replica_id: string;
    script: string;
    video_name?: string;
    callback_url?: string;
  }): Promise<TavusVideo> {
    return this.request('/videos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getVideo(videoId: string): Promise<TavusVideo> {
    return this.request(`/videos/${videoId}`);
  }

  async pollVideoStatus(videoId: string, maxAttempts: number = 60): Promise<TavusVideo> {
    for (let i = 0; i < maxAttempts; i++) {
      const video = await this.getVideo(videoId);
      
      if (video.status === 'ready' || video.status === 'error') {
        return video;
      }
      
      // Wait 5 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    throw new Error('Video generation timeout');
  }
}

export const tavusAPI = new TavusAPI();