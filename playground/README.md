# Playground 测试目录

这个目录用于测试 `dist` 目录中编译后的 API Hook 库文件。

## 文件说明

### 1. `test.html`
- **用途**: 浏览器环境测试
- **使用方法**: 直接在浏览器中打开此文件
- **特点**: 
  - 提供可视化界面
  - 可以测试库在浏览器环境中的表现
  - 包含基本的交互测试

### 2. `test.js`
- **用途**: Node.js 环境测试
- **使用方法**: 
  ```bash
  node test.js
  ```
- **特点**:
  - 测试 CommonJS 格式的导入
  - 验证基本功能
  - 输出详细的测试结果

### 3. `test.ts`
- **用途**: TypeScript 环境测试
- **使用方法**:
  ```bash
  # 使用 ts-node 运行
  npx ts-node test.ts
  
  # 或者编译后运行
  tsc test.ts && node test.js
  ```
- **特点**:
  - 测试类型定义
  - 验证 TypeScript 兼容性
  - 包含类型检查测试

## 使用步骤

1. **确保已构建项目**:
   ```bash
   npm run build
   ```

2. **检查 dist 目录**:
   确保 `dist` 目录中有编译后的文件

3. **运行测试**:
   - 浏览器测试: 打开 `test.html`
   - Node.js 测试: 运行 `node test.js`
   - TypeScript 测试: 运行 `npx ts-node test.ts`

## 测试内容

- ✅ 基本导入测试
- ✅ 库文件加载验证
- ✅ API Hook 创建测试
- ✅ 类型定义检查（TypeScript）
- ✅ 方法可用性验证

## 注意事项

1. 确保在运行测试前已经构建了项目
2. 如果测试失败，检查 `dist` 目录中的文件是否存在
3. 根据实际的库 API 调整测试代码
4. 可以修改测试文件来测试特定的功能

## 扩展测试

你可以根据需要添加更多的测试文件：

- `integration-test.js` - 集成测试
- `performance-test.js` - 性能测试
- `error-handling-test.js` - 错误处理测试

## 故障排除

如果遇到问题：

1. 检查 `dist` 目录是否存在且包含文件
2. 确认构建过程没有错误
3. 验证导入路径是否正确
4. 检查 Node.js 版本兼容性
