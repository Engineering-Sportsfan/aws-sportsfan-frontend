// types/fliplong.ts
// Production TypeScript Type Definitions for Flipline & FlipLong AWS Serverless AI Pipeline

export interface HighlightSegment {
  start_time: number;
  end_time: number;
}

export interface HighlightData {
  title: string;
  reason: string;
  caption: string;
  is_approved: boolean;
  mp4: string;
  mp3?: string;
  segments?: HighlightSegment[];
}

export interface ReelItem {
  title: string;
  caption: string;
  reason: string;
  start_time: number;
  end_time: number;
  is_approved: boolean;
  mp4: string;
  mp3?: string;
}

export interface ProcessedVideoData {
  video_id: string;
  file_name: string;
  record_type?: 'video';
  source?: 'fliplong' | 'watchroom_drive';
  is_fliplong?: boolean;
  is_approved?: boolean;
  status: 'queued' | 'processing' | 'success' | 'failed';
  created_at?: string;
  queued_at?: string;
  main_title?: string;
  summary?: string;
  denoised_video?: string;
  denoised_audio?: string;
  highlights?: HighlightData;
  reels?: ReelItem[];
  error_message?: string;
}

export interface VideoStatusApiResponse {
  status: 'completed' | 'processing' | 'error';
  video_id: string;
  message?: string;
  data?: ProcessedVideoData;
}

export interface ApprovePayload {
  is_approved?: boolean;
  reel_index?: number;
  approved_reel_indices?: number[];
  approve_highlights?: boolean;
}

export interface FlipLongActiveJob {
  videoId: string;
  fileName: string;
  title: string;
  description: string;
  author: string;
  sport: string;
  uploadedAt: string;
  status: 'queued' | 'processing' | 'success' | 'failed';
  duration?: string;
  durationSec?: number;
}
