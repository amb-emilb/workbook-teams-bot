import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { WorkbookClient } from '../../services/index.js';

/**
 * Create hierarchical search tool for the Workbook CRM system
 * Factory function that accepts initialized WorkbookClient
 */
export function createHierarchicalSearchTool(workbookClient: WorkbookClient) {
  return createTool({
    id: 'hierarchical-search',
    description: `⚠️ DEPRECATED - Use companySearchTool with bulkMode=true instead.
  
  🏗️ BULK HIERARCHICAL OPERATIONS - MIGRATED TO companySearchTool
  
  This tool is being consolidated into companySearchTool for better maintainability.
  
  USE INSTEAD:
  ✅ companySearchTool with bulkMode=true for "All companies with their full hierarchy structures"
  ✅ companySearchTool with bulkMode=true for "Bulk export all client relationships and contacts" 
  ✅ companySearchTool with bulkMode=true for "Mass hierarchy processing for data analysis"
  ✅ companySearchTool with bulkMode=true for "Complete organizational structure mapping"
  
  This tool will be removed in a future version.`,
  
    inputSchema: z.object({
      resourceId: z.number()
        .optional()
        .describe('Specific resource/company ID to get hierarchy for'),
      includeContacts: z.boolean()
        .default(true)
        .describe('Whether to include contact persons in the results'),
      limit: z.number()
        .min(0)
        .default(0)
        .describe('Maximum number of companies to show (0 for unlimited, default: unlimited)')
    }),
  
    outputSchema: z.object({
      companies: z.array(z.object({
        id: z.number(),
        name: z.string(),
        responsibleEmployee: z.string().optional(),
        contactCount: z.number(),
        contacts: z.array(z.object({
          name: z.string(),
          email: z.string().optional(),
          phone: z.string().optional()
        })).optional()
      })),
      totalFound: z.number(),
      message: z.string()
    }),
  
    execute: async ({ context }) => {
      try {
        const { resourceId, includeContacts = true, limit = 0 } = context;
      
        console.log(`Fetching hierarchical data${resourceId ? ` for resource ${resourceId}` : ''}`);
      
        // Get all resources first (use complete dataset)
        const resourcesResponse = await workbookClient.resources.getAllResourcesComplete();
      
        if (!resourcesResponse.success || !resourcesResponse.data) {
          return {
            companies: [],
            totalFound: 0,
            message: `Error fetching resources: ${resourcesResponse.error}`
          };
        }

        const resources = resourcesResponse.data;
      
        // Filter to get companies (those with ResponsibleResourceId)
        const companies = resourceId 
          ? resources.filter(r => r.Id === resourceId)
          : resources.filter(r => r.ResponsibleResourceId && r.ResponsibleResourceId > 0);
      
        // Limit the results
        const limitedCompanies = limit > 0 ? companies.slice(0, limit) : companies;
      
        // Build hierarchical data
        const companiesWithDetails = await Promise.all(
          limitedCompanies.map(async company => {
          // Find responsible employee
            const responsibleEmployee = company.ResponsibleResourceId
              ? resources.find(r => r.Id === company.ResponsibleResourceId)
              : undefined;
          
            // Get contacts if requested
            let contacts: Array<{ name: string; email?: string; phone?: string }> = [];
            let contactCount = 0;
          
            if (includeContacts) {
              const contactsResponse = await workbookClient.resources.getContactsForResource(company.Id);
              if (contactsResponse.success && contactsResponse.data) {
                contactCount = contactsResponse.data.length;
                contacts = contactsResponse.data.slice(0, 3).map(c => ({
                  name: c.Name || 'Unknown',
                  email: c.Email || undefined,
                  phone: c.Phone1 || undefined
                }));
              }
            }
          
            return {
              id: company.Id,
              name: company.Name || 'Unknown',
              responsibleEmployee: responsibleEmployee?.Name,
              contactCount,
              contacts: includeContacts ? contacts : undefined
            };
          })
        );
      
        const cacheStatus = resourcesResponse.cached ? ' (cached)' : '';
        const message = resourceId
          ? `Found hierarchy for resource ${resourceId}${cacheStatus}`
          : `Retrieved ${companiesWithDetails.length} companies with hierarchy${cacheStatus}`;
      
        return {
          companies: companiesWithDetails,
          totalFound: companiesWithDetails.length,
          message
        };
      
      } catch (error) {
        console.error('❌ Error in hierarchicalSearchTool:', error);
      
        return {
          companies: [],
          totalFound: 0,
          message: `Error searching hierarchical data: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }
  });
}