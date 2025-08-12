import NodeCache from 'node-cache';
import { CacheConfig } from '../../types/workbook.types.js';

// Default cache configuration (in seconds)
const DEFAULT_CONFIG: CacheConfig = {
  contactsTTL: 300,   // 5 minutes
  jobsTTL: 60,        // 1 minute
  resourcesTTL: 300   // 5 minutes
};

class CacheManager {
  private cache: NodeCache;
  private config: CacheConfig;

  constructor(config?: Partial<CacheConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Initialize NodeCache with default TTL of 5 minutes
    this.cache = new NodeCache({
      stdTTL: this.config.contactsTTL,
      checkperiod: 60, // Check for expired keys every 60 seconds
      useClones: false // Better performance, but be careful with object mutations
    });

    // Log cache events in development
    if (process.env.NODE_ENV === 'dev') {
      this.cache.on('set', (key) => {
        console.log(`📝 Cache SET: ${key}`);
      });
      
      this.cache.on('del', (key) => {
        console.log(`🗑️ Cache DEL: ${key}`);
      });
      
      this.cache.on('expired', (key) => {
        console.log(`⏰ Cache EXPIRED: ${key}`);
      });
    }
  }

  /**
   * Get a value from cache
   */
  get<T = unknown>(key: string): T | undefined {
    const value = this.cache.get<T>(key);
    if (process.env.NODE_ENV === 'dev' && value !== undefined) {
      console.log(`💾 Cache HIT: ${key}`);
    }
    return value;
  }

  /**
   * Set a value in cache with custom TTL
   */
  set<T = unknown>(key: string, value: T, ttl?: number): boolean {
    return this.cache.set(key, value, ttl || this.config.contactsTTL);
  }

  /**
   * Set contacts data with appropriate TTL
   */
  setContacts<T = unknown>(key: string, value: T): boolean {
    return this.cache.set(key, value, this.config.contactsTTL);
  }

  /**
   * Set jobs data with appropriate TTL
   */
  setJobs<T = unknown>(key: string, value: T): boolean {
    return this.cache.set(key, value, this.config.jobsTTL);
  }

  /**
   * Set resources data with appropriate TTL
   */
  setResources<T = unknown>(key: string, value: T): boolean {
    return this.cache.set(key, value, this.config.resourcesTTL);
  }

  /**
   * Delete a specific key
   */
  del(key: string): number {
    return this.cache.del(key);
  }

  /**
   * Delete multiple keys
   */
  delStartWith(startStr: string): number {
    const keys = this.cache.keys().filter(key => key.startsWith(startStr));
    return this.cache.del(keys);
  }

  /**
   * Clear all cache
   */
  flush(): void {
    this.cache.flushAll();
    console.log('🧹 Cache flushed');
  }

  /**
   * Get cache statistics
   */
  getStats(): NodeCache.Stats {
    return this.cache.getStats();
  }

  /**
   * Get all cache keys (useful for debugging)
   */
  getKeys(): string[] {
    return this.cache.keys();
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();
export { CacheManager };