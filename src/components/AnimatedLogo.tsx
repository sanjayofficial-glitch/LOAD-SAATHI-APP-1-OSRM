"use client";

import { Truck } from 'lucide-react';

const AnimatedLogo = () => {
  return (
    <div className="relative w-24 h-24 mx-auto">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Truck icon without rotation animation */}
          <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Truck className="h-10 w-10 text-white" />
          </div>
          {/* Pulsing ring */}
          <div className="absolute -inset-2 border-4 border-orange-200 rounded-3xl animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default AnimatedLogo;