import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

interface VideoPlayerProps {
  src: string;
  type?: string;
  poster?: string;
  onEnded?: () => void;
  onPlay?: () => void;
  subtitles?: { label: string; src: string; lang: string }[];
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  type = "application/x-mpegURL", 
  poster,
  onEnded,
  onPlay,
  subtitles = []
}) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const videoElement = document.createElement("video-js");
    videoElement.classList.add("vjs-big-play-centered", "vjs-theme-city");
    videoRef.current.appendChild(videoElement);

    const player = playerRef.current = videojs(videoElement, {
      autoplay: true,
      controls: true,
      responsive: true,
      fluid: true,
      poster: poster,
      sources: [{ src, type }],
      playbackRates: [0.5, 1, 1.5, 2],
      userActions: { hotkeys: true },
      controlBar: {
        children: [
          "playToggle",
          "volumePanel",
          "currentTimeDisplay",
          "timeDivider",
          "durationDisplay",
          "progressControl",
          "liveDisplay",
          "remainingTimeDisplay",
          "customControlSpacer",
          "playbackRateMenuButton",
          "chaptersButton",
          "descriptionsButton",
          "subsCapsButton",
          "audioTrackButton",
          "fullscreenToggle",
        ],
      },
    }, () => {
      console.log("Player is ready");
    });

    player.on("play", () => {
      if (onPlay) onPlay();
    });

    player.on("ended", () => {
      if (onEnded) onEnded();
    });

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [src, type, poster, onEnded]);

  return (
    <div data-vjs-player className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10">
      <div ref={videoRef} className="w-full h-full" />
    </div>
  );
};
