import NodeCache from 'node-cache';
import { WorkbookConfig } from '../types/workbook.types.js';
import { ResourceService } from './domains/resourceService.js';
import { cacheManager } from './base/cache.js';
import { keyVaultService } from './keyVault.js';

/**
 * Main Workbook API Client - Facade pattern for all services
 * Note: "Contacts" removed - use "Resources" for all people data
 */
export class WorkbookClient {
  public readonly resources: ResourceService;

  private config: WorkbookConfig;

  constructor(config: WorkbookConfig) {
    this.config = config;
    
    // Initialize domain services
    this.resources = new ResourceService(config);
  }

  /**
   * Create WorkbookClient from environment variables (legacy)
   */
  static fromEnvironment(): WorkbookClient {
    const NODE_ENV = process.env.NODE_ENV || 'prod';
    const isDev = NODE_ENV === 'dev';

    // Get environment-specific configuration
    const apiKey = isDev ? process.env.WORKBOOK_API_KEY_DEV : process.env.WORKBOOK_API_KEY_PROD;
    const baseUrl = isDev ? process.env.WORKBOOK_BASE_URL_DEV : process.env.WORKBOOK_BASE_URL_PROD;
    const username = isDev ? process.env.WORKBOOK_USERNAME_DEV : process.env.WORKBOOK_USERNAME_PROD;
    const password = isDev ? process.env.WORKBOOK_PASSWORD_DEV : process.env.WORKBOOK_PASSWORD_PROD;

    if (!apiKey || !baseUrl) {
      throw new Error(`Missing required environment variables for ${NODE_ENV} environment`);
    }

    const config: WorkbookConfig = {
      apiKey,
      baseUrl,
      username,
      password,
      timeout: 30000
    };

    console.log(`🌍 Workbook Client initialized for ${NODE_ENV.toUpperCase()} environment`);
    
    return new WorkbookClient(config);
  }

  /**
   * Create WorkbookClient from Azure Key Vault (production)
   */
  static async fromKeyVault(): Promise<WorkbookClient> {
    const NODE_ENV = process.env.NODE_ENV || 'prod';
    const isDev = NODE_ENV === 'dev';

    console.log(`🔐 Loading Workbook configuration from Key Vault for ${NODE_ENV.toUpperCase()} environment`);

    try {
      // Get secrets from Key Vault based on environment
      const apiKeySecret = isDev ? 'workbook-api-key-dev' : 'workbook-api-key-prod';
      const passwordSecret = isDev ? 'workbook-password-dev' : 'workbook-password-prod';
      
      const secrets = await keyVaultService.getSecrets([
        apiKeySecret,
        passwordSecret
      ]);

      // Base URLs are not secrets, keep them as env vars or constants
      const baseUrl = isDev ? 'ambitiondemo.workbook.net' : 'ambition.workbook.net';
      const username = isDev ? 'tg' : 'eob';

      const config: WorkbookConfig = {
        apiKey: secrets[apiKeySecret],
        baseUrl,
        username,
        password: secrets[passwordSecret],
        timeout: 30000
      };

      console.log(`✅ Workbook Client initialized from Key Vault for ${NODE_ENV.toUpperCase()} environment`);
      
      return new WorkbookClient(config);
    } catch (error) {
      console.error('❌ Failed to initialize Workbook Client from Key Vault:', error);
      throw new Error(`Failed to initialize Workbook Client from Key Vault: ${error}`);
    }
  }

  /**
   * Get cache statistics from all services
   */
  getCacheStats() {
    return {
      nodeCache: cacheManager.getStats(),
      keys: cacheManager.getKeys(),
      environment: process.env.NODE_ENV || 'prod'
    };
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    cacheManager.flush();
    console.log('🧹 All caches cleared');
  }

  /**
   * Health check - test API connectivity
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    services: {
      resources: boolean;
    };
    cache: {
      keys: number;
      stats: NodeCache.Stats;
    };
    config: {
      environment: string;
      baseUrl: string;
    };
  }> {
    const results: {
      status: 'healthy' | 'unhealthy';
      services: { resources: boolean; };
      cache: { keys: number; stats: NodeCache.Stats; };
      config: { environment: string; baseUrl: string; };
    } = {
      status: 'healthy',
      services: {
        resources: false
      },
      cache: {
        keys: cacheManager.getKeys().length,
        stats: cacheManager.getStats()
      },
      config: {
        environment: process.env.NODE_ENV || 'prod',
        baseUrl: this.config.baseUrl
      }
    };

    // Test resources service
    try {
      const resourcesResponse = await this.resources.getStats();
      results.services.resources = resourcesResponse.success;
    } catch {
      results.services.resources = false;
    }

    // Overall health
    if (!results.services.resources) {
      results.status = 'unhealthy';
    }

    return results;
  }
}