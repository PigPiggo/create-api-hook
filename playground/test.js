// Node.js 环境下的测试文件
// 用于测试 dist 目录中编译后的文件

const path = require('path');

// 引入编译后的库文件
const { createApiHook } = require('../dist/index.js');
// 如果需要使用 ES 模块，可以使用以下方式：
// import { createApiHook } from '../dist/index.esm.js';

console.log('🚀 开始测试 API Hook 库...\n');

// 测试 1: 基本导入测试
console.log('📦 测试 1: 基本导入');
try {
    console.log('✅ createApiHook 函数已成功导入');
    console.log('   类型:', typeof createApiHook);
} catch (error) {
    console.log('❌ 导入失败:', error.message);
}

// 测试 2: 创建 API Hook
console.log('\n🔧 测试 2: 创建 API Hook');
try {
    // 创建一个简单的 API Hook 配置
    const apiConfig = {
        baseURL: 'https://jsonplaceholder.typicode.com',
        timeout: 5000,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    const apiHook = createApiHook(apiConfig);
    console.log('✅ API Hook 创建成功');
    console.log('   Hook 对象:', typeof apiHook);
    
    // 如果有方法，可以测试调用
    if (typeof apiHook === 'object' && apiHook !== null) {
        console.log('   Hook 方法:', Object.keys(apiHook));
    }
} catch (error) {
    console.log('❌ 创建 API Hook 失败:', error.message);
}

// 测试 3: 测试其他导出
console.log('\n🔍 测试 3: 检查其他导出');
try {
    // 尝试导入其他可能导出的内容
    const lib = require('../dist/index.js');
    console.log('✅ 库文件加载成功');
    console.log('   可用导出:', Object.keys(lib));
} catch (error) {
    console.log('❌ 加载库文件失败:', error.message);
}

console.log('\n🎉 测试完成！');
console.log('\n💡 提示:');
console.log('   - 如果测试失败，请确保已经运行了构建命令 (npm run build)');
console.log('   - 检查 dist 目录中是否有编译后的文件');
console.log('   - 可以在浏览器中打开 test.html 进行浏览器环境测试');
