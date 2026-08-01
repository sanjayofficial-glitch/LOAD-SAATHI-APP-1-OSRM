type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDev = import.meta.env.DEV;

function formatMessage(level: LogLevel, tag: string, message: string): string {
  return `[${tag}] ${message}`;
}

export function createLogger(tag: string) {
  return {
    debug: (message: string, ...args: unknown[]) => {
      if (isDev) console.debug(formatMessage('debug', tag, message), ...args);
    },
    info: (message: string, ...args: unknown[]) => {
      if (isDev) console.info(formatMessage('info', tag, message), ...args);
    },
    warn: (message: string, ...args: unknown[]) => {
      console.warn(formatMessage('warn', tag, message), ...args);
    },
    error: (message: string, ...args: unknown[]) => {
      console.error(formatMessage('error', tag, message), ...args);
    },
  };
}
