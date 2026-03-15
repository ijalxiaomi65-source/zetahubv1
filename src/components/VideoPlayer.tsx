import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Maximize, Minimize, Play, Pause, SkipForward, Settings, Volume2, VolumeX } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  type?: string;
  poster?: string;
  onEnded?: () => void;
  onNext?: () => void;
  title?: string;
  episodeNum?: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  type = "application/x-mpegURL", 
  poster,
  onEnded,
  onNext,
  title,
  episodeNum
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isIframe = src.includes("embed") || src.includes("iframe") || !src.includes(".");

  useEffect(() => {
    if (isIframe || !videoRef.current) return;

    const video = videoRef.current;
    let hls: Hls | null = null;

    if (src.includes(".m3u8")) {
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      }
    } else {
      video.src = src;
    }

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setProgress((video.currentTime / video.duration) * 100);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleEnded = () => {
      if (onEnded) onEnded();
      if (onNext) onNext();
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);

    return () => {
      if (hls) hls.destroy();
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
    };
  }, [src, isIframe, onEnded, onNext]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = (parseFloat(e.target.value) / 100) * duration;
    videoRef.current.currentTime = time;
    setProgress(parseFloat(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const val = parseFloat(e.target.value);
    videoRef.current.volume = val;
    setVolume(val);
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  if (isIframe) {
    return (
      <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
        <iframe 
          src={src} 
          className="w-full h-full" 
          allowFullScreen 
          frameBorder="0"
          allow="autoplay; encrypted-media"
        />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="group relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10"
    >
      <video
        ref={videoRef}
        poster={poster}
        className="w-full h-full cursor-pointer"
        onClick={togglePlay}
        playsInline
      />

      {/* Overlay Controls */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}>
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-white line-clamp-1">{title}</h3>
            {episodeNum && <p className="text-sm text-white/60">Episode {episodeNum}</p>}
          </div>
        </div>

        {/* Center Play Button */}
        <button 
          onClick={togglePlay}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center text-primary border border-primary/30 hover:scale-110 transition-all"
        >
          {isPlaying ? <Pause size={40} fill="currentColor" /> : <Play size={40} className="ml-2" fill="currentColor" />}
        </button>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
          {/* Progress Bar */}
          <div className="relative group/progress h-1.5 w-full bg-white/20 rounded-full cursor-pointer overflow-hidden">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleProgressChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div 
              className="h-full bg-primary transition-all" 
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button onClick={togglePlay} className="text-white hover:text-primary transition-colors">
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>

              {onNext && (
                <button onClick={onNext} className="text-white hover:text-primary transition-colors">
                  <SkipForward size={24} />
                </button>
              )}

              <div className="flex items-center gap-3 group/volume">
                <button onClick={toggleMute} className="text-white hover:text-primary transition-colors">
                  {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-0 group-hover/volume:w-20 transition-all accent-primary"
                />
              </div>

              <div className="text-sm font-medium text-white/80">
                {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button className="text-white hover:text-primary transition-colors">
                <Settings size={24} />
              </button>
              <button onClick={toggleFullscreen} className="text-white hover:text-primary transition-colors">
                {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
