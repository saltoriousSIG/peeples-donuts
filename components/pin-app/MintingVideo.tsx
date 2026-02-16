"use client";

import { useRef, useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

export function MintingVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  // Try to unmute once the video starts playing
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryUnmute = () => {
      video.muted = false;
      video.play().then(() => {
        setIsMuted(false);
      }).catch(() => {
        // Browser blocked unmuted playback, keep muted
        video.muted = true;
        setIsMuted(true);
      });
    };

    video.addEventListener("playing", tryUnmute, { once: true });
    return () => video.removeEventListener("playing", tryUnmute);
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className="w-full h-full object-cover aspect-square rounded-full"
        src="/media/peeples_welcome.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleMute();
        }}
        className="absolute bottom-[20%] right-[15%] z-10 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm transition-opacity hover:bg-black/60"
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-white" />
        ) : (
          <Volume2 className="w-4 h-4 text-white" />
        )}
      </button>
    </div>
  );
}
