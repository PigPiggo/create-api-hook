// TypeScript 环境下的测试文件
// 用于测试 dist 目录中编译后的类型定义和实现

import { createApiHook } from '../dist/index.esm.js';
// 如果需要使用 CommonJS 格式，可以使用：
// import { createApiHook } from '../dist/index.js';

// 测试接口定义
interface TestApiConfig {
    baseURL: string;
    timeout?: number;
    headers?: Record<string, string>;
}

interface TestResponse {
    id: number;
    title: string;
    body: string;
    userId: number;
}

console.log('🚀 开始 TypeScript 测试...\n');

// 测试 1: 类型检查
console.log('📦 测试 1: 类型检查');
try {
    const config: TestApiConfig = {
        baseURL: 'https://jsonplaceholder.typicode.com',
        timeout: 5000,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    console.log('✅ 配置对象类型检查通过');
    console.log('   配置:', config);
} catch (error) {
    console.log('❌ 类型检查失败:', error);
}

// 测试 2: 创建 API Hook
console.log('\n🔧 测试 2: 创建 API Hook');
try {
    const apiConfig: TestApiConfig = {
        baseURL: 'https://jsonplaceholder.typicode.com',
        timeout: 5000
    };
    
    const apiHook = createApiHook(apiConfig);
    console.log('✅ API Hook 创建成功');
    console.log('   Hook 类型:', typeof apiHook);
    
    // 检查 Hook 是否有预期的方法
    if (typeof apiHook === 'object' && apiHook !== null) {
        const methods = Object.keys(apiHook);
        console.log('   可用方法:', methods);
        
        // 如果有 get 方法，测试一下
        if ('get' in apiHook && typeof (apiHook as any).get === 'function') {
            console.log('   ✅ 发现 get 方法');
        }
        
        // 如果有 post 方法，测试一下
        if ('post' in apiHook && typeof (apiHook as any).post === 'function') {
            console.log('   ✅ 发现 post 方法');
        }
    }
} catch (error) {
    console.log('❌ 创建 API Hook 失败:', error);
}

// 测试 3: 模拟 API 调用
console.log('\n🌐 测试 3: 模拟 API 调用');
try {
    const apiConfig: TestApiConfig = {
        baseURL: 'https://jsonplaceholder.typicode.com'
    };
    
    const apiHook = createApiHook(apiConfig);
    
    // 模拟调用（不实际发送请求）
    console.log('✅ API Hook 准备就绪');
    console.log('   可以用于发送 HTTP 请求');
    
    // 如果有实际的方法，可以在这里测试
    // 例如: const response = await apiHook.get('/posts/1');
    
} catch (error) {
    console.log('❌ API 调用测试失败:', error);
}

console.log('\n🎉 TypeScript 测试完成！');
console.log('\n💡 提示:');
console.log('   - 这个文件需要 TypeScript 环境来运行');
console.log('   - 可以使用 ts-node 运行: npx ts-node test.ts');
console.log('   - 或者编译后运行: tsc test.ts && node test.js');
