import { ApiHookReturn, ApiError } from '../ApiInstance';

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