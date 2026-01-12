/**
 * Production-safe logging utility.
 * Logs are only output in development mode (__DEV__).
 * Errors are always logged regardless of environment.
 */

const isDev = __DEV__;

export const logger = {
  /**
   * Log general information (dev only)
   */
  log: (...args: unknown[]) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Log warnings (dev only)
   */
  warn: (...args: unknown[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  /**
   * Log errors (always, for crash reporting)
   */
  error: (...args: unknown[]) => {
    console.error(...args);
  },

  /**
   * Log debug information (dev only)
   */
  debug: (...args: unknown[]) => {
    if (isDev) {
      console.debug(...args);
    }
  },
};
