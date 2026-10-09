// hooks/useFlipLongJob.ts
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import {
  ProcessedVideoData,
  VideoStatusApiResponse,
  FlipLongActiveJob,
  ReelItem,
} from "@/types/fliplong";

const DEFAULT_API_BASE = "https://1a2uuat2d6.execute-api.us-east-1.amazonaws.com/prod";
const STORAGE_KEY = "fliplong_active_job";
const POLLING_INTERVAL_MS = 30000; // 30 seconds

export function useFlipLongJob(baseUrl: string = DEFAULT_API_BASE) {
  const [activeJob, setActiveJob] = useState<FlipLongActiveJob | null>(null);
  const [videoData, setVideoData] = useState<ProcessedVideoData | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. On Mount: Restore active job from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: FlipLongActiveJob = JSON.parse(saved);
        if (parsed.videoId) {
          setActiveJob(parsed);
          setIsProcessing(parsed.status !== "success");
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // 2. Status Polling Logic
  const checkStatus = useCallback(
    async (vid: string) => {
      try {
        const res = await axios.get<VideoStatusApiResponse>(`${baseUrl}/api/videos/${vid}`, {
          headers: { Accept: "application/json" },
        });

        const json = res.data;
        const currentData = json.data;

        if (currentData) {
          setVideoData(currentData);

          if (currentData.status === "success") {
            setIsProcessing(false);
            // Update local storage status
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
              try {
                const parsed = JSON.parse(saved);
                parsed.status = "success";
                localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
                setActiveJob(parsed);
              } catch {}
            }
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
          } else if (currentData.status === "failed") {
            setIsProcessing(false);
            setError(currentData.error_message || "Video processing failed in AI pipeline.");
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
          }
        }
      } catch (err: any) {
        console.warn("Polling notice:", err?.message || err);
        // Do not crash, worker might still be initializing
      }
    },
    [baseUrl]
  );

  // 3. Polling Lifecycle
  useEffect(() => {
    const videoId = activeJob?.videoId;
    if (!videoId || !isProcessing) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    checkStatus(videoId);

    timerRef.current = setInterval(() => {
      checkStatus(videoId);
    }, POLLING_INTERVAL_MS);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [activeJob?.videoId, isProcessing, checkStatus]);

  // 4. Start 2-Step Resumable Direct Upload to Google Drive
  const startDirectUpload = async (
    file: File,
    meta: {
      title: string;
      description?: string;
      author: string;
      sport: string;
      duration?: string;
      durationSec?: number;
    }
  ) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Step 1: Initialize Resumable Upload on Main Next.js backend
      const initRes = await axios.post<{ success: boolean; uploadUrl: string; fileName: string }>(
        "/api/flipLong/upload_video/init",
        {
          fileName: file.name,
          mimeType: file.type || "video/mp4",
          author: meta.author || "",
          sport: meta.sport || "general",
          description: meta.description || meta.title || "FlipLong Video Drop",
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const { uploadUrl, fileName } = initRes.data;
      if (!uploadUrl) throw new Error("Backend did not return an uploadUrl from Google Drive");

      // Step 2: Direct PUT File Blob to Google Drive with real progress tracking
      const uploadRes = await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type || "video/mp4",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(pct);
          }
        },
      });

      // Google Drive returns file metadata JSON upon completion
      const driveData = uploadRes.data;
      const videoId = driveData?.id;
      if (!videoId) {
        throw new Error("Could not extract Google Drive File ID after upload");
      }

      // Step 3: Register active job into localStorage immediately
      const job: FlipLongActiveJob = {
        videoId,
        fileName: fileName || file.name,
        title: meta.title,
        description: meta.description || "",
        author: meta.author,
        sport: meta.sport,
        uploadedAt: new Date().toISOString(),
        status: "queued",
        duration: meta.duration || "0:00",
        durationSec: meta.durationSec || 0,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(job));
      setActiveJob(job);
      setIsProcessing(true);
      setIsUploading(false);
      setUploadProgress(100);

      // Trigger immediate initial status check
      checkStatus(videoId);

      return videoId;
    } catch (err: any) {
      console.error("Direct upload failed:", err);
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "Direct upload to Google Drive failed. Please try again.";
      setError(msg);
      setIsUploading(false);
      throw new Error(msg);
    }
  };

  // 5. Approve Reels on AWS Serverless API Gateway
  const approveReels = async (approvedIndices: number[]) => {
    if (!activeJob?.videoId) return;
    try {
      const res = await axios.post(`${baseUrl}/api/videos/${activeJob.videoId}/approve`, {
        approved_reel_indices: approvedIndices,
      });

      // Update local state to show as approved
      setVideoData((prev) => {
        if (!prev || !prev.reels) return prev;
        const updatedReels = prev.reels.map((r, idx) => ({
          ...r,
          is_approved: approvedIndices.includes(idx) ? true : r.is_approved,
        }));
        return { ...prev, reels: updatedReels };
      });

      return res.data;
    } catch (err: any) {
      console.error("Failed to approve reels:", err);
      throw err;
    }
  };

  // 6. Approve Single Reel & Post to FlipLine Feed
  const publishReelToFlipLine = async (
    reel: ReelItem,
    reelIndex: number,
    meta: {
      sport?: string;
      author?: string;
      authorPhoto?: string;
      userId?: string;
      email?: string;
    }
  ) => {
    try {
      // 1. Approve on AWS API Gateway
      if (activeJob?.videoId) {
        await axios.post(`${baseUrl}/api/videos/${activeJob.videoId}/approve`, {
          reel_index: reelIndex,
          is_approved: true,
        }).catch((e) => console.warn("AWS approve sync notice:", e));
      }

      // 2. Dual-write to FlipLine Feed API (/api/flipline)
      const payload = {
        content: `${reel.title}\n\n${reel.caption || ""}`.trim(),
        videoUrl: reel.mp4,
        mediaType: "video",
        type: "REEL",
        sport: (meta.sport || activeJob?.sport || "general").toLowerCase(),
        author: meta.author || activeJob?.author || "",
        authorPhoto: meta.authorPhoto || "",
        userId: meta.userId || "",
        email: meta.email || "",
        time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
        timeMs: Date.now(),
      };

      const res = await axios.post("/api/flipline", payload, {
        headers: { "Content-Type": "application/json" },
      });

      // Update local UI reel item
      setVideoData((prev) => {
        if (!prev || !prev.reels) return prev;
        const updatedReels = [...prev.reels];
        if (updatedReels[reelIndex]) {
          updatedReels[reelIndex] = { ...updatedReels[reelIndex], is_approved: true };
        }
        return { ...prev, reels: updatedReels };
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("flipline-post-created"));
      }

      return res.data;
    } catch (err: any) {
      console.error("Failed to publish reel to FlipLine:", err);
      throw err;
    }
  };

  // 7. Clear Active Job from Storage & State
  const clearActiveJob = () => {
    localStorage.removeItem(STORAGE_KEY);
    setActiveJob(null);
    setVideoData(null);
    setIsProcessing(false);
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  return {
    activeJob,
    activeVideoId: activeJob?.videoId || null,
    videoData,
    isUploading,
    uploadProgress,
    isProcessing,
    error,
    startDirectUpload,
    approveReels,
    publishReelToFlipLine,
    clearActiveJob,
    checkStatus,
  };
}
