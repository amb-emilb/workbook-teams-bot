import NodeCache from 'node-cache';
import { WorkbookConfig } from '../types/workbook.types.js';
import { ResourceService } from './domains/resourceService.js';
import { JobService } from './domains/jobService.js';
import { cacheManager } from './base/cache.js';
import { keyVaultService } from './keyVault.js';

/**
 * Main Workbook API Client - Facade pattern for all services
 * Note: "Contacts" removed - use "Resources" for all people data
 */
export class WorkbookClient {
  public readonly resources: ResourceService;
  public readonly jobs: JobService;

  private config: WorkbookConfig;

  constructor(config: WorkbookConfig) {
    this.config = config;
    
    // Initialize domain services
    this.resources = new ResourceService(config);
    this.jobs = new JobService(config);
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
    // Detect if running in Azure (production) or locally (development)
    const isProduction = process.env.NODE_ENV === 'production' || !!process.env.WEBSITE_INSTANCE_ID;
    const environment = isProduction ? 'PRODUCTION' : 'LOCAL';

    console.log('� Loading Workbook configuration from Key Vault');
    console.log(`📍 Running in ${environment} environment`);
    console.log('� Using DEV Workbook API for both environments (as requested)');

    try {
      // ALWAYS use DEV Workbook credentials regardless of environment
      // This is the user's requirement: both prod and dev use the dev API
      const apiKeySecret = 'workbook-api-key-dev';
      const passwordSecret = 'workbook-password-dev';
      
      const secrets = await keyVaultService.getSecrets([
        apiKeySecret,
        passwordSecret
      ]);

      // ALWAYS use DEV Workbook API (ambitiondemo.workbook.net)
      const baseUrl = 'ambitiondemo.workbook.net';
      const username = 'tg';

      const config: WorkbookConfig = {
        apiKey: secrets[apiKeySecret],
        baseUrl,
        username,
        password: secrets[passwordSecret],
        timeout: 30000
      };

      console.log(`✅ Workbook Client initialized with DEV API (${baseUrl})`);
      
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
    console.log('� All caches cleared');
  }

  /**
   * Health check - test API connectivity
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    services: {
      resources: boolean;
      jobs: boolean;
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
      services: { resources: boolean; jobs: boolean; };
      cache: { keys: number; stats: NodeCache.Stats; };
      config: { environment: string; baseUrl: string; };
    } = {
      status: 'healthy',
      services: {
        resources: false,
        jobs: false
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

    // Test jobs service
    try {
      const activitiesResponse = await this.jobs.getActivities();
      results.services.jobs = activitiesResponse.success;
    } catch {
      results.services.jobs = false;
    }

    // Overall health
    if (!results.services.resources || !results.services.jobs) {
      results.status = 'unhealthy';
    }

    return results;
  }
}