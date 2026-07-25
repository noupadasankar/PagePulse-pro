/**
 * Structured JSON logger.
 *
 * `meta` is a permissive record rather than a strict type: it's a logging sink
 * accepting arbitrary diagnostic context, and narrowing it would force a cast
 * at nearly every call site.
 */
type LogMeta = Record<string, unknown>;

const emit = (
  write: (line: string) => void,
  level: string,
  message: string,
  meta?: LogMeta
): void => {
  write(JSON.stringify({ level, message, timestamp: new Date().toISOString(), ...meta }));
};

export const logger = {
  info: (message: string, meta?: LogMeta) => emit(console.log, 'info', message, meta),
  warn: (message: string, meta?: LogMeta) => emit(console.warn, 'warn', message, meta),
  error: (message: string, meta?: LogMeta) => emit(console.error, 'error', message, meta),
  debug: (message: string, meta?: LogMeta) => {
    if (process.env.NODE_ENV !== 'production') emit(console.debug, 'debug', message, meta);
  },
};
