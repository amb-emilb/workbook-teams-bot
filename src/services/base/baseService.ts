import https from 'https';
import { WorkbookConfig, ServiceResponse } from '../../types/workbook.types.js';

export abstract class BaseService {
  protected config: WorkbookConfig;

  constructor(config: WorkbookConfig) {
    this.config = {
      timeout: 30000, // 30 second default timeout
      ...config
    };
  }

  /**
   * Generic HTTP request method with error handling and type safety
   */
  protected async request<T = unknown>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
    body?: unknown
  ): Promise<ServiceResponse<T>> {
    return new Promise((resolve) => {
      const requestBody = body ? JSON.stringify(body) : '';
      
      const headers: Record<string, string | number> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Length': Buffer.byteLength(requestBody)
      };

      // Add method override for GET requests (Workbook API requirement)
      if (method === 'GET') {
        headers['X-HTTP-METHOD-OVERRIDE'] = 'GET';
      }

      const options: https.RequestOptions = {
        hostname: this.config.baseUrl,
        path: `/api/json/reply/${endpoint}`,
        method: method === 'GET' ? 'POST' : method, // Use POST with override for GET, but real PATCH for PATCH
        headers,
        timeout: this.config.timeout
      };

      const req = https.request(options, (res) => {
        const chunks: Buffer[] = [];
        
        res.on('data', (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        
        res.on('end', () => {
          try {
            // Properly decode UTF-8 data from chunks
            const data = Buffer.concat(chunks).toString('utf8');
            
            // Handle successful responses
            if (res.statusCode === 200) {
              const parsedData = data ? JSON.parse(data) : undefined;
              resolve({
                success: true,
                data: parsedData as T,
                cached: false
              });
              return;
            }

            // Handle specific error cases
            if (res.statusCode === 204) {
              resolve({
                success: true,
                data: undefined as T,
                cached: false
              });
              return;
            }

            if (res.statusCode === 500 && data.includes('do not have access')) {
              resolve({
                success: false,
                error: 'Access denied to this endpoint'
              });
              return;
            }

            // Handle other error status codes
            const errorMessage = data ? data.slice(0, 200) : `HTTP ${res.statusCode}`;
            resolve({
              success: false,
              error: `API Error ${res.statusCode}: ${errorMessage}`
            });

          } catch (parseError) {
            resolve({
              success: false,
              error: `Failed to parse response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
            });
          }
        });
      });
      
      req.on('error', (error) => {
        resolve({
          success: false,
          error: `Network error: ${error.message}`
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          success: false,
          error: 'Request timeout'
        });
      });
      
      req.write(requestBody);
      req.end();
    });
  }

  /**
   * Helper method for GET requests (with POST override)
   */
  protected async get<T = unknown>(endpoint: string, params?: unknown): Promise<ServiceResponse<T>> {
    return this.request<T>(endpoint, 'GET', params);
  }

  /**
   * Helper method for pure GET requests with query parameters (no POST override)
   */
  protected async pureGet<T = unknown>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<ServiceResponse<T>> {
    return new Promise((resolve) => {
      // Build query string from parameters
      let queryString = '';
      if (params) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          queryParams.append(key, String(value));
        });
        queryString = queryParams.toString();
      }

      const path = `/api/json/reply/${endpoint}${queryString ? `?${queryString}` : ''}`;
      
      const options: https.RequestOptions = {
        hostname: this.config.baseUrl,
        path: path,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: this.config.timeout
      };

      const req = https.request(options, (res) => {
        const chunks: Buffer[] = [];
        
        res.on('data', (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        
        res.on('end', () => {
          try {
            // Properly decode UTF-8 data from chunks
            const data = Buffer.concat(chunks).toString('utf8');
            
            if (res.statusCode === 200) {
              const parsedData = data ? JSON.parse(data) : undefined;
              resolve({
                success: true,
                data: parsedData as T,
                cached: false
              });
              return;
            }

            if (res.statusCode === 204) {
              resolve({
                success: true,
                data: undefined as T,
                cached: false
              });
              return;
            }

            const errorMessage = data ? data.slice(0, 200) : `HTTP ${res.statusCode}`;
            resolve({
              success: false,
              error: `API Error ${res.statusCode}: ${errorMessage}`
            });

          } catch (parseError) {
            resolve({
              success: false,
              error: `Failed to parse response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
            });
          }
        });
      });
      
      req.on('error', (error) => {
        resolve({
          success: false,
          error: `Network error: ${error.message}`
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          success: false,
          error: 'Request timeout'
        });
      });
      
      req.end();
    });
  }

  /**
   * Helper method for POST requests
   */
  protected async post<T = unknown>(endpoint: string, body?: unknown): Promise<ServiceResponse<T>> {
    return this.request<T>(endpoint, 'POST', body);
  }

  /**
   * Helper method for PATCH requests (which Workbook implements as PATCH with Patch parameter)
   */
  protected async patch<T = unknown>(endpoint: string, patchData: unknown): Promise<ServiceResponse<T>> {
    return this.request<T>(endpoint, 'PATCH', { Patch: patchData });
  }

  /**
   * Helper method for batch operations (endpoints with [] suffix)
   * Workbook API often expects arrays for batch operations
   */
  protected async getBatch<T = unknown>(endpoint: string, params: unknown[]): Promise<ServiceResponse<T[]>> {
    return this.request<T[]>(`${endpoint}[]`, 'GET', params);
  }

  /**
   * Helper method for single item batch operation
   * Many Workbook endpoints expect [{Id: x}] instead of {Id: x}
   */
  protected async getBatchById<T = unknown>(endpoint: string, id: number): Promise<ServiceResponse<T>> {
    const response = await this.getBatch<T>(endpoint, [{ Id: id }]);
    
    if (response.success && response.data && response.data.length > 0) {
      return {
        success: true,
        data: response.data[0],
        cached: response.cached
      };
    }
    
    return {
      success: false,
      error: 'Resource not found or empty response'
    };
  }

  /**
   * Log API calls in development mode
   */
  protected logApiCall(endpoint: string, method: string, cached: boolean = false): void {
    if (process.env.NODE_ENV === 'dev') {
      const cacheStatus = cached ? '💾 CACHED' : '🌐 API CALL';
      console.log(`${cacheStatus}: ${method} ${endpoint}`);
    }
  }

  /**
   * Generate cache key for consistent caching
   */
  protected generateCacheKey(prefix: string, params?: unknown): string {
    if (!params) {
      return prefix;
    }
    
    // Sort object keys for consistent cache keys
    const sortedParams = Object.keys(params as Record<string, unknown>)
      .sort()
      .reduce((result, key) => {
        result[key] = (params as Record<string, unknown>)[key];
        return result;
      }, {} as Record<string, unknown>);
    
    const paramString = JSON.stringify(sortedParams);
    return `${prefix}:${Buffer.from(paramString).toString('base64')}`;
  }
}