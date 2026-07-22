import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const GA_MEASUREMENT_ID = "G-GEFWPQNHT6";

/**
 * Custom hook / component to track SPA page views in Google Analytics 4
 */
export function GoogleAnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("config", GA_MEASUREMENT_ID, {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return null;
}

/**
 * Utility function to send custom conversion or interaction events to Google Analytics
 */
export const trackGAEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, eventParams);
  }
};
