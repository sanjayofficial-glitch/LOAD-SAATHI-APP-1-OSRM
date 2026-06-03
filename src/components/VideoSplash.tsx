"use client";

import { useRef, useState } from 'react';
import { DotLottiePlayer } from '@dotlottie/react-player';

interface VideoSplashProps {
  onComplete: () => void;
}

const VideoSplash: React.FC<VideoSplashProps> = ({ onComplete }) => {
  const [show, setShow] = useState(true);
  const completed = useRef(false);

  const finish = () => {
    if (completed.current) return;
    completed.current = true;
    setShow(false);
    setTimeout(onComplete, 400);
  };

  const handleEvent = (event: string) => {
    if (event === 'complete' || event === 'animationcomplete') {
      finish();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-500 ${
        show ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="w-full h-full flex items-center justify-center">
        <DotLottiePlayer
          src="/splash.lottie"
          autoplay
          loop={false}
          onEvent={handleEvent}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      <button
        onClick={finish}
        className="absolute bottom-8 right-8 px-6 py-2.5 rounded-full bg-black/10 backdrop-blur-md text-gray-700 text-sm font-medium hover:bg-black/20 transition-all border border-black/20"
      >
        Skip &rarr;
      </button>
    </div>
  );
};

export default VideoSplash;
