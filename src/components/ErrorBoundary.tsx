"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import logger from "@/utils/logger";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle } from "lucide-react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error(`[ErrorBoundary] ${error.message}`, { info });

    const sentry = (window as { Sentry?: { captureException: (err: Error, extra: object) => void } }).Sentry;
    if (sentry) {
      sentry.captureException(error, { extra: info });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center w-full max-w-md">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-2">
              An unexpected error occurred.
            </p>
            <p className="text-sm text-gray-400 mb-6 font-mono bg-gray-50 p-2 rounded">
              {this.state.error?.message || "Unknown error"}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={this.handleRetry} className="gap-2">
                <RefreshCw className="h-4 w-4" /> Try Again
              </Button>
              <Button onClick={this.handleRefresh} className="bg-orange-600 hover:bg-orange-700 gap-2">
                <RefreshCw className="h-4 w-4" /> Refresh Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
