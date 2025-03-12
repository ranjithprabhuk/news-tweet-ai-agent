// src/utils/logger.ts
import fs from 'fs';
import path from 'path';
import { loadConfig } from './config';

// Define log levels
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

// Logger class
class Logger {
  private logLevel: LogLevel;
  private saveToFile: boolean;
  private filePath: string;

  constructor() {
    const config = loadConfig();
    this.logLevel = this.getLogLevelFromString(config.logging?.level || 'info');
    this.saveToFile = config.logging?.saveToFile || false;
    this.filePath = config.logging?.filePath || 'logs/agent.log';

    // Create log directory if needed
    if (this.saveToFile) {
      const logDir = path.dirname(this.filePath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    }
  }

  private getLogLevelFromString(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case 'error':
        return LogLevel.ERROR;
      case 'warn':
        return LogLevel.WARN;
      case 'info':
        return LogLevel.INFO;
      case 'debug':
        return LogLevel.DEBUG;
      default:
        return LogLevel.INFO;
    }
  }

  private formatMessage(level: string, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    let formattedMessage = `[${timestamp}] [${level}] ${message}`;

    if (args.length > 0) {
      formattedMessage +=
        ' ' +
        args
          .map((arg) => {
            if (arg instanceof Error) {
              return arg.stack || arg.message;
            }
            return typeof arg === 'object' ? JSON.stringify(arg) : arg;
          })
          .join(' ');
    }

    return formattedMessage;
  }

  private log(level: LogLevel, levelName: string, message: string, ...args: any[]): void {
    if (level <= this.logLevel) {
      const formattedMessage = this.formatMessage(levelName, message, ...args);

      // Log to console
      switch (level) {
        case LogLevel.ERROR:
          console.error(formattedMessage);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage);
          break;
        case LogLevel.DEBUG:
          console.debug(formattedMessage);
          break;
      }

      // Save to file if enabled
      if (this.saveToFile) {
        fs.appendFileSync(this.filePath, formattedMessage + '\n');
      }
    }
  }

  error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, 'ERROR', message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, 'WARN', message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, 'INFO', message, ...args);
  }

  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, ...args);
  }
}

// Create a singleton instance
export const logger = new Logger();

// Setup function to be called at startup
export function setupLogger() {
  const config = loadConfig();
  logger.info('Logger initialized', {
    level: config.logging?.level || 'info',
    saveToFile: config.logging?.saveToFile || false,
    filePath: config.logging?.filePath || 'logs/agent.log',
  });
}
