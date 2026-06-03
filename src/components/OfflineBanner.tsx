"use client";

import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineBanner() {
  const { isOnline, wasOffline } = useNetworkStatus();

  if (!isOnline) {
    return (
      <div className="bg-yellow-500 text-yellow-950 px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2 sticky top-0 z-[60]">
        <WifiOff className="h-4 w-4" />
        You are offline. Some features may not work.
      </div>
    );
  }

  if (wasOffline) {
    return (
      <div className="bg-green-500 text-white px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2 sticky top-0 z-[60] animate-in slide-in-from-top">
        <Wifi className="h-4 w-4" />
        Back online!
      </div>
    );
  }

  return null;
}

export default OfflineBanner;
