

// ==================== 类型定义 ====================

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
  debounce?: boolean; // 是否防抖，默认为 true
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
interface InterceptorHandler<T> {
  onFulfilled?: (value: T) => T | Promise<T>;
  onRejected?: (error: any) => any;
}

// 缓存项
interface CacheItem {
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

// 日志级别
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// 日志接口
export interface Logger {
  debug: (message: string, data?: any) => void;
  info: (message: string, data?: any) => void;
  warn: (message: string, data?: any) => void;
  error: (message: string, error?: any) => void;
}

// 默认日志实现
class DefaultLogger implements Logger {
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

// ==================== API 实例类 ====================

export class ApiInstance {
  private config: ApiConfig;
  private requestInterceptors: InterceptorHandler<RequestConfig>[] = [];
  private responseInterceptors: InterceptorHandler<ApiResponse>[] = [];
  private cache = new Map<string, CacheItem>();
  private abortControllers = new Map<string, AbortController>();
  private pendingRequests = new Map<string, Promise<ApiResponse>>(); // 跟踪正在进行的请求
  private logger: Logger;

  constructor(config: ApiConfig = {}) {
    this.config = {
      baseURL: '',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: false,
      debounce: true, // 默认开启防抖
      retry: {
        count: 0,
        delay: 1000,
        backoff: 'exponential',
      },
      cache: {
        enabled: false,
        ttl: 5 * 60 * 1000, // 5分钟
      },
      logger: {
        enabled: false,
        level: 'info',
      },
      ...config,
    };

    this.logger = new DefaultLogger(this.config.logger?.level);
    // 如果日志功能关闭，使用空的日志实现
    if (!this.config.logger?.enabled) {
      this.logger = {
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
      };
    }
  }

  // 生成缓存键
  private generateCacheKey(config: RequestConfig): string {
    const { url, method, params, data } = config;
    return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`;
  }

  // 生成请求键用于防抖
  private generateRequestKey(config: RequestConfig): string {
    const { url, method, params, data } = config;
    return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`;
  }

  // 获取缓存
  private getCache(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  // 设置缓存
  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  // 清理过期缓存
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // 创建请求配置
  private createRequestConfig(config: RequestConfig): RequestConfig {
    return {
      url: this.config.baseURL ? `${this.config.baseURL}${config.url}` : config.url,
      method: config.method || 'GET',
      data: config.data,
      params: config.params,
      headers: {
        ...this.config.headers,
        ...config.headers,
      },
      timeout: config.timeout || this.config.timeout,
      retry: config.retry || this.config.retry,
      cache: config.cache || this.config.cache,
      signal: config.signal,
      onProgress: config.onProgress,
    };
  }

  // 处理请求拦截器
  private async applyRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let currentConfig = config;
    
    for (const interceptor of this.requestInterceptors) {
      try {
        if (interceptor.onFulfilled) {
          currentConfig = await interceptor.onFulfilled(currentConfig);
        }
      } catch (error) {
        if (interceptor.onRejected) {
          throw await interceptor.onRejected(error);
        }
        throw error;
      }
    }
    
    return currentConfig;
  }

  // 处理响应拦截器
  private async applyResponseInterceptors(response: ApiResponse): Promise<ApiResponse> {
    let currentResponse = response;
    
    for (const interceptor of this.responseInterceptors) {
      try {
        if (interceptor.onFulfilled) {
          currentResponse = await interceptor.onFulfilled(currentResponse);
        }
      } catch (error) {
        if (interceptor.onRejected) {
          throw await interceptor.onRejected(error);
        }
        throw error;
      }
    }
    
    return currentResponse;
  }

  // 构建 URL 查询参数
  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  }

  // 延迟函数
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 计算重试延迟
  private calculateRetryDelay(attempt: number, baseDelay: number, backoff: 'linear' | 'exponential'): number {
    if (backoff === 'exponential') {
      return baseDelay * Math.pow(2, attempt - 1);
    }
    return baseDelay * attempt;
  }

  // 执行请求（带重试）
  private async executeWithRetry<T = any>(config: RequestConfig, attempt: number = 1): Promise<ApiResponse<T>> {
    try {
      return await this.executeRequest<T>(config);
    } catch (error) {
      const retryConfig = config.retry || this.config.retry;
      
      if (retryConfig && attempt <= retryConfig.count) {
        const delay = this.calculateRetryDelay(attempt, retryConfig.delay, retryConfig.backoff || 'exponential');
        this.logger.info(`重试请求 (${attempt}/${retryConfig.count})，延迟: ${delay}ms`);
        await this.delay(delay);
        return this.executeWithRetry<T>(config, attempt + 1);
      }
      
      throw error;
    }
  }

  // 执行单个请求
  private async executeRequest<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
    // 检查缓存
    if (config.cache?.enabled && config.method === 'GET') {
      const cacheKey = this.generateCacheKey(config);
      const cachedData = this.getCache(cacheKey);
      if (cachedData) {
        this.logger.debug('使用缓存数据', { key: cacheKey });
        return {
          data: cachedData,
          status: 200,
          statusText: 'OK',
          headers: { 'x-cache': 'HIT' },
        };
      }
    }

    // 构建完整 URL
    let url = config.url;
    if (config.params) {
      const queryString = this.buildQueryString(config.params);
      url += (url.includes('?') ? '&' : '?') + queryString;
    }

    this.logger.debug('发起请求', { method: config.method, url });

    // 创建 fetch 配置
    const fetchConfig: RequestInit = {
      method: config.method,
      headers: config.headers,
      credentials: this.config.withCredentials ? 'include' : 'same-origin',
    };

    // 添加请求体
    if (config.data && ['POST', 'PUT', 'PATCH'].includes(config.method || 'GET')) {
      fetchConfig.body = JSON.stringify(config.data);
    }

    // 创建或使用现有的 AbortController
    let controller: AbortController;
    if (config.signal) {
      controller = new AbortController();
      config.signal.addEventListener('abort', () => controller.abort());
    } else {
      controller = new AbortController();
    }

    // 设置超时
    const timeoutId = setTimeout(() => controller.abort(), config.timeout || this.config.timeout);

    try {
      // 执行请求
      const response = await fetch(url, {
        ...fetchConfig,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 检查响应状态
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        this.logger.error('请求失败', { status: response.status, statusText: response.statusText });
        throw error;
      }

      // 解析响应数据
      const data = await response.json();
      
      this.logger.debug('请求成功', { status: response.status, data });
      
      // 创建响应对象
      const apiResponse: ApiResponse<T> = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        config,
      };

      // 缓存响应
      if (config.cache?.enabled && config.method === 'GET') {
        const cacheKey = this.generateCacheKey(config);
        this.setCache(cacheKey, data, config.cache.ttl || this.config.cache!.ttl!);
        this.logger.debug('缓存响应数据', { key: cacheKey });
      }

      // 应用响应拦截器
      return await this.applyResponseInterceptors(apiResponse);
    } catch (error) {
      clearTimeout(timeoutId);
      
      // 处理超时错误
      if (error instanceof Error && error.name === 'AbortError') {
        const abortError = new Error('请求超时或被取消');
        this.logger.error('请求被取消', { error: abortError.message });
        throw abortError;
      }
      
      this.logger.error('请求执行失败', { error });
      throw error;
    }
  }

  // request 方法设为 public，供 createApiHook 使用
  public async request<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
    // 清理过期缓存
    this.cleanupCache();
    
    // 应用请求拦截器
    const requestConfig = await this.applyRequestInterceptors(this.createRequestConfig(config));
    
    // 生成请求键用于防抖
    const requestKey = this.generateRequestKey(requestConfig);
    
    // 如果开启了防抖且相同请求正在进行，返回现有的 Promise
    if (this.config.debounce && this.pendingRequests.has(requestKey)) {
      this.logger.debug('请求正在进行中，返回现有 Promise', { key: requestKey });
      return this.pendingRequests.get(requestKey)!;
    }
    
    // 执行请求（带重试）
    const requestPromise = this.executeWithRetry<T>(requestConfig);
    
    // 如果开启了防抖，将请求添加到 pendingRequests
    if (this.config.debounce) {
      this.pendingRequests.set(requestKey, requestPromise);
      
      // 请求完成后从 pendingRequests 中移除
      requestPromise.finally(() => {
        this.pendingRequests.delete(requestKey);
      });
    }
    
    return requestPromise;
  }

  // 清除缓存
  clearCache(): void {
    this.cache.clear();
    this.logger.info('缓存已清除');
  }

  // 取消所有请求
  cancelAllRequests(): void {
    for (const controller of this.abortControllers.values()) {
      controller.abort();
    }
    this.abortControllers.clear();
    this.logger.info('所有请求已取消');
  }



  // 拦截器
  get interceptors(): Interceptors {
    return {
      request: {
        use: (onFulfilled, onRejected) => {
          const id = this.requestInterceptors.length;
          this.requestInterceptors.push({ onFulfilled, onRejected });
          return id;
        },
        eject: (id: number) => {
          this.requestInterceptors.splice(id, 1);
        },
      },
      response: {
        use: (onFulfilled, onRejected) => {
          const id = this.responseInterceptors.length;
          this.responseInterceptors.push({ onFulfilled, onRejected });
          return id;
        },
        eject: (id: number) => {
          this.responseInterceptors.splice(id, 1);
        },
      },
    };
  }

  set interceptors(interceptors: Partial<{
    request: InterceptorHandler<RequestConfig>[];
    response: InterceptorHandler<ApiResponse>[];
  }>) {
    if (interceptors.request) {
      this.requestInterceptors = interceptors.request;
    }
    if (interceptors.response) {
      this.responseInterceptors = interceptors.response;
    }
  }
}