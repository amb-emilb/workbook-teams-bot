// Main exports for the Workbook API services

export { WorkbookClient } from './workbookClient.js';
export { ResourceService } from './domains/resourceService.js';
export { BaseService } from './base/baseService.js';
export { cacheManager, CacheManager } from './base/cache.js';
export { RelationshipService } from './relationshipService.js';

// Export types
export * from '../types/workbook.types.js';
export type { 
  RelationshipNode, 
  RelationshipTree, 
  RelationshipConnection, 
  RelationshipMap 
} from './relationshipService.js';