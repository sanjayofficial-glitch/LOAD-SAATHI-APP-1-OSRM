"use client";

import logger from "@/utils/logger";

export function isNetworkError(error: unknown): boolean {
  if (!error) return false;

  const msg = typeof error === 'string' ? error : error instanceof Error ? error.message : '';

  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('Network Error') || msg.includes('net::ERR_')) {
    return true;
  }

  if (error instanceof TypeError && msg === 'Failed to fetch') {
    return true;
  }

  if (msg.includes('could not connect') || msg.includes('timed out') || msg.includes('timeout') || msg.includes('ECONNREFUSED') || msg.includes('ECONNRESET') || msg.includes('ENOTFOUND')) {
    return true;
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as any;
    if (err.code === 'PGRST301' || err.code === 'PGRST302' || err.code?.startsWith('NETWORK_')) {
      return true;
    }
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return true;
  }

  return false;
}

export function getNetworkErrorMessage(): string {
  return 'Unable to connect. Please check your internet connection and try again.';
}

export const handleError = (error: Error, context?: Record<string, any>) => {
  logger.error(`[ErrorHandler] ${error.message}`, { ...context, stack: error.stack });

  if (isNetworkError(error)) {
    logger.warn('[ErrorHandler] This is a network connectivity error', { ...context });
  }
};

export default handleError;
