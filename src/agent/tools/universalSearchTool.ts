import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { WorkbookClient, Resource } from '../../services/index.js';

/**
 * Create universal search tool that intelligently routes queries to appropriate search methods
 * Factory function that accepts initialized WorkbookClient
 */
export function createUniversalSearchTool(workbookClient: WorkbookClient) {
  return createTool({
    id: 'universal-search',
    description: `Universal intelligent search across all Workbook CRM data. Use this tool for any search query - it will automatically determine the best search strategy:
  - Email addresses or domains → Email search
  - Single letters → "Starts with" search  
  - Company keywords (Corp, Inc, Ltd) → Company search
  - Numeric IDs → Direct ID lookup
  - Everything else → Name search
  
  This is the primary search tool that adapts to any query type.`,
  
    inputSchema: z.object({
      query: z.string()
        .min(1)
        .describe('Search query - can be a name, email, company, ID, or any text'),
      searchType: z.enum(['auto', 'company', 'person', 'email', 'hierarchy'])
        .default('auto')
        .describe('Search type: auto (intelligent routing), company, person, email, or hierarchy'),
      includeInactive: z.boolean()
        .default(false)
        .describe('Whether to include inactive resources in results'),
      maxResults: z.number()
        .min(1)
        .max(50)
        .default(10)
        .describe('Maximum number of results to return (1-50, default: 10)')
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
        const { query, searchType = 'auto', includeInactive = false, maxResults = 10 } = context;
      
        console.log(`🔍 Universal search for: "${query}" (type: ${searchType})`);
      
        let searchStrategy = '';
        let results: Resource[] = [];
      
        // Determine search strategy
        if (searchType === 'auto') {
        // Intelligent query analysis
          const lowerQuery = query.toLowerCase();
        
          // Check if it's a numeric ID
          if (/^\d+$/.test(query)) {
            searchStrategy = 'Direct ID lookup';
            const idNum = parseInt(query);
            const resourceResponse = await workbookClient.resources.getById(idNum);
          
            if (resourceResponse.success && resourceResponse.data) {
              results = [resourceResponse.data];
            }
          }
          // Check for email patterns
          else if (query.includes('@') || query.includes('.com') || query.includes('.dk') || query.includes('.net')) {
            searchStrategy = 'Email domain search';
            const domain = query.replace('@', '');
            const response = await workbookClient.resources.searchByEmailDomain(domain);
            if (response.success && response.data) {
              results = response.data;
            }
          }
          // Single letter - use "starts with"
          else if (query.length === 1 && /^[A-Za-z]$/.test(query)) {
            searchStrategy = 'Alphabetical "starts with" search';
            const response = await workbookClient.resources.findCompaniesStartingWith(query);
            if (response.success && response.data) {
              results = response.data;
            }
          }
          // Company indicators
          else if (lowerQuery.includes('corp') || lowerQuery.includes('inc') || 
                 lowerQuery.includes('ltd') || lowerQuery.includes('company') ||
                 lowerQuery.includes('a/s') || lowerQuery.includes('aps')) {
            searchStrategy = 'Company name search';
            const response = await workbookClient.resources.searchByCompany(query);
            if (response.success && response.data) {
              results = response.data;
            }
          }
          // Check if query contains "starting with" or "begins with"
          else if (lowerQuery.includes('starting with') || lowerQuery.includes('begins with')) {
            searchStrategy = 'Prefix search';
            const prefix = query.split(/starting with|begins with/i)[1]?.trim() || query;
            const response = await workbookClient.resources.findCompaniesStartingWith(prefix);
            if (response.success && response.data) {
              results = response.data;
            }
          }
          // Default to name search
          else {
            searchStrategy = 'Name and initials search';
            const response = await workbookClient.resources.searchByName(query);
            if (response.success && response.data) {
              results = response.data;
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
          const response = await workbookClient.resources.searchByName(query);
          if (response.success && response.data) {
          // Filter to employees only (TypeId 2)
            results = response.data.filter((r) => r.TypeId === 2);
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
        const limitedResults = results.slice(0, maxResults);
      
        // Format results with match reasons
        const typeNames = { 1: 'Company', 2: 'Employee', 3: 'Client' };
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
          message: `EXACT COUNT: Found ${results.length} total results using ${searchStrategy}${results.length > maxResults ? ` (displaying first ${maxResults} results)` : ' (showing all results)'}`
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