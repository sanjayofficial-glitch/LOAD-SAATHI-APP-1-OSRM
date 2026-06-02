"use client";

import React, { useEffect, useState } from 'react';
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
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    // Fallback timeout in case animation doesn't complete
    const timeout = setTimeout(() => {
      if (isPlaying) {
        onComplete();
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [isPlaying, onComplete]);

  return (
    <div className={`relative w-full h-screen flex items-center justify-center bg-white ${className}`}>
      <div className="w-full max-w-2xl aspect-square">
        <DotLottiePlayer
          src={src}
          autoplay
          loop={false}
          onEvent={(event: string) => {
            console.log('Lottie event:', event);
            if (event === 'complete' || event === 'animationcomplete') {
              setIsPlaying(false);
              onComplete();
            }
          }}
          onPlay={() => setIsPlaying(true)}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      
      {/* Subtle gradient for depth on white background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-transparent to-gray-50/50 pointer-events-none" />
    </div>
  );
};

export default LottieLoader;