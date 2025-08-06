import { ApiInstance, ApiConfig } from '../ApiInstance';

// 创建预设配置的 API 实例
export function createPresetApiInstance(preset: 'rest' | 'graphql' | 'file' | 'json' | 'form', config?: Partial<ApiConfig>): ApiInstance {
  const baseConfig: ApiConfig = {
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
    logger: {
      enabled: true,
      level: 'info',
    },
    ...config,
  };
  
  switch (preset) {
    case 'rest':
      return new ApiInstance({
        ...baseConfig,
        headers: {
          ...baseConfig.headers,
          'Accept': 'application/json',
        },
      });
    
    case 'graphql':
      return new ApiInstance({
        ...baseConfig,
        headers: {
          ...baseConfig.headers,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
    
    case 'file':
      return new ApiInstance({
        ...baseConfig,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    
    case 'json':
      return new ApiInstance({
        ...baseConfig,
        headers: {
          ...baseConfig.headers,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
    
    case 'form':
      return new ApiInstance({
        ...baseConfig,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
    
    default:
      return new ApiInstance(baseConfig);
  }
} 