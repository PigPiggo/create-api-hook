import { useState } from 'react';
import { ApiInstance, RequestConfig, ApiHookReturn } from '../ApiInstance';
import { createApiHook } from '../createApiHook';
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
  error: any;
  data: (T | null)[];
  reset: () => void;
  cancel: () => void;
}
import { batchRequests, sequentialRequests } from './request';

// 创建增强的 API Hook
export function createEnhancedApiHook<T = unknown>(
  config: RequestConfig | ((...args: unknown[]) => RequestConfig),
  apiConfig: any
) {
  const apiHook = createApiHook(apiConfig);
  const hook = apiHook<T>(config as any);
  
  return (): EnhancedApiHookReturn<T> => {
    const apiHookInstance = hook();
    const [status, setStatus] = useState<RequestStatus>(RequestStatus.IDLE);
    
    const execute = async (...args: unknown[]): Promise<T> => {
      setStatus(RequestStatus.LOADING);
      try {
        const result = await apiHookInstance.execute(...args) as T;
        setStatus(RequestStatus.SUCCESS);
        return result;
      } catch (error) {
        setStatus(RequestStatus.ERROR);
        throw error;
      }
    };

    const retry = async (): Promise<T> => {
      if (apiHookInstance.data !== null) {
        return execute();
      }
      throw new Error('没有可重试的请求');
    };
    
    return {
      ...apiHookInstance,
      status,
      execute,
      retry,
    };
  };
}

// 创建批量 API Hook
export function createBatchApiHook<T = unknown>(
  configs: (RequestConfig | ((...args: unknown[]) => RequestConfig))[],
  apiConfig: any
) {
  const apiHook = createApiHook(apiConfig);
  const hooks = configs.map(config => apiHook<T>(config as any));
  
  return (): BatchApiHookReturn<T> => {
    const apiHooks = hooks.map(hook => hook());
    
    const executeBatch = async (...args: unknown[]): Promise<T[]> => {
      const requests = apiHooks.map(hook => async () => await hook.execute(...args) as T);
      return batchRequests(requests);
    };

    const executeSequential = async (...args: unknown[]): Promise<T[]> => {
      const requests = apiHooks.map(hook => async () => await hook.execute(...args) as T);
      return sequentialRequests(requests);
    };

    return {
      hooks: apiHooks as ApiHookReturn<T>[],
      executeBatch,
      executeSequential,
      loading: apiHooks.some(hook => hook.loading),
      error: apiHooks.find(hook => hook.error)?.error || null,
      data: apiHooks.map(hook => hook.data as T | null),
      reset: () => apiHooks.forEach(hook => hook.reset()),
      cancel: () => apiHooks.forEach(hook => hook.cancel()),
    };
  };
} 