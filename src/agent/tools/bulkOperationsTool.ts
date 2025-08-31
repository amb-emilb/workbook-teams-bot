import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { WorkbookClient } from '../../services/index.js';

/**
 * Create bulk operations tool for mass updates and batch operations
 * Factory function that accepts initialized WorkbookClient
 */
export function createBulkOperationsTool(workbookClient: WorkbookClient) {
  return createTool({
    id: 'bulk-operations',
    description: `BULK OPERATIONS TOOL - Use this tool ONLY for actual bulk modifications/updates of multiple resources.

  PRIMARY USE CASES:
  - Activate or deactivate multiple resources at once
  - Update email addresses in bulk (requires valid email format like user@domain.com)
  - Update company/folder assignments for multiple resources
  - Perform mass status changes with criteria
  - Execute batch operations with confirmation and preview mode
  
  DO NOT USE for:
  - Simple data exports (use enhancedExportTool instead)
  - Searching or filtering data (use advancedFilterTool instead)
  - Single resource updates (use individual tools instead)
  - Data analysis or reporting (use appropriate analysis tools)
  
  This tool modifies actual data - always use preview mode first for safety.`,
  
    inputSchema: z.object({
      operation: z.enum(['activate', 'deactivate', 'updateEmail', 'updateFolder', 'preview'])
        .describe('Operation type: activate, deactivate, updateEmail, updateFolder, or preview'),
      resourceIds: z.array(z.number())
        .min(1)
        .describe('Array of resource IDs to operate on'),
      newValues: z.object({
        email: z.string().email().optional(),
        resourceFolder: z.string().optional(),
        active: z.boolean().optional()
      }).optional()
        .describe('New values to apply (required for update operations)'),
      confirmationRequired: z.boolean()
        .default(false)
        .describe('Whether to require confirmation before executing (returns preview if true)'),
      searchCriteria: z.object({
        query: z.string().optional(),
        type: z.array(z.number()).optional()
      }).optional()
        .describe('Alternative to resourceIds: search criteria to find resources')
    }),
  
    outputSchema: z.object({
      operation: z.string(),
      targetCount: z.number(),
      preview: z.array(z.object({
        id: z.number(),
        name: z.string(),
        currentState: z.object({
          active: z.boolean(),
          email: z.string().optional(),
          folder: z.string().optional()
        }),
        proposedChange: z.string()
      })).optional(),
      executed: z.boolean(),
      results: z.object({
        successful: z.array(z.number()),
        failed: z.array(z.object({
          id: z.number(),
          error: z.string()
        })),
        successCount: z.number(),
        failureCount: z.number()
      }).optional(),
      message: z.string()
    }),
  
    execute: async ({ context }) => {
      try {
        const { 
          operation, 
          resourceIds = [], 
          newValues, 
          confirmationRequired = false,
          searchCriteria 
        } = context;

        // Auto-require confirmation for destructive operations affecting multiple resources
        const isDestructiveOperation = ['deactivate', 'updateEmail', 'updateFolder'].includes(operation);
        const willAffectMultiple = resourceIds.length > 1 || searchCriteria;
        const needsConfirmation = confirmationRequired || (isDestructiveOperation && willAffectMultiple);
      
        console.log(`🔧 Starting bulk operation: ${operation}${needsConfirmation ? ' (confirmation required)' : ''}`);
      
        // Get target resource IDs
        let targetIds = resourceIds;
      
        // If search criteria provided instead of IDs, find matching resources
        if (searchCriteria && (!resourceIds || resourceIds.length === 0)) {
          const allResourcesResponse = await workbookClient.resources.getAllResourcesComplete();
        
          if (!allResourcesResponse.success || !allResourcesResponse.data) {
            return {
              operation,
              targetCount: 0,
              executed: false,
              message: `Error fetching resources: ${allResourcesResponse.error}`
            };
          }
        
          let filtered = allResourcesResponse.data;
        
          if (searchCriteria.query) {
            const lowerQuery = searchCriteria.query.toLowerCase();
            filtered = filtered.filter(r => 
              r.Name?.toLowerCase().includes(lowerQuery) ||
            r.Email?.toLowerCase().includes(lowerQuery) ||
            r.ResourceFolder?.toLowerCase().includes(lowerQuery)
            );
          }
        
          if (searchCriteria.type && searchCriteria.type.length > 0) {
            filtered = filtered.filter(r => searchCriteria.type!.includes(r.TypeId || 0));
          }
        
          targetIds = filtered.map(r => r.Id);
        }
      
        if (targetIds.length === 0) {
          return {
            operation,
            targetCount: 0,
            executed: false,
            message: 'No resources found matching the criteria'
          };
        }
      
        // Fetch current state of target resources
        const currentResources = await Promise.all(
          targetIds.map(async id => {
            const response = await workbookClient.resources.getById(id);
            return response.success ? response.data : null;
          })
        );
      
        const validResources = currentResources.filter(r => r !== null);
      
        // Generate preview
        const preview = validResources.map(resource => {
          let proposedChange = '';
        
          // For preview operations, don't show any specific change
          if (operation === 'preview') {
            proposedChange = 'Preview mode - no specific operation selected';
          } else {
          // For actual operations (even in preview mode), show what would happen
            switch (operation) {
            case 'activate':
              proposedChange = resource!.Active ? 'Already active (no change)' : 'Will be activated';
              break;
            case 'deactivate':
              proposedChange = !resource!.Active ? 'Already inactive (no change)' : 'Will be deactivated';
              break;
            case 'updateEmail':
              proposedChange = newValues?.email 
                ? `Email: ${resource!.Email || 'none'} → ${newValues.email}`
                : 'No email provided';
              break;
            case 'updateFolder':
              proposedChange = newValues?.resourceFolder
                ? `Folder: ${resource!.ResourceFolder || 'none'} → ${newValues.resourceFolder}`
                : 'No folder provided';
              break;
            }
          }
        
          return {
            id: resource!.Id,
            name: resource!.Name || 'Unknown',
            currentState: {
              active: resource!.Active,
              email: resource!.Email || undefined,
              folder: resource!.ResourceFolder || undefined
            },
            proposedChange
          };
        });
      
        // If preview mode or confirmation required, return preview
        if (operation === 'preview' || needsConfirmation) {
          return {
            operation,
            targetCount: validResources.length,
            preview,
            executed: false,
            message: `Preview generated for ${validResources.length} resources. Review changes before executing.`
          };
        }
      
        // Execute the bulk operation
        console.log(`⚡ Executing bulk ${operation} on ${validResources.length} resources...`);
      
        const results = {
          successful: [] as number[],
          failed: [] as { id: number; error: string }[],
          successCount: 0,
          failureCount: 0
        };
      
        for (const resource of validResources) {
          if (!resource) {continue;}
        
          try {
            let updateResponse;
          
            switch (operation) {
            case 'activate':
              if (!resource.Active) {
                updateResponse = await workbookClient.resources.markActive(resource.Id.toString());
              } else {
                updateResponse = { success: true }; // Already active
              }
              break;
              
            case 'deactivate':
              if (resource.Active) {
                updateResponse = await workbookClient.resources.markInactive(resource.Id.toString());
              } else {
                updateResponse = { success: true }; // Already inactive
              }
              break;
              
            case 'updateEmail':
              if (newValues?.email) {
                updateResponse = await workbookClient.resources.update(resource.Id.toString(), {
                  Email: newValues.email
                });
              } else {
                throw new Error('No email provided');
              }
              break;
              
            case 'updateFolder':
              if (newValues?.resourceFolder) {
                updateResponse = await workbookClient.resources.update(resource.Id.toString(), {
                  ResourceFolder: newValues.resourceFolder
                });
              } else {
                throw new Error('No folder provided');
              }
              break;
              
            default:
              throw new Error(`Unknown operation: ${operation}`);
            }
          
            if (updateResponse?.success) {
              results.successful.push(resource.Id);
              results.successCount++;
            } else {
              results.failed.push({
                id: resource.Id,
                error: updateResponse?.error || 'Update failed'
              });
              results.failureCount++;
            }
          
          } catch (error) {
            results.failed.push({
              id: resource.Id,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
            results.failureCount++;
          }
        }
      
        // Clear cache after bulk operations
        workbookClient.resources.clearCache();
      
        return {
          operation,
          targetCount: validResources.length,
          executed: true,
          results,
          message: `Bulk ${operation} completed: ${results.successCount} successful, ${results.failureCount} failed`
        };
      
      } catch (error) {
        console.error('❌ Error in bulkOperationsTool:', error);
      
        return {
          operation: context.operation,
          targetCount: 0,
          executed: false,
          message: `Error performing bulk operation: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }
  });
}