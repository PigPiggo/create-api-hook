import { useEffect, useState } from 'react';
import { createApiHook } from '@dist';
import './App.css';

// 测试用的 API 配置
const apiConfig = {
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// 测试数据类型
interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

// 使用工厂函数创建 apiHook
const apiHook = createApiHook<{
  code: number;
  msg: string;
}>(apiConfig);

// 创建具体的 API Hooks
const useGetPosts = apiHook<unknown, Post[]>(() => ({
  url: '/posts',
  method: 'GET',
  params: {
    _limit: 5,
  },
}));

const useGetUsers = apiHook<unknown, User[]>(() => ({
  url: '/users',
  method: 'GET',
  params: {
    _limit: 3,
  },
}));

const useCreatePost = apiHook<{ title: string; body: string; userId: number }, Post>(() => ({
  url: '/posts',
  method: 'POST',
}));

function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [testResults, setTestResults] = useState<string[]>([]);

  // 使用 API Hooks
  const { execute: executeGetPosts, loading: loadingGetPosts } = useGetPosts();
  const { execute: executeGetUsers, loading: loadingGetUsers } = useGetUsers();
  const { execute: executeCreatePost, loading: loadingCreatePost } = useCreatePost();

  // 添加测试结果
  const addTestResult = (result: string) => {
    setTestResults(prev => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${result}`,
    ]);
  };

  // 测试获取帖子列表
  const testGetPosts = async () => {
    try {
      addTestResult('🔄 开始获取帖子列表...');
      const result = await executeGetPosts();
      setPosts(result || []);
      addTestResult(`✅ 成功获取 ${result?.length || 0} 个帖子`);
    } catch (err) {
      const errorMsg = `❌ 获取帖子失败: ${err}`;
      addTestResult(errorMsg);
    }
  };

  // 测试获取用户列表
  const testGetUsers = async () => {
    try {
      addTestResult('🔄 开始获取用户列表...');
      const result = await executeGetUsers();
      setUsers(result || []);
      addTestResult(`✅ 成功获取 ${result?.length || 0} 个用户`);
    } catch (err) {
      const errorMsg = `❌ 获取用户失败: ${err}`;
      addTestResult(errorMsg);
    }
  };

  // 测试创建新帖子
  const testCreatePost = async () => {
    try {
      addTestResult('🔄 开始创建新帖子...');

      const newPost = {
        title: '测试帖子',
        body: '这是一个测试帖子的内容',
        userId: 1,
      };

      const result = await executeCreatePost(newPost);
      addTestResult(`✅ 成功创建帖子，ID: ${result?.id}`);
    } catch (err) {
      const errorMsg = `❌ 创建帖子失败: ${err}`;
      addTestResult(errorMsg);
    }
  };

  // 清空测试结果
  const clearResults = () => {
    setTestResults([]);
    setPosts([]);
    setUsers([]);
  };

  useEffect (() => {
    executeGetPosts ();
  }, [executeGetPosts])

  return (
    <div className="app">
      <header className="app-header">
        <h1>🚀 API Hook 库测试</h1>
        <p>这是一个用于测试 API Hook 库的 React 应用</p>
      </header>

      <main className="app-main">
        <div className="control-panel">
          <h2>控制面板</h2>
          <div className="button-group">
            <button onClick={testGetPosts} disabled={loadingGetPosts}>
              {loadingGetPosts ? '⏳ 获取中...' : '测试获取帖子'}
            </button>
            <button onClick={testGetUsers} disabled={loadingGetUsers}>
              {loadingGetUsers ? '⏳ 获取中...' : '测试获取用户'}
            </button>
            <button onClick={testCreatePost} disabled={loadingCreatePost}>
              {loadingCreatePost ? '⏳ 创建中...' : '测试创建帖子'}
            </button>
            <button onClick={clearResults} className="clear-btn">
              清空结果
            </button>
          </div>
        </div>

        <div className="results-panel">
          <h2>测试结果</h2>
          <div className="test-results">
            {testResults.length === 0 ? (
              <p className="no-results">暂无测试结果</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="test-result">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="data-display">
          {posts.length > 0 && (
            <div className="data-section">
              <h3>📝 帖子数据</h3>
              <div className="data-list">
                {posts.map(post => (
                  <div key={post.id} className="data-item">
                    <h4>{post.title}</h4>
                    <p>{post.body}</p>
                    <small>用户ID: {post.userId}</small>
                  </div>
                ))}
              </div>
            </div>
          )}

          {users.length > 0 && (
            <div className="data-section">
              <h3>👥 用户数据</h3>
              <div className="data-list">
                {users.map(user => (
                  <div key={user.id} className="data-item">
                    <h4>{user.name}</h4>
                    <p>@{user.username}</p>
                    <p>{user.email}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
