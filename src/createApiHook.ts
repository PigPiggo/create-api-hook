import { useState } from 'react';
import { ApiInstance, ApiConfig, RequestConfig, ApiError, ApiHookReturn } from './ApiInstance';

/**
 * 创建 API Hook 工厂函数
 * @param config ApiInstance 配置参数
 * @returns apiHook 函数，该函数可以创建具体的 API Hook
 */
export function createApiHook(config: ApiConfig) {
  // 使用闭包创建 ApiInstance，外部无法直接访问
  const apiInstance = new ApiInstance(config);

  /**
   * apiHook 函数 - 通过闭包访问 apiInstance
   * @param requestConfig 请求配置或配置生成函数
   * @returns React Hook 函数
   */
  const apiHook = <T = unknown>(
    requestConfig: RequestConfig | ((...args: unknown[]) => RequestConfig)
  ) => {
    return (): ApiHookReturn<T> => {
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState<ApiError | null>(null);
      const [data, setData] = useState<T | null>(null);
      const [abortController, setAbortController] = useState<AbortController | null>(null);

      const execute = async (...args: unknown[]) => {
        // 取消之前的请求
        if (abortController) {
          abortController.abort();
        }

        const controller = new AbortController();
        setAbortController(controller);

        setLoading(true);
        setError(null);
        
        try {
          let finalRequestConfig: RequestConfig;
          
          if (typeof requestConfig === 'function') {
            finalRequestConfig = requestConfig(...args);
          } else {
            finalRequestConfig = { ...requestConfig };
            // 如果是 POST/PUT/PATCH 请求且有参数，添加到 data
            if (['POST', 'PUT', 'PATCH'].includes(finalRequestConfig.method || 'GET') && args.length > 0) {
              finalRequestConfig.data = args[0];
            }
          }

          // 添加 AbortSignal
          finalRequestConfig.signal = controller.signal;
          // 通过闭包访问 apiInstance
          const response = await apiInstance.request<T>(finalRequestConfig);
          setData(response.data);
          return response.data;
        } catch (err) {
          return Promise.reject(err)
        } finally {
          setLoading(false);
          setAbortController(null);
        }
      };

      const reset = () => {
        setLoading(false);
        setError(null);
        setData(null);
        if (abortController) {
          abortController.abort();
          setAbortController(null);
        }
      };

      const cancel = () => {
        if (abortController) {
          abortController.abort();
          setAbortController(null);
        }
        setLoading(false);
      };

      return {
        loading,
        error,
        data,
        execute,
        reset,
        cancel,
      };
    };
  };

  // 扩展 apiHook，添加一些实例方法的访问
  const extendedApiHook = Object.assign(apiHook, {
    // 通过闭包暴露一些常用的 apiInstance 方法
    interceptors: apiInstance.interceptors,
    clearCache: () => apiInstance.clearCache(),
    cancelAllRequests: () => apiInstance.cancelAllRequests(),
  });

  return extendedApiHook;
}