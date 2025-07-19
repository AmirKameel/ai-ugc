"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  videoUrl: string;
  onTimeUpdate?: (currentTime: number) => void;
  className?: string;
  autoPlay?: boolean;
}

export function VideoPlayer({ 
  videoUrl, 
  onTimeUpdate, 
  className,
  autoPlay = false 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      onTimeUpdate?.(video.currentTime);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [onTimeUpdate]);

  return (
    <video
      ref={videoRef}
      src={videoUrl}
      className={cn("w-full h-full object-cover", className)}
      controls
      playsInline
      autoPlay={autoPlay}
      muted={autoPlay}
    />
  );
}