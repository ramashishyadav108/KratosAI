import { isDevelopment } from '../config/env.js';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * Color codes for console output
 */
const colors = {
  DEBUG: '\x1b[36m', // Cyan
  INFO: '\x1b[32m',  // Green
  WARN: '\x1b[33m',  // Yellow
  ERROR: '\x1b[31m', // Red
  RESET: '\x1b[0m',
} as const;

/**
 * Logger class for structured logging
 */
class Logger {
  private formatMessage(level: LogLevel, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString();
    const color = colors[level];
    const reset = colors.RESET;
    
    let logMessage = `${color}[${timestamp}] [${level}]${reset} ${message}`;
    
    if (data !== undefined) {
      if (data instanceof Error) {
        logMessage += `\n${color}Error:${reset} ${data.message}`;
        if (isDevelopment && data.stack) {
          logMessage += `\n${data.stack}`;
        }
      } else {
        logMessage += `\n${color}Data:${reset} ${JSON.stringify(data, null, 2)}`;
      }
    }
    
    return logMessage;
  }

  debug(message: string, data?: unknown): void {
    if (isDevelopment) {
      console.log(this.formatMessage(LogLevel.DEBUG, message, data));
    }
  }

  info(message: string, data?: unknown): void {
    console.log(this.formatMessage(LogLevel.INFO, message, data));
  }

  warn(message: string, data?: unknown): void {
    console.warn(this.formatMessage(LogLevel.WARN, message, data));
  }

  error(message: string, error?: unknown): void {
    console.error(this.formatMessage(LogLevel.ERROR, message, error));
  }

  http(method: string, path: string, statusCode: number, duration?: number): void {
    const durationStr = duration ? ` - ${duration}ms` : '';
    const color = statusCode >= 500 ? colors.ERROR : statusCode >= 400 ? colors.WARN : colors.INFO;
    console.log(`${color}[HTTP]${colors.RESET} ${method} ${path} ${statusCode}${durationStr}`);
  }
}

/**
 * Singleton logger instance
 */
export const logger = new Logger();
