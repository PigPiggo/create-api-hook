import { Logger, LogLevel } from './ApiInstance';

// ==================== 日志系统 ====================

// 默认日志实现
export class DefaultLogger implements Logger {
  private level: LogLevel;

  constructor(level: LogLevel = 'info') {
    this.level = level;
  }

  private shouldLog(messageLevel: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(messageLevel) >= levels.indexOf(this.level);
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.debug(`[API Debug] ${message}`, data);
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.info(`[API Info] ${message}`, data);
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(`[API Warn] ${message}`, data);
    }
  }

  error(message: string, error?: any): void {
    if (this.shouldLog('error')) {
      console.error(`[API Error] ${message}`, error);
    }
  }
}