# API Hook 库 React 测试应用

这是一个完整的 React 应用，用于测试 `dist` 目录中编译后的 API Hook 库文件。展示了如何使用 `createApiHook` 工厂函数创建具体的 API Hooks，并在 React 组件中使用。

## 🚀 项目特性

- **完整的 React 应用**: 使用 Vite + React + TypeScript
- **API Hook 模式演示**: 展示正确的 API Hook 使用方式
- **类型安全**: 完整的 TypeScript 类型支持
- **实时测试界面**: 提供直观的测试操作和数据展示
- **响应式设计**: 支持移动端和桌面端

## 📁 项目结构

```
playground/
├── index.html              # HTML 入口文件
├── package.json            # 项目依赖配置
├── tsconfig.json           # TypeScript 配置
├── tsconfig.node.json      # Node.js TypeScript 配置
├── vite.config.ts          # Vite 构建配置
├── .eslintrc.cjs           # ESLint 配置
├── src/
│   ├── main.tsx            # React 应用入口
│   ├── App.tsx             # 主应用组件
│   ├── App.css             # 应用样式
│   └── index.css           # 全局样式
└── README.md               # 项目说明
```

## 🛠️ 安装和运行

### 1. 安装依赖

```bash
cd playground
npm install
```

### 2. 确保主项目已构建

```bash
# 在项目根目录运行
npm run build
```

### 3. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动，并自动打开浏览器。

### 4. 代码示例

完整的 API Hook 使用示例：

```typescript
import { createApiHook } from '@dist';

// 1. 创建 API Hook 工厂
const apiHook = createApiHook<{
  code: number;
  msg: string;
}>({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. 定义具体的 API Hooks
const useGetPosts = apiHook<unknown, Post[]>(() => ({
  url: '/posts',
  method: 'GET',
  params: { _limit: 5 }
}));

// 3. 在组件中使用
function MyComponent() {
  const { execute, loading, data, error } = useGetPosts();
  
  const handleGetPosts = async () => {
    try {
      const result = await execute();
      console.log('Posts:', result);
    } catch (err) {
      console.error('Error:', err);
    }
  };
  
  return (
    <div>
      <button onClick={handleGetPosts} disabled={loading}>
        {loading ? 'Loading...' : 'Get Posts'}
      </button>
      {data && <div>{/* 渲染数据 */}</div>}
    </div>
  );
}
```

### 5. 构建生产版本

```bash
npm run build
```

### 5. 预览生产版本

```bash
npm run preview
```

## 🧪 测试功能

### API Hook 使用模式演示

1. **工厂函数创建**
   ```typescript
   const apiHook = createApiHook<{
     code: number;
     msg: string;
   }>(apiConfig);
   ```

2. **具体 Hook 定义**
   ```typescript
   const useGetPosts = apiHook<unknown, Post[]>(() => ({
     url: '/posts',
     method: 'GET',
     params: { _limit: 5 }
   }));
   ```

3. **在组件中使用**
   ```typescript
   const { execute: executeGetPosts, loading: loadingGetPosts } = useGetPosts();
   ```

### 测试场景

- **GET 请求**: 获取帖子列表和用户列表
- **POST 请求**: 创建新帖子
- **加载状态**: 显示请求进行中的状态
- **错误处理**: 捕获和显示请求错误
- **数据展示**: 可视化显示 API 返回的数据

### 测试界面功能

- **控制面板**: 提供各种测试按钮，显示加载状态
- **实时结果**: 显示测试过程和结果日志
- **数据展示**: 可视化显示 API 返回的数据
- **自动加载**: 页面加载时自动获取帖子数据

## 🔧 配置说明

### TypeScript 配置

- 使用 `@dist` 路径别名指向 `../dist/index.esm.js`
- 支持 ES2020 和 React JSX
- 启用严格类型检查

### Vite 配置

- 配置路径别名 `@dist` 指向 `../dist`
- 开发服务器端口 3000
- 自动打开浏览器

### 依赖说明

- **React 18**: 最新的 React 版本
- **TypeScript**: 完整的类型支持
- **Vite**: 快速的构建工具
- **ESLint**: 代码质量检查

## 📝 使用说明

1. **启动应用**: 运行 `npm run dev`
2. **自动加载**: 页面加载时自动获取帖子数据
3. **测试功能**: 使用各种测试按钮验证库的功能
   - 测试获取帖子：获取帖子列表数据
   - 测试获取用户：获取用户列表数据
   - 测试创建帖子：创建新的帖子
4. **查看结果**: 在测试结果面板查看详细输出
5. **查看数据**: 在数据展示区域查看 API 返回的数据

## 🎯 测试场景

### API Hook 模式测试
- ✅ 工厂函数创建 API Hook
- ✅ 具体 Hook 定义和类型安全
- ✅ Hook 在组件中的使用
- ✅ 加载状态管理

### HTTP 请求测试
- ✅ GET 请求（获取帖子和用户数据）
- ✅ POST 请求（创建新帖子）
- ✅ 错误处理和异常捕获
- ✅ 响应数据处理和展示

### 类型安全测试
- ✅ TypeScript 类型检查
- ✅ 接口定义验证
- ✅ 编译时错误检测
- ✅ 泛型类型支持

## 🐛 故障排除

### 常见问题

1. **导入错误**
   - 确保主项目已构建 (`npm run build`)
   - 检查 `dist` 目录是否存在
   - 验证路径别名配置

2. **类型错误**
   - 检查 TypeScript 配置
   - 确保 `.d.ts` 文件存在
   - 验证接口定义

3. **运行时错误**
   - 检查浏览器控制台
   - 验证 API 配置
   - 确认网络连接

### 调试技巧

- 使用浏览器开发者工具
- 查看控制台输出
- 检查网络请求
- 验证响应数据格式

## 🔄 自定义测试

你可以根据需要修改 `src/App.tsx` 来：

### 添加新的 API Hook
```typescript
const useNewApi = apiHook<RequestType, ResponseType>(() => ({
  url: '/your-endpoint',
  method: 'GET',
  params: { /* your params */ }
}));
```

### 在组件中使用
```typescript
const { execute, loading, data, error } = useNewApi();
```

### 自定义功能
- 添加新的测试场景和按钮
- 修改 API 配置和端点
- 自定义测试数据和类型定义
- 扩展错误处理和加载状态显示

## 📚 相关文档

- [React 官方文档](https://react.dev/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [API Hook 库文档](../README.md)
