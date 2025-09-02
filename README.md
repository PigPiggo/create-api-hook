# create-api-hook

一个功能强大的基于 React Hooks 的 API 请求库，提供简洁的 API 调用接口、拦截器、缓存、重试等功能。

## ✨ 特性

- 🚀 **基于 React Hooks** - 完全基于 React Hooks 设计，提供简洁的 API
- 🔄 **自动重试** - 支持指数退避和线性重试策略
- 💾 **智能缓存** - 内置缓存系统，支持 TTL 配置
- 🛡️ **请求拦截器** - 支持请求和响应拦截器
- 📦 **批量请求** - 支持并行和顺序批量请求
- 🎯 **TypeScript** - 完整的 TypeScript 支持
- 📊 **日志系统** - 内置日志系统，支持不同级别
- 🔧 **预设配置** - 提供 REST、GraphQL、文件上传等预设配置
- 🎨 **增强 Hook** - 提供增强的 Hook 功能，包括状态管理和重试

## 📦 安装

```bash
npm install create-api-hook
# 或
yarn add create-api-hook
```

## 🚀 快速开始

### 基础用法

```tsx
import React from 'react';
import { createApiHook } from 'create-api-hook';

// 创建 API Hook
const useUserData = createApiHook({
  baseURL: 'https://api.example.com',
})({
  url: '/api/users',
  method: 'GET',
});

function UserComponent() {
  const { loading, error, data, execute } = useUserData();

  React.useEffect(() => {
    execute();
  }, []);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;
  
  return (
    <div>
      <h1>用户数据</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

### 带参数的请求

```tsx
const useUserById = createApiHook((id: string) => ({
  url: `/api/users/${id}`,
  method: 'GET',
}));

function UserDetail({ userId }: { userId: string }) {
  const { loading, error, data, execute } = useUserById();

  React.useEffect(() => {
    execute(userId);
  }, [userId]);

  // ... 渲染逻辑
}
```

### POST 请求

```tsx
const useCreateUser = createApiHook({
  baseURL: 'https://api.example.com',
})({
  url: '/api/users',
  method: 'POST',
});

function CreateUserForm() {
  const { loading, error, data, execute } = useCreateUser();

  const handleSubmit = async (userData: any) => {
    try {
      await execute(userData);
      console.log('用户创建成功');
    } catch (error) {
      console.error('创建失败:', error);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit({ name: 'John', email: 'john@example.com' });
    }}>
      {/* 表单内容 */}
    </form>
  );
}
```

## 🔧 高级功能

### 自定义 API 实例

```tsx
import { ApiInstance, createApiHook } from 'create-api-hook';

// 创建自定义 API 实例
const customApi = new ApiInstance({
  baseURL: 'https://api.example.com',
  timeout: 5000,
  headers: {
    'Authorization': 'Bearer your-token',
  },
  retry: {
    count: 3,
    delay: 1000,
    backoff: 'exponential',
  },
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5分钟
  },
  logger: {
    enabled: true,
    level: 'debug',
  },
});

// 使用自定义实例创建 Hook
const useCustomApi = createApiHook(customApi)({
  url: '/api/data',
  method: 'GET',
});
```

### 拦截器

```tsx
// 请求拦截器
customApi.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    console.log('发送请求:', config);
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 响应拦截器
customApi.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    console.log('收到响应:', response);
    return response;
  },
  (error) => {
    // 对响应错误做点什么
    return Promise.reject(error);
  }
);
```



### 批量请求

```tsx
import { createBatchApiHook } from 'create-api-hook';

const useBatchRequests = createBatchApiHook([
  { url: '/api/users', method: 'GET' },
  { url: '/api/posts', method: 'GET' },
  { url: '/api/comments', method: 'GET' },
], {
  baseURL: 'https://api.example.com',
});

function Dashboard() {
  const { loading, error, data, executeBatch, executeSequential } = useBatchRequests();

  const handleLoadAll = async () => {
    // 并行执行所有请求
    const [users, posts, comments] = await executeBatch();
    console.log('所有数据:', { users, posts, comments });
  };

  const handleLoadSequential = async () => {
    // 顺序执行所有请求
    const [users, posts, comments] = await executeSequential();
    console.log('顺序加载完成');
  };

  return (
    <div>
      <button onClick={handleLoadAll}>并行加载</button>
      <button onClick={handleLoadSequential}>顺序加载</button>
    </div>
  );
}
```

### 增强 Hook

```tsx
import { createEnhancedApiHook, RequestStatus } from 'create-api-hook';

const useEnhancedUser = createEnhancedApiHook({
  url: '/api/users',
  method: 'GET',
}, {
  baseURL: 'https://api.example.com',
});

function EnhancedUserComponent() {
  const { loading, error, data, status, execute, retry } = useEnhancedUser();

  return (
    <div>
      <div>状态: {status}</div>
      {status === RequestStatus.LOADING && <div>加载中...</div>}
      {status === RequestStatus.ERROR && (
        <div>
          <div>错误: {error?.message}</div>
          <button onClick={retry}>重试</button>
        </div>
      )}
      {status === RequestStatus.SUCCESS && (
        <div>
          <h1>用户数据</h1>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

### 预设配置

```tsx
import { createPresetApiInstance } from 'create-api-hook';

// REST API 配置
const restApi = createPresetApiInstance('rest', {
  baseURL: 'https://api.example.com',
});

// GraphQL 配置
const graphqlApi = createPresetApiInstance('graphql', {
  baseURL: 'https://graphql.example.com',
});

// 文件上传配置
const fileApi = createPresetApiInstance('file', {
  baseURL: 'https://upload.example.com',
});

// JSON API 配置
const jsonApi = createPresetApiInstance('json', {
  baseURL: 'https://json-api.example.com',
});

// 表单提交配置
const formApi = createPresetApiInstance('form', {
  baseURL: 'https://form.example.com',
});
```

## 📚 API 参考

### ApiInstance

主要的 API 实例类，提供所有核心功能。

#### 构造函数

```tsx
new ApiInstance(config?: ApiConfig)
```

#### 方法

- `request<T>(config: RequestConfig): Promise<ApiResponse<T>>`
- `clearCache(): void`
- `cancelAllRequests(): void`

#### 属性

- `interceptors` (只读): 拦截器管理对象
  - `interceptors.request`: 请求拦截器
  - `interceptors.response`: 响应拦截器

### 配置接口

#### ApiConfig

```tsx
interface ApiConfig {
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
    ttl?: number;
  };
  logger?: {
    enabled: boolean;
    level?: 'debug' | 'info' | 'warn' | 'error';
  };
}
```

#### RequestConfig

```tsx
interface RequestConfig {
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
```

### Hook 返回类型

#### ApiHookReturn

```tsx
interface ApiHookReturn<T> {
  loading: boolean;
  error: ApiError | null;
  data: T | null;
  execute: (...args: unknown[]) => Promise<T>;
  reset: () => void;
  cancel: () => void;
}
```

#### EnhancedApiHookReturn

```tsx
interface EnhancedApiHookReturn<T> {
  loading: boolean;
  error: any;
  data: T | null;
  status: RequestStatus;
  execute: (...args: unknown[]) => Promise<T>;
  reset: () => void;
  cancel: () => void;
  retry: () => Promise<T>;
}
```

### 工具函数

- `createApiHook<T>(config): () => ApiHookReturn<T>`
- `createBatchApiHook<T>(configs, apiConfig?): () => BatchApiHookReturn<T>`
- `createEnhancedApiHook<T>(config, apiConfig?): () => EnhancedApiHookReturn<T>`
- `createPresetApiInstance(preset, config?): ApiInstance`
- `batchRequests<T>(requests): Promise<T[]>`
- `sequentialRequests<T>(requests): Promise<T[]>`

## 🧪 测试

```bash
# 运行测试
npm test

# 监听模式
npm run test:watch

# 覆盖率报告
npm run test:coverage
```

## 📝 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 修复代码
npm run lint:fix
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## �� 许可证

MIT License 