# create-api-hook

一个功能强大的基于 React Hooks 的 API 请求库，提供简洁的 API 调用接口、拦截器、缓存、重试、防抖等功能。

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
- ⚡ **防抖功能** - 内置防抖机制，避免重复请求
- 🚫 **请求取消** - 支持 AbortController，可取消进行中的请求
- 📁 **文件上传** - 支持 FormData 文件上传

## 📦 安装

```bash
npm install create-api-hook
# 或
yarn add create-api-hook
# 或
pnpm add create-api-hook
```

### 环境要求

- React >= 16.8.0 (需要 Hooks 支持)
- TypeScript >= 4.9.0 (可选，但推荐)

## 🚀 快速开始

### 基础用法

```tsx
import React, { useEffect } from 'react';
import { createApiHook } from 'create-api-hook';

// 创建 API Hook 工厂函数
const apiHook = createApiHook({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 创建具体的 API Hook
const useGetPosts = apiHook<unknown, Post[]>(() => ({
  url: '/posts',
  method: 'GET',
  params: {
    _limit: 10,
  },
}));

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

function PostList() {
  const { loading, error, data, execute } = useGetPosts();

  useEffect(() => {
    execute();
  }, [execute]);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;
  
  return (
    <div>
      <h1>文章列表</h1>
      {data?.map(post => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.body}</p>
        </div>
      ))}
    </div>
  );
}
```

### 带参数的请求

```tsx
// 创建带参数的 API Hook
const useGetPostById = apiHook<string, Post>((id: string) => ({
  url: `/posts/${id}`,
  method: 'GET',
}));

function PostDetail({ postId }: { postId: string }) {
  const { loading, error, data, execute } = useGetPostById();

  useEffect(() => {
    if (postId) {
      execute(postId);
    }
  }, [postId, execute]);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;
  if (!data) return <div>未找到文章</div>;
  
  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.body}</p>
      <small>用户ID: {data.userId}</small>
    </div>
  );
}
```

### POST 请求

```tsx
// 创建 POST 请求的 API Hook
const useCreatePost = apiHook<CreatePostData, Post>(() => ({
  url: '/posts',
  method: 'POST',
}));

interface CreatePostData {
  title: string;
  body: string;
  userId: number;
}

function CreatePostForm() {
  const { loading, error, data, execute } = useCreatePost();
  const [formData, setFormData] = useState<CreatePostData>({
    title: '',
    body: '',
    userId: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await execute(formData);
      console.log('文章创建成功:', result);
      // 重置表单
      setFormData({ title: '', body: '', userId: 1 });
    } catch (error) {
      console.error('创建失败:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="标题"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />
      <textarea
        placeholder="内容"
        value={formData.body}
        onChange={(e) => setFormData({ ...formData, body: e.target.value })}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? '创建中...' : '创建文章'}
      </button>
      {error && <div>错误: {error.message}</div>}
      {data && <div>创建成功！文章ID: {data.id}</div>}
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
  debounce: true, // 开启防抖
});

// 使用自定义实例创建 Hook
const apiHook = createApiHook(customApi);
const useCustomApi = apiHook({
  url: '/api/data',
  method: 'GET',
});
```

### 拦截器

```tsx
// 请求拦截器 - 添加认证头
const requestInterceptorId = customApi.interceptors.request.use(
  (config) => {
    // 在发送请求之前添加认证信息
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }
    console.log('发送请求:', config);
    return config;
  },
  (error) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理通用错误
const responseInterceptorId = customApi.interceptors.response.use(
  (response) => {
    // 对响应数据做处理
    console.log('收到响应:', response);
    return response;
  },
  (error) => {
    // 处理通用错误，如 401 未授权
    if (error.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    console.error('响应拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 移除拦截器
// customApi.interceptors.request.eject(requestInterceptorId);
// customApi.interceptors.response.eject(responseInterceptorId);
```



### 批量请求

```tsx
import { createBatchApiHook } from 'create-api-hook/utils';

const useBatchRequests = createBatchApiHook([
  { url: '/users', method: 'GET' },
  { url: '/posts', method: 'GET' },
  { url: '/comments', method: 'GET' },
], {
  baseURL: 'https://jsonplaceholder.typicode.com',
});

function Dashboard() {
  const { loading, error, data, executeBatch, executeSequential } = useBatchRequests();

  const handleLoadAll = async () => {
    try {
      // 并行执行所有请求
      const [users, posts, comments] = await executeBatch();
      console.log('所有数据:', { users, posts, comments });
    } catch (error) {
      console.error('批量请求失败:', error);
    }
  };

  const handleLoadSequential = async () => {
    try {
      // 顺序执行所有请求
      const [users, posts, comments] = await executeSequential();
      console.log('顺序加载完成:', { users, posts, comments });
    } catch (error) {
      console.error('顺序请求失败:', error);
    }
  };

  return (
    <div>
      <button onClick={handleLoadAll} disabled={loading}>
        {loading ? '加载中...' : '并行加载'}
      </button>
      <button onClick={handleLoadSequential} disabled={loading}>
        {loading ? '加载中...' : '顺序加载'}
      </button>
      {error && <div>错误: {error.message}</div>}
    </div>
  );
}
```

### 增强 Hook

```tsx
import { createEnhancedApiHook, RequestStatus } from 'create-api-hook/utils';

const useEnhancedPosts = createEnhancedApiHook({
  url: '/posts',
  method: 'GET',
}, {
  baseURL: 'https://jsonplaceholder.typicode.com',
});

function EnhancedPostComponent() {
  const { loading, error, data, status, execute, retry } = useEnhancedPosts();

  useEffect(() => {
    execute();
  }, [execute]);

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
          <h1>文章数据</h1>
          {data?.map((post: any) => (
            <div key={post.id}>
              <h3>{post.title}</h3>
              <p>{post.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 预设配置

```tsx
import { createPresetApiInstance } from 'create-api-hook/utils';

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

// 使用预设配置创建 Hook
const restApiHook = createApiHook(restApi);
const useRestData = restApiHook({
  url: '/data',
  method: 'GET',
});
```

## 📚 API 参考

### createApiHook

主要的 Hook 工厂函数，用于创建 API Hook。

#### 函数签名

```tsx
function createApiHook<TBaseResponse = unknown>(config: ApiConfig): ApiHookFactory
```

#### 返回的工厂函数

```tsx
// 静态配置
function apiHook<TResponse>(requestConfig: RequestConfig): () => ApiHookReturn<TResponse>

// 动态配置
function apiHook<TRequest, TResponse>(requestConfig: (data: TRequest) => RequestConfig): () => ApiHookReturn<TResponse, TRequest>
```

### ApiInstance

主要的 API 实例类，提供所有核心功能。

#### 构造函数

```tsx
new ApiInstance(config?: ApiConfig)
```

#### 方法

- `request<T>(config: RequestConfig): Promise<ApiResponse<T>>` - 执行请求
- `clearCache(): void` - 清除缓存
- `cancelAllRequests(): void` - 取消所有请求

#### 属性

- `interceptors`: 拦截器管理对象
  - `interceptors.request`: 请求拦截器
  - `interceptors.response`: 响应拦截器

### 配置接口

#### ApiConfig

```tsx
interface ApiConfig {
  baseURL?: string;                    // 基础 URL
  timeout?: number;                    // 请求超时时间（毫秒）
  headers?: Record<string, string>;    // 默认请求头
  withCredentials?: boolean;           // 是否携带凭证
  debounce?: boolean;                  // 是否开启防抖（默认 true）
  retry?: {                           // 重试配置
    count: number;                    // 重试次数
    delay: number;                    // 重试延迟（毫秒）
    backoff?: 'linear' | 'exponential'; // 退避策略
  };
  cache?: {                           // 缓存配置
    enabled: boolean;                 // 是否启用缓存
    ttl?: number;                     // 缓存时间（毫秒）
  };
  logger?: {                          // 日志配置
    enabled: boolean;                 // 是否启用日志
    level?: 'debug' | 'info' | 'warn' | 'error'; // 日志级别
  };
}
```

#### RequestConfig

```tsx
interface RequestConfig {
  url: string;                         // 请求 URL
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'; // 请求方法
  data?: any;                          // 请求体数据
  params?: Record<string, any>;        // URL 查询参数
  headers?: Record<string, string>;    // 请求头
  timeout?: number;                    // 请求超时时间
  retry?: {                           // 重试配置（覆盖全局配置）
    count: number;
    delay: number;
    backoff?: 'linear' | 'exponential';
  };
  cache?: {                           // 缓存配置（覆盖全局配置）
    enabled: boolean;
    ttl?: number;
  };
  signal?: AbortSignal;               // 取消信号
  onProgress?: (progress: number) => void; // 进度回调
}
```

### Hook 返回类型

#### ApiHookReturn

```tsx
interface ApiHookReturn<TResponse, TRequest = unknown> {
  loading: boolean;                    // 是否正在加载
  error: ApiError | null;              // 错误信息
  data: TResponse | null;              // 响应数据
  execute: (requestData?: TRequest) => Promise<TResponse>; // 执行请求
  reset: () => void;                   // 重置状态
  cancel: () => void;                  // 取消请求
}
```

#### EnhancedApiHookReturn

```tsx
interface EnhancedApiHookReturn<T> {
  loading: boolean;                    // 是否正在加载
  error: any;                          // 错误信息
  data: T | null;                      // 响应数据
  status: RequestStatus;               // 请求状态
  execute: (...args: unknown[]) => Promise<T>; // 执行请求
  reset: () => void;                   // 重置状态
  cancel: () => void;                  // 取消请求
  retry: () => Promise<T>;             // 重试请求
}
```

#### BatchApiHookReturn

```tsx
interface BatchApiHookReturn<T> {
  hooks: ApiHookReturn<T>[];           // 各个请求的 Hook
  executeBatch: (...args: unknown[]) => Promise<T[]>; // 并行执行
  executeSequential: (...args: unknown[]) => Promise<T[]>; // 顺序执行
  loading: boolean;                    // 是否有请求正在加载
  error: any;                          // 错误信息
  data: (T | null)[];                  // 响应数据数组
  reset: () => void;                   // 重置所有状态
  cancel: () => void;                  // 取消所有请求
}
```

### 工具函数

#### 核心函数

- `createApiHook<TBaseResponse>(config: ApiConfig): ApiHookFactory` - 创建 API Hook 工厂函数
- `createBatchApiHook<T>(configs, apiConfig?): () => BatchApiHookReturn<T>` - 创建批量请求 Hook
- `createEnhancedApiHook<T>(config, apiConfig?): () => EnhancedApiHookReturn<T>` - 创建增强 Hook
- `createPresetApiInstance(preset, config?): ApiInstance` - 创建预设配置的 API 实例

#### 工具函数

- `batchRequests<T>(requests): Promise<T[]>` - 并行执行请求
- `sequentialRequests<T>(requests): Promise<T[]>` - 顺序执行请求

#### 枚举

- `RequestStatus` - 请求状态枚举
  - `IDLE` - 空闲状态
  - `LOADING` - 加载中
  - `SUCCESS` - 成功
  - `ERROR` - 错误

## 💡 实际使用示例

### 文件上传

```tsx
import { createApiHook } from 'create-api-hook';

const apiHook = createApiHook({
  baseURL: 'https://api.example.com',
});

const useFileUpload = apiHook<FormData, { url: string }>(() => ({
  url: '/upload',
  method: 'POST',
}));

function FileUpload() {
  const { loading, error, data, execute } = useFileUpload();

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const result = await execute(formData);
      console.log('文件上传成功:', result.url);
    } catch (error) {
      console.error('上传失败:', error);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
        disabled={loading}
      />
      {loading && <div>上传中...</div>}
      {error && <div>上传失败: {error.message}</div>}
      {data && <div>上传成功: {data.url}</div>}
    </div>
  );
}
```

### 带缓存的请求

```tsx
const apiHook = createApiHook({
  baseURL: 'https://jsonplaceholder.typicode.com',
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5分钟缓存
  },
});

const useCachedPosts = apiHook(() => ({
  url: '/posts',
  method: 'GET',
  cache: {
    enabled: true,
    ttl: 10 * 60 * 1000, // 10分钟缓存
  },
}));
```

### 带重试的请求

```tsx
const apiHook = createApiHook({
  baseURL: 'https://api.example.com',
  retry: {
    count: 3,
    delay: 1000,
    backoff: 'exponential',
  },
});

const useRetryRequest = apiHook(() => ({
  url: '/unstable-endpoint',
  method: 'GET',
  retry: {
    count: 5, // 覆盖全局配置
    delay: 2000,
    backoff: 'linear',
  },
}));
```

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

### 环境要求

- Node.js >= 20
- pnpm (推荐) 或 npm

### 开发命令

```bash
# 安装依赖
pnpm install

# 开发模式（监听文件变化）
pnpm run dev

# 构建项目
pnpm run build

# 类型检查
pnpm run type-check

# 代码检查
pnpm run lint

# 修复代码格式
pnpm run lint:fix

# 清理构建文件
pnpm run clean

# 发布前准备（构建 + 测试）
pnpm run prepublishOnly
```

### 项目结构

```
src/
├── ApiInstance.ts          # API 实例类
├── createApiHook.ts        # 核心 Hook 工厂函数
├── Logger.ts              # 日志系统
├── index.ts               # 主入口文件
└── utils/                 # 工具函数
    ├── hooks.ts           # 增强 Hook 和批量请求
    ├── presets.ts         # 预设配置
    ├── request.ts         # 请求工具函数
    └── index.ts           # 工具函数入口
```

### Playground

项目包含一个 playground 目录，用于测试和演示功能：

```bash
cd playground
pnpm install
pnpm run dev
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 贡献指南

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

### 开发规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 规则
- 为新功能添加测试
- 更新相关文档

## �� 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关链接

- [GitHub 仓库](https://github.com/PigPiggo/create-api-hook)
- [问题反馈](https://github.com/PigPiggo/create-api-hook/issues)
- [NPM 包](https://www.npmjs.com/package/create-api-hook) 