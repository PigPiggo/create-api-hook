// 批量请求工具
export async function batchRequests<T>(
  requests: (() => Promise<T>)[]
): Promise<T[]> {
  return Promise.all(requests.map(request => request()));
}

// 顺序请求工具
export async function sequentialRequests<T>(
  requests: (() => Promise<T>)[]
): Promise<T[]> {
  const results: T[] = [];
  for (const request of requests) {
    results.push(await request());
  }
  return results;
}

// 缓存键生成器
export function generateCacheKey(
  url: string,
  method: string,
  params?: Record<string, any>,
  data?: any
): string {
  return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`;
}

// 请求配置验证器
export function validateRequestConfig(config: any): string[] {
  const errors: string[] = [];
  
  if (!config.url) {
    errors.push('URL 是必需的');
  }
  
  if (config.timeout && config.timeout <= 0) {
    errors.push('超时时间必须大于 0');
  }
  
  if (config.retry) {
    if (config.retry.count < 0) {
      errors.push('重试次数不能为负数');
    }
    if (config.retry.delay < 0) {
      errors.push('重试延迟不能为负数');
    }
  }
  
  return errors;
} 