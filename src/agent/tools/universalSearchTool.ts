import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { WorkbookClient, Resource } from '../../services/index.js';
import { ResourceTypes, ResourceTypeNames } from '../../constants/resourceTypes.js';
import { ensureFreshData } from '../../utils/freshnessDetection.js';

/**
 * Create universal search tool that intelligently routes queries to appropriate search methods
 * Factory function that accepts initialized WorkbookClient
 */
export function createUniversalSearchTool(workbookClient: WorkbookClient) {
  return createTool({
    id: 'universal-search',
    description: `🚨 LAST RESORT TOOL - Use ONLY when other tools cannot handle the query.

  DO NOT USE for common queries:
  ❌ "Show me all active clients" → Use companySearchTool
  ❌ "List employees" → Use searchContactsTool  
  ❌ "Find companies" → Use companySearchTool
  ❌ "Export data" → Use enhancedExportTool
  ❌ "Database stats" → Use getContactStatsTool
  
  ONLY use for:
  ✅ Complex mixed queries spanning multiple resource types
  ✅ Numeric ID lookups when exact resource type unknown
  ✅ Truly ambiguous searches that other tools rejected
  
  If unsure, try specialized tools FIRST, use this as absolute LAST RESORT.`,
  
    inputSchema: z.object({
      query: z.string()
        .describe('Search query - can be a name, email, company, ID, or any text. Use "all" for general listing'),
      searchType: z.enum(['auto', 'company', 'person', 'email', 'hierarchy'])
        .default('auto')
        .describe('Search type: auto (intelligent routing), company, person, email, or hierarchy'),
      includeInactive: z.boolean()
        .default(false)
        .describe('Whether to include inactive resources in results'),
      maxResults: z.number()
        .min(0)
        .default(0)
        .describe('Maximum number of results to return (0 for unlimited, default: unlimited)')
    }),
  
    outputSchema: z.object({
      results: z.array(z.object({
        id: z.number(),
        name: z.string(),
        type: z.string(),
        email: z.string().optional(),
        company: z.string().optional(),
        active: z.boolean(),
        matchReason: z.string()
      })),
      searchStrategy: z.string(),
      totalFound: z.number(),
      message: z.string()
    }),
  
    execute: async ({ context }) => {
      try {
        const { query, searchType = 'auto', includeInactive = false, maxResults = 0 } = context;
      
        // Handle empty or very generic queries
        const effectiveQuery = query?.trim() || 'all';
        console.log(`Universal search for: "${effectiveQuery}" (type: ${searchType})`);
        
        // Use universal freshness detection (Phase 7A)
        ensureFreshData(`universal search ${effectiveQuery}`, 'universalSearchTool');
      
        let searchStrategy = '';
        let results: Resource[] = [];
      
        // Determine search strategy
        if (searchType === 'auto') {
        // Handle truly empty queries more conservatively
          if (!effectiveQuery || effectiveQuery.trim() === '' || effectiveQuery === 'all') {
            searchStrategy = 'Complete dataset retrieval';
            const response = await workbookClient.resources.getAllResourcesComplete();
            if (response.success && response.data) {
              results = response.data;
            }
          }
          // Handle vague queries with suggestions instead of data dump
          else if (effectiveQuery.toLowerCase().includes('show me') && effectiveQuery.length < 15) {
            searchStrategy = 'Vague query - requesting clarification';
            return {
              results: [],
              searchStrategy,
              totalFound: 0,
              message: `The query "${query}" is too vague. Please be more specific, such as:
- "Show me all active clients"
- "Show me employees in Copenhagen"  
- "Show me companies starting with A"
- Or search by specific name, email, or ID`
            };
          }
          // Intelligent query analysis
          else {
            const lowerQuery = effectiveQuery.toLowerCase();
        
            // Check if it's a numeric ID
            if (/^\d+$/.test(effectiveQuery)) {
              searchStrategy = 'Direct ID lookup';
              const idNum = parseInt(effectiveQuery);
              const resourceResponse = await workbookClient.resources.getById(idNum);
          
              if (resourceResponse.success && resourceResponse.data) {
                results = [resourceResponse.data];
              }
            }
            // Check for email patterns
            else if (effectiveQuery.includes('@') || effectiveQuery.includes('.com') || effectiveQuery.includes('.dk') || effectiveQuery.includes('.net')) {
              searchStrategy = 'Email domain search';
              const domain = effectiveQuery.replace('@', '');
              const response = await workbookClient.resources.searchByEmailDomain(domain);
              if (response.success && response.data) {
                results = response.data;
              }
            }
            // Single letter - use "starts with"
            else if (effectiveQuery.length === 1 && /^[A-Za-z]$/.test(effectiveQuery)) {
              searchStrategy = 'Alphabetical "starts with" search';
              const response = await workbookClient.resources.findCompaniesStartingWith(effectiveQuery);
              if (response.success && response.data) {
                results = response.data;
              }
            }
            // Employee/Staff indicators  
            else if (lowerQuery.includes('employee') || lowerQuery.includes('staff') || 
                    lowerQuery.includes('all employees') || lowerQuery.includes('all staff')) {
              searchStrategy = 'All employees search';
              const response = await workbookClient.resources.search({
                ResourceType: [ResourceTypes.EMPLOYEE],
                Active: !includeInactive ? true : undefined
              });
              if (response.success && response.data) {
                results = response.data;
              }
            }
            // Company indicators
            else if (lowerQuery.includes('corp') || lowerQuery.includes('inc') || 
                 lowerQuery.includes('ltd') || lowerQuery.includes('company') ||
                 lowerQuery.includes('a/s') || lowerQuery.includes('aps')) {
              searchStrategy = 'Company name search';
              const response = await workbookClient.resources.searchByCompany(effectiveQuery);
              if (response.success && response.data) {
                results = response.data;
              }
            }
            // Check if query contains "starting with" or "begins with"
            else if (lowerQuery.includes('starting with') || lowerQuery.includes('begins with')) {
              searchStrategy = 'Prefix search';
              const prefix = effectiveQuery.split(/starting with|begins with/i)[1]?.trim() || effectiveQuery;
              const response = await workbookClient.resources.findCompaniesStartingWith(prefix);
              if (response.success && response.data) {
                results = response.data;
              }
            }
            // Default to name search
            else {
              searchStrategy = 'Name and initials search';
              const response = await workbookClient.resources.searchByName(effectiveQuery);
              if (response.success && response.data) {
                results = response.data;
              }
            }
          }
        }
        // Specific search types
        else if (searchType === 'company') {
        // Even in company mode, apply intelligent routing for single letters
          if (query.length === 1 && /^[A-Za-z]$/.test(query)) {
            searchStrategy = 'Company "starts with" search';
            const response = await workbookClient.resources.findCompaniesStartingWith(query);
            if (response.success && response.data) {
              results = response.data;
            }
          } else {
            searchStrategy = 'Company "contains" search';
            const response = await workbookClient.resources.findCompaniesByName(query);
            if (response.success && response.data) {
              results = response.data;
            }
          }
        }
        else if (searchType === 'person') {
          searchStrategy = 'Person-specific search';
          
          // Handle "all employees" or "all staff" queries
          if (query.toLowerCase().includes('all') && (query.toLowerCase().includes('employees') || query.toLowerCase().includes('staff'))) {
            const response = await workbookClient.resources.search({
              ResourceType: [ResourceTypes.EMPLOYEE],
              Active: !includeInactive ? true : undefined
            });
            if (response.success && response.data) {
              results = response.data;
              searchStrategy = 'All employees search';
            }
          } else {
            const response = await workbookClient.resources.searchByName(query);
            if (response.success && response.data) {
              // Filter to employees only (TypeId 2)
              results = response.data.filter((r) => r.TypeId === ResourceTypes.EMPLOYEE);
            }
          }
        }
        else if (searchType === 'email') {
          searchStrategy = 'Email-specific search';
          const response = await workbookClient.resources.searchByEmailDomain(query.replace('@', ''));
          if (response.success && response.data) {
            results = response.data;
          }
        }
        else if (searchType === 'hierarchy') {
          searchStrategy = 'Hierarchical structure search';
          const companyResponse = await workbookClient.resources.findCompanyByName(query);
          if (companyResponse.success && companyResponse.data) {
            const hierarchyResponse = await workbookClient.resources.getHierarchicalStructure(companyResponse.data.Id);
            if (hierarchyResponse.success && hierarchyResponse.data) {
              results = hierarchyResponse.data.map((h) => h.resource);
            }
          }
        }
      
        // Filter by active status if needed
        if (!includeInactive) {
          results = results.filter((r) => r.Active);
        }
      
        // Apply result limit
        const limitedResults = maxResults > 0 ? results.slice(0, maxResults) : results;
      
        // Format results with match reasons
        const typeNames = ResourceTypeNames;
        const formattedResults = limitedResults.map((resource) => {
          const typeName = typeNames[resource.TypeId as keyof typeof typeNames] || `Type${resource.TypeId}`;
        
          // Determine match reason
          let matchReason = 'General match';
          if (searchStrategy.includes('ID')) {
            matchReason = 'Exact ID match';
          } else if (searchStrategy.includes('Email')) {
            matchReason = 'Email domain match';
          } else if (searchStrategy.includes('starts with')) {
            matchReason = 'Name starts with query';
          } else if (searchStrategy.includes('Company')) {
            matchReason = 'Company name match';
          } else if (resource.Name?.toLowerCase().includes(query.toLowerCase())) {
            matchReason = 'Name contains query';
          } else if (resource.Initials?.toLowerCase().includes(query.toLowerCase())) {
            matchReason = 'Initials match';
          }
        
          return {
            id: resource.Id,
            name: resource.Name || 'Unknown',
            type: typeName,
            email: resource.Email || undefined,
            company: resource.ResourceFolder || undefined,
            active: resource.Active,
            matchReason
          };
        });
      
        return {
          results: formattedResults,
          searchStrategy,
          totalFound: results.length,
          message: `EXACT COUNT: Found ${results.length} total results using ${searchStrategy}${maxResults > 0 && results.length > maxResults ? ` (displaying first ${maxResults} results)` : ' (showing all results)'}`
        };
      
      } catch (error) {
        console.error('❌ Error in universalSearchTool:', error);
      
        return {
          results: [],
          searchStrategy: 'Error',
          totalFound: 0,
          message: `Error performing search: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }
  });
}