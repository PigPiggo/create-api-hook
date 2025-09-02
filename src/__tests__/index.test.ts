import {
  ApiInstance,
  createApiHook
} from '../index';
import {
  createBatchApiHook,
  createEnhancedApiHook,
  createPresetApiInstance,
  batchRequests,
  sequentialRequests,
  RequestStatus
} from '../utils';

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

    const response = await api.request({ url: '/users', method: 'GET' });
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
    const response = await api.request({ url: '/users', method: 'POST', data: userData });
    expect(response.data).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith('/users', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(userData),
    }));
  });

  test.skip('should handle request errors', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.reject(new Error('Response not ok')),
      headers: new Map(),
    });

    try {
      await api.request({ url: '/users', method: 'GET' });
      fail('Expected request to throw an error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain('HTTP 404');
    }
  });

  test.skip('should handle network errors', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    try {
      await api.request({ url: '/users', method: 'GET' });
      fail('Expected request to throw an error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Network error');
    }
  });
});



describe('createApiHook', () => {
  test('should create API hook with static config', () => {
    const hook = createApiHook({})({
      url: '/users',
      method: 'GET',
    });
    expect(typeof hook).toBe('function');
  });

  test('should create API hook with dynamic config', () => {
    const hook = createApiHook({})((id: unknown) => ({
      url: `/users/${id}`,
      method: 'GET',
    }));
    expect(typeof hook).toBe('function');
  });
});



describe('createBatchApiHook', () => {
  test('should create batch API hook', () => {
    const hook = createBatchApiHook([
      { url: '/users', method: 'GET' },
      { url: '/posts', method: 'GET' },
    ], {});
    expect(typeof hook).toBe('function');
  });
});

describe('createEnhancedApiHook', () => {
  test('should create enhanced API hook', () => {
    const hook = createEnhancedApiHook({
      url: '/users',
      method: 'GET',
    }, {});
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
});

describe('RequestStatus', () => {
  test('should have correct enum values', () => {
    expect(RequestStatus.IDLE).toBe('idle');
    expect(RequestStatus.LOADING).toBe('loading');
    expect(RequestStatus.SUCCESS).toBe('success');
    expect(RequestStatus.ERROR).toBe('error');
  });
}); 