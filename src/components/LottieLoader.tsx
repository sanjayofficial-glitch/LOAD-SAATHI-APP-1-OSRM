"use client";

import { useEffect, useRef } from 'react';
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
    // Safety net — only fires if animation fails to load or gets stuck (>20s)
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
    <div className={`relative w-full max-w-md mx-auto ${className}`}>
      <div className="w-full aspect-square">
        <DotLottiePlayer
          src={src}
          autoplay
          loop={false}
          onEvent={handleEvent}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
};

export default LottieLoader;