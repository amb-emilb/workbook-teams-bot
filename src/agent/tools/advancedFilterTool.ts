import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { WorkbookClient } from '../../services/index.js';
import { ResourceTypes, ResourceTypeNames } from '../../constants/resourceTypes.js';

/**
 * Create advanced multi-criteria filtering tool for Workbook CRM resources
 * Factory function that accepts initialized WorkbookClient
 */
export function createAdvancedFilterTool(workbookClient: WorkbookClient) {
  return createTool({
    id: 'advanced-filter',
    description: `🔍 ADVANCED MULTI-CRITERIA FILTERING - Use ONLY for complex filtering with multiple conditions.

  DO NOT use for simple searches:
  ❌ "Show me all clients" → Use companySearchTool
  ❌ "Find ADECCO" → Use companySearchTool  
  ❌ "Companies in Copenhagen" → Use geographicAnalysisTool
  ❌ "List employees" → Use searchContactsTool
  
  ONLY use for complex multi-criteria filtering:
  ✅ "Active clients with >5 contacts AND missing emails"
  ✅ "Suppliers with gmail.com domain managed by admin"
  ✅ "Danish clients with 0-2 contacts that are active"
  ✅ "Resources matching multiple business rules"
  
  Requires MULTIPLE filter conditions. For simple searches, use specialized tools.
  Supports filtering by type, status, email domain, location, responsible employee, contact counts.`,
        
    inputSchema: z.object({
      resourceType: z.array(z.number())
        .optional()
        .describe('Resource types: 2=Employee, 3=Client, 4=Supplier, 6=Prospect, 10=Contact Person. For "companies" use [3,4,6] (clients, suppliers, prospects). Leave empty for all types.'),
      active: z.boolean()
        .optional()
        .describe('Filter by active status. True=active only, False=inactive only, undefined=both'),
      emailDomain: z.string()
        .optional()
        .describe('Filter by email domain (e.g., "ambition.dk", "gmail.com")'),
      company: z.string()
        .optional()
        .describe('Filter by company/location name (searches ResourceFolder field)'),
      responsibleEmployee: z.string()
        .optional()
        .describe('Filter by responsible employee name'),
      hasEmail: z.boolean()
        .optional()
        .describe('Filter by email presence. True=has email, False=missing email, undefined=both'),
      contactCountMin: z.number()
        .min(0)
        .optional()
        .describe('Minimum number of contacts (for companies only)'),
      contactCountMax: z.number()
        .min(0)
        .optional()
        .describe('Maximum number of contacts (for companies only)'),
      limit: z.number()
        .min(0)
        .default(0)
        .describe('Maximum number of results to return (0 for unlimited, default: unlimited)')
    }),
  
    outputSchema: z.object({
      resources: z.array(z.object({
        id: z.number(),
        name: z.string(),
        type: z.string(),
        email: z.string().optional(),
        company: z.string().optional(),
        active: z.boolean(),
        responsibleEmployee: z.string().optional(),
        contactCount: z.number().optional()
      })),
      totalFound: z.number(),
      filtersApplied: z.array(z.string()),
      message: z.string()
    }),
  
    execute: async ({ context }) => {
      try {
        const { 
          resourceType, 
          active, 
          emailDomain, 
          company, 
          responsibleEmployee,
          hasEmail,
          contactCountMin,
          contactCountMax,
          limit = 0 
        } = context;
      
        console.log('� Starting advanced filter search...');
      
        // Get complete dataset
        const allResourcesResponse = await workbookClient.resources.getAllResourcesComplete();
      
        if (!allResourcesResponse.success || !allResourcesResponse.data) {
          return {
            resources: [],
            totalFound: 0,
            filtersApplied: [],
            message: `Error fetching resources: ${allResourcesResponse.error}`
          };
        }
      
        let filteredResources = allResourcesResponse.data;
        const appliedFilters: string[] = [];
      
        // Apply resource type filter
        if (resourceType && resourceType.length > 0) {
          filteredResources = filteredResources.filter(r => resourceType.includes(r.TypeId || 0));
          const typeNames = resourceType.map(t => ResourceTypeNames[t as keyof typeof ResourceTypeNames] || `Type${t}`);
          appliedFilters.push(`Resource types: ${typeNames.join(', ')}`);
        }
      
        // Apply active status filter
        if (active !== undefined) {
          filteredResources = filteredResources.filter(r => r.Active === active);
          appliedFilters.push(`Status: ${active ? 'Active only' : 'Inactive only'}`);
        }
      
        // Apply email domain filter
        if (emailDomain) {
          filteredResources = filteredResources.filter(r => 
            r.Email && r.Email.toLowerCase().includes(emailDomain.toLowerCase())
          );
          appliedFilters.push(`Email domain: ${emailDomain}`);
        }
      
        // Apply company/location filter
        if (company) {
          filteredResources = filteredResources.filter(r => 
            r.ResourceFolder && r.ResourceFolder.toLowerCase().includes(company.toLowerCase())
          );
          appliedFilters.push(`Company/Location: ${company}`);
        }
      
        // Apply responsible employee filter
        if (responsibleEmployee) {
          const employeeResponse = await workbookClient.resources.searchByName(responsibleEmployee);
          if (employeeResponse.success && employeeResponse.data) {
            const employeeIds = employeeResponse.data.map(e => e.Id);
            filteredResources = filteredResources.filter(r => 
              r.ResponsibleResourceId && employeeIds.includes(r.ResponsibleResourceId)
            );
            appliedFilters.push(`Responsible employee: ${responsibleEmployee}`);
          }
        }
      
        // Apply email presence filter
        if (hasEmail !== undefined) {
          if (hasEmail) {
            filteredResources = filteredResources.filter(r => r.Email && r.Email.trim() !== '');
            appliedFilters.push('Has email');
          } else {
            filteredResources = filteredResources.filter(r => !r.Email || r.Email.trim() === '');
            appliedFilters.push('Missing email');
          }
        }
      
        // Apply contact count filters (for companies only)
        const needsContactCounts = contactCountMin !== undefined || contactCountMax !== undefined;
        let resourcesWithContactCounts: (typeof filteredResources[0] & { contactCount: number })[] = [];
      
        if (needsContactCounts) {
          console.log('� Calculating contact counts for filtering...');
        
          // Filter to customer companies first for efficiency (excludes our own company)
          const companies = filteredResources.filter(r => 
            r.TypeId === ResourceTypes.CLIENT || 
            r.TypeId === ResourceTypes.PROSPECT ||
            r.TypeId === ResourceTypes.SUPPLIER
          );
        
          // Get contact counts for each company
          resourcesWithContactCounts = await Promise.all(
            companies.map(async company => {
              const contactsResponse = await workbookClient.resources.getContactsForResource(company.Id);
              const contactCount = contactsResponse.success ? (contactsResponse.data?.length || 0) : 0;
            
              return {
                ...company,
                contactCount
              };
            })
          );
        
          // Apply contact count filters
          if (contactCountMin !== undefined) {
            resourcesWithContactCounts = resourcesWithContactCounts.filter(r => r.contactCount >= contactCountMin);
            appliedFilters.push(`Min contacts: ${contactCountMin}`);
          }
        
          if (contactCountMax !== undefined) {
            resourcesWithContactCounts = resourcesWithContactCounts.filter(r => r.contactCount <= contactCountMax);
            appliedFilters.push(`Max contacts: ${contactCountMax}`);
          }
        
          // Replace filteredResources with contact-counted results
          filteredResources = resourcesWithContactCounts;
        }
      
        // Apply limit
        const limitedResources = limit > 0 ? filteredResources.slice(0, limit) : filteredResources;
      
        // Format results
        const formattedResources = await Promise.all(
          limitedResources.map(async resource => {
            const typeName = ResourceTypeNames[resource.TypeId as keyof typeof ResourceTypeNames] || `Type${resource.TypeId}`;
          
            // Get responsible employee name if exists
            let responsibleEmployeeName: string | undefined;
            if (resource.ResponsibleResourceId) {
              const employeeResponse = await workbookClient.resources.getById(resource.ResponsibleResourceId);
              responsibleEmployeeName = employeeResponse.success ? employeeResponse.data?.Name : undefined;
            }
          
            // Get contact count if not already calculated
            let contactCount: number | undefined;
            if (needsContactCounts) {
              contactCount = 'contactCount' in resource ? (resource as typeof filteredResources[0] & { contactCount: number }).contactCount : undefined;
            } else if (resource.TypeId === ResourceTypes.CLIENT || 
                      resource.TypeId === ResourceTypes.PROSPECT ||
                      resource.TypeId === ResourceTypes.SUPPLIER) {
              const contactsResponse = await workbookClient.resources.getContactsForResource(resource.Id);
              contactCount = contactsResponse.success ? (contactsResponse.data?.length || 0) : 0;
            }
          
            return {
              id: resource.Id,
              name: resource.Name || 'Unknown',
              type: typeName,
              email: resource.Email || undefined,
              company: resource.ResourceFolder || undefined,
              active: resource.Active,
              responsibleEmployee: responsibleEmployeeName,
              contactCount
            };
          })
        );
      
        const cacheStatus = allResourcesResponse.cached ? ' (cached)' : '';
        const filterSummary = appliedFilters.length > 0 ? ` [Filters: ${appliedFilters.join(', ')}]` : '';
      
        return {
          resources: formattedResources,
          totalFound: filteredResources.length,
          filtersApplied: appliedFilters,
          message: `EXACT COUNT: Found ${filteredResources.length} total resources${filterSummary}${filteredResources.length > limit ? ` (displaying first ${limit} results)` : ' (showing all results)'}${cacheStatus}`
        };
      
      } catch (error) {
        console.error('❌ Error in advancedFilterTool:', error);
      
        return {
          resources: [],
          totalFound: 0,
          filtersApplied: [],
          message: `Error applying filters: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }
  });
}