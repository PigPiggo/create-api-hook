import { useState } from 'react';

// 通用错误类型
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

// API 请求配置
export interface ApiConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  retry?: {
    count: number;
    delay: number;
    backoff?: 'linear' | 'exponential';
  };
  cache?: {
    enabled: boolean;
    ttl?: number; // 缓存时间（毫秒）
  };
  logger?: {
    enabled: boolean;
    level?: 'debug' | 'info' | 'warn' | 'error';
  };
}

// 请求配置
export interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
  retry?: {
    count: number;
    delay: number;
    backoff?: 'linear' | 'exponential';
  };
  cache?: {
    enabled: boolean;
    ttl?: number;
  };
  signal?: AbortSignal;
  onProgress?: (progress: number) => void;
}

// 响应类型
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config?: RequestConfig;
}

// 拦截器类型
export interface Interceptors {
  request: {
    use: (onFulfilled?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>, onRejected?: (error: any) => any) => number;
    eject: (id: number) => void;
  };
  response: {
    use: (onFulfilled?: (response: ApiResponse) => ApiResponse | Promise<ApiResponse>, onRejected?: (error: any) => any) => number;
    eject: (id: number) => void;
  };
}

// 拦截器处理器
export interface InterceptorHandler<T> {
  onFulfilled?: (value: T) => T | Promise<T>;
  onRejected?: (error: any) => any;
}

// 缓存项
export interface CacheItem {
  data: any;
  timestamp: number;
  ttl: number;
}

// 工厂函数返回的 hook 类型
export interface ApiHookReturn<T> {
  loading: boolean;
  error: ApiError | null;
  data: T | null;
  execute: (...args: unknown[]) => Promise<T>;
  reset: () => void;
  cancel: () => void;
}

// 请求状态枚举
export enum RequestStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

// 增强的 API Hook 返回类型
export interface EnhancedApiHookReturn<T> {
  loading: boolean;
  error: any;
  data: T | null;
  status: RequestStatus;
  execute: (...args: unknown[]) => Promise<T>;
  reset: () => void;
  cancel: () => void;
  retry: () => Promise<T>;
}

// 批量请求结果类型
export interface BatchApiHookReturn<T> {
  hooks: ApiHookReturn<T>[];
  executeBatch: (...args: unknown[]) => Promise<T[]>;
  executeSequential: (...args: unknown[]) => Promise<T[]>;
  loading: boolean;
  error: ApiError | null;
  data: (T | null)[];
  reset: () => void;
  cancel: () => void;
}

// 日志级别
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// 日志接口
export interface Logger {
  debug: (message: string, data?: any) => void;
  info: (message: string, data?: any) => void;
  warn: (message: string, data?: any) => void;
  error: (message: string, error?: any) => void;
}

// 预设配置类型
export type PresetConfig = 'rest' | 'graphql' | 'file' | 'json' | 'form';

// 请求进度回调
export interface ProgressCallback {
  (progress: number): void;
}

// 重试策略
export interface RetryStrategy {
  count: number;
  delay: number;
  backoff: 'linear' | 'exponential';
  shouldRetry?: (error: any, attempt: number) => boolean;
}

// 缓存策略
export interface CacheStrategy {
  enabled: boolean;
  ttl: number;
  keyGenerator?: (config: RequestConfig) => string;
  shouldCache?: (response: ApiResponse) => boolean;
} 