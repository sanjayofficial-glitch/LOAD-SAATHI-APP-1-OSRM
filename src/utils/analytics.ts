declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const GA_MEASUREMENT_ID = "G-GEFWPQNHT6";

/**
 * Utility function to send custom conversion or interaction events to Google Analytics
 */
export const trackGAEvent = (eventName: string, eventParams?: Record<string, unknown>) => {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, eventParams);
  }
};
