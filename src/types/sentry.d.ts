declare const Sentry: {
  init(options: Record<string, unknown>): void;
  captureException(error: unknown): void;
  captureMessage(message: string): void;
};