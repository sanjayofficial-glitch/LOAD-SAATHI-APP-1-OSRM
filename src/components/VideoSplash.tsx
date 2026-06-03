"use client";

import { useEffect, useRef, useState } from 'react';

interface VideoSplashProps {
  onComplete: () => void;
}

const VideoSplash: React.FC<VideoSplashProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [show, setShow] = useState(true);
  const completed = useRef(false);

  const finish = () => {
    if (completed.current) return;
    completed.current = true;
    setShow(false);
    setTimeout(onComplete, 400);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnd = () => finish();
    const handleError = () => finish();

    video.addEventListener('ended', handleEnd);
    video.addEventListener('error', handleError);

    video.play().catch(() => finish());

    return () => {
      video.removeEventListener('ended', handleEnd);
      video.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-500 ${
        show ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <video
        ref={videoRef}
        src="/splash.webm"
        muted
        playsInline
        className="w-full h-full object-contain"
      />

      <button
        onClick={finish}
        className="absolute bottom-8 right-8 px-6 py-2.5 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-medium hover:bg-white/30 transition-all border border-white/30"
      >
        Skip &rarr;
      </button>
    </div>
  );
};

export default VideoSplash;
