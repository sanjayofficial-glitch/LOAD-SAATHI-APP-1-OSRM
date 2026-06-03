"use client";

import React, { useEffect, useRef } from 'react';
import { DotLottiePlayer } from '@dotlottie/react-player';

interface LottieLoaderProps {
  src: string;
  onComplete: () => void;
  className?: string;
}

const LottieLoader: React.FC<LottieLoaderProps> = ({ 
  src, 
  onComplete,
  className = ''
}) => {
  const animationCompleted = useRef(false);

  useEffect(() => {
    // Genuine safety net — only fires if animation never completes after 20 seconds
    // This handles edge cases where the Lottie file fails to load or gets stuck
    const timeout = setTimeout(() => {
      if (!animationCompleted.current) {
        console.warn('[LottieLoader] Animation timed out after 20s, forcing completion');
        onComplete();
      }
    }, 20000);

    return () => clearTimeout(timeout);
  }, [onComplete]);

  const handleEvent = (event: string) => {
    if (event === 'complete' || event === 'animationcomplete') {
      animationCompleted.current = true;
      onComplete();
    }
  };

  return (
    <div className={`relative w-full h-full flex items-center justify-center bg-white ${className}`}>
      <div className="w-full max-w-2xl aspect-square">
        <DotLottiePlayer
          src={src}
          autoplay
          loop={false}
          onEvent={handleEvent}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      
      {/* Subtle gradient for depth on white background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-transparent to-gray-50/50 pointer-events-none" />
    </div>
  );
};

export default LottieLoader;