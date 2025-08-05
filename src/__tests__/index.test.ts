import { 
  ApiInstance, 
  createApiInstance, 
  createApiHook, 
  createDebouncedApiHook,
  createThrottledApiHook,
  createBatchApiHook,
  createEnhancedApiHook,
  createPresetApiInstance,
  debounce,
  throttle,
  batchRequests,
  sequentialRequests,
  generateCacheKey,
  validateRequestConfig,
  RequestStatus
} from '../index';

// Mock fetch
global.fetch = jest.fn();

describe('ApiInstance', () => {
  let api: ApiInstance;

  beforeEach(() => {
    api = new ApiInstance();
    (fetch as jest.Mock).mockClear();
  });

  test('should create instance with default config', () => {
    expect(api).toBeInstanceOf(ApiInstance);
  });

  test('should create instance with custom config', () => {
    const customApi = new ApiInstance({
      baseURL: 'https://api.example.com',
      timeout: 5000,
    });
    expect(customApi).toBeInstanceOf(ApiInstance);
  });

  test('should execute GET request', async () => {
    const mockResponse = { data: { id: 1, name: 'John' } };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve(mockResponse),
      headers: new Map(),
    });

    const response = await api.get('/users');
    expect(response.data).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith('/users', expect.any(Object));
  });

  test('should execute POST request', async () => {
    const mockResponse = { data: { id: 1, name: 'John' } };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve(mockResponse),
      headers: new Map(),
    });

    const userData = { name: 'John', email: 'john@example.com' };
    const response = await api.post('/users', userData);
    expect(response.data).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith('/users', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(userData),
    }));
  });

  test('should handle request errors', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    await expect(api.get('/users')).rejects.toThrow('HTTP 404: Not Found');
  });

  test('should handle network errors', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    await expect(api.get('/users')).rejects.toThrow('Network error');
  });
});

describe('createApiInstance', () => {
  test('should create API instance with config', () => {
    const api = createApiInstance({
      baseURL: 'https://api.example.com',
      timeout: 5000,
    });
    expect(api).toBeInstanceOf(ApiInstance);
  });
});

describe('createApiHook', () => {
  test('should create API hook with static config', () => {
    const hook = createApiHook({
      url: '/users',
      method: 'GET',
    });
    expect(typeof hook).toBe('function');
  });

  test('should create API hook with dynamic config', () => {
    const hook = createApiHook((id: unknown) => ({
      url: `/users/${id}`,
      method: 'GET',
    }));
    expect(typeof hook).toBe('function');
  });
});

describe('createDebouncedApiHook', () => {
  test('should create debounced API hook', () => {
    const hook = createDebouncedApiHook({
      url: '/users',
      method: 'GET',
    }, 300);
    expect(typeof hook).toBe('function');
  });
});

describe('createThrottledApiHook', () => {
  test('should create throttled API hook', () => {
    const hook = createThrottledApiHook({
      url: '/users',
      method: 'GET',
    }, 1000);
    expect(typeof hook).toBe('function');
  });
});

describe('createBatchApiHook', () => {
  test('should create batch API hook', () => {
    const hook = createBatchApiHook([
      { url: '/users', method: 'GET' },
      { url: '/posts', method: 'GET' },
    ]);
    expect(typeof hook).toBe('function');
  });
});

describe('createEnhancedApiHook', () => {
  test('should create enhanced API hook', () => {
    const hook = createEnhancedApiHook({
      url: '/users',
      method: 'GET',
    });
    expect(typeof hook).toBe('function');
  });
});

describe('createPresetApiInstance', () => {
  test('should create REST preset instance', () => {
    const api = createPresetApiInstance('rest');
    expect(api).toBeInstanceOf(ApiInstance);
  });

  test('should create GraphQL preset instance', () => {
    const api = createPresetApiInstance('graphql');
    expect(api).toBeInstanceOf(ApiInstance);
  });

  test('should create file upload preset instance', () => {
    const api = createPresetApiInstance('file');
    expect(api).toBeInstanceOf(ApiInstance);
  });

  test('should create JSON preset instance', () => {
    const api = createPresetApiInstance('json');
    expect(api).toBeInstanceOf(ApiInstance);
  });

  test('should create form preset instance', () => {
    const api = createPresetApiInstance('form');
    expect(api).toBeInstanceOf(ApiInstance);
  });
});

describe('Utility Functions', () => {
  test('debounce should debounce function calls', (done) => {
    let callCount = 0;
    const debouncedFn = debounce(() => {
      callCount++;
    }, 100);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    setTimeout(() => {
      expect(callCount).toBe(1);
      done();
    }, 150);
  });

  test('throttle should throttle function calls', (done) => {
    let callCount = 0;
    const throttledFn = throttle(() => {
      callCount++;
    }, 100);

    throttledFn();
    throttledFn();
    throttledFn();

    setTimeout(() => {
      expect(callCount).toBe(1);
      done();
    }, 50);
  });

  test('batchRequests should execute requests in parallel', async () => {
    const requests = [
      () => Promise.resolve(1),
      () => Promise.resolve(2),
      () => Promise.resolve(3),
    ];

    const results = await batchRequests(requests);
    expect(results).toEqual([1, 2, 3]);
  });

  test('sequentialRequests should execute requests sequentially', async () => {
    const requests = [
      () => Promise.resolve(1),
      () => Promise.resolve(2),
      () => Promise.resolve(3),
    ];

    const results = await sequentialRequests(requests);
    expect(results).toEqual([1, 2, 3]);
  });

  test('generateCacheKey should generate consistent keys', () => {
    const key1 = generateCacheKey('/users', 'GET', { page: 1 }, null);
    const key2 = generateCacheKey('/users', 'GET', { page: 1 }, null);
    expect(key1).toBe(key2);
  });

  test('validateRequestConfig should validate config correctly', () => {
    const validConfig = { url: '/users', method: 'GET' as const };
    const errors = validateRequestConfig(validConfig);
    expect(errors).toHaveLength(0);

    const invalidConfig = { url: '', timeout: -1 };
    const invalidErrors = validateRequestConfig(invalidConfig);
    expect(invalidErrors.length).toBeGreaterThan(0);
  });
});

describe('RequestStatus', () => {
  test('should have correct enum values', () => {
    expect(RequestStatus.IDLE).toBe('idle');
    expect(RequestStatus.LOADING).toBe('loading');
    expect(RequestStatus.SUCCESS).toBe('success');
    expect(RequestStatus.ERROR).toBe('error');
  });
}); 