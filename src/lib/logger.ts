const isDev = import.meta.env.DEV;

function formatMessage(tag: string, message: string): string {
  return `[${tag}] ${message}`;
}

export function createLogger(tag: string) {
  return {
    debug: (message: string, ...args: unknown[]) => {
      if (isDev) console.debug(formatMessage(tag, message), ...args);
    },
    info: (message: string, ...args: unknown[]) => {
      if (isDev) console.info(formatMessage(tag, message), ...args);
    },
    warn: (message: string, ...args: unknown[]) => {
      console.warn(formatMessage(tag, message), ...args);
    },
    error: (message: string, ...args: unknown[]) => {
      console.error(formatMessage(tag, message), ...args);
    },
  };
}
