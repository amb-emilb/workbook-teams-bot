import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { WorkbookClient, Resource } from '../../services/index.js';
import { ResourceTypes } from '../../constants/resourceTypes.js';

/**
 * Create search people tool for the Workbook CRM system
 * Factory function that accepts initialized WorkbookClient
 */
export function createSearchContactsTool(workbookClient: WorkbookClient) {
  return createTool({
    id: 'search-people',
    description: `Search for PEOPLE/INDIVIDUALS in the Workbook CRM system (employees and contact persons). Use this tool ONLY when users ask to:
  - Find INDIVIDUAL PEOPLE by name, email, or contact details
  - Look up EMPLOYEE information or CONTACT PERSON details
  - Get PERSON-specific data (not company/client data)
  
  IMPORTANT: Do NOT use for client companies - use company search tool instead.
  For CLIENT COMPANIES, use the company search tool.
  
  Auto-detects "fresh/new/latest" keywords and purges cache for fresh data.
  The search is case-insensitive and searches across name, email, initials, and company fields.`,
  
    inputSchema: z.object({
      query: z.string()
        .optional()
        .describe('Search query to find people (searches name, email, initials, company fields)'),
      limit: z.number()
        .min(0)
        .default(0)
        .describe('Maximum number of results to return (0 for unlimited, default: unlimited)')
    }),
  
    outputSchema: z.object({
      people: z.array(z.object({
        id: z.number(),
        name: z.string(),
        email: z.string().optional(),
        initials: z.string(),
        company: z.string().optional(),
        status: z.string()
      })),
      totalFound: z.number(),
      query: z.string().optional(),
      message: z.string()
    }),
  
    execute: async ({ context }) => {
      try {
        const { query, limit = 0 } = context;
      
        console.log(`🔍 Searching people with query: "${query || 'all'}", limit: ${limit}`);
        
        // Auto-detect freshness keywords and purge cache if needed
        const freshnessKeywords = ['fresh', 'new', 'latest', 'updated', 'current', 'recent', 'purge', 'clear', 'refresh', 'reload', 'real-time', 'live', 'now', 'today'];
        const queryText = (query || '').toLowerCase();
        const needsFreshData = freshnessKeywords.some(keyword => queryText.includes(keyword));
        
        if (needsFreshData) {
          console.log(`[AUTO CACHE PURGE] Detected freshness keywords in "${query}", purging cache...`);
          workbookClient.resources.clearCache();
        }
      
        let resourcesResponse;
      
        if (query) {
        // Check if query looks like an email domain
          if (query.includes('.') && (query.startsWith('@') || query.includes('.'))) {
            const domain = query.replace('@', '');
            resourcesResponse = await workbookClient.resources.searchByEmailDomain(domain);
          }
          // Check if query might be a company name
          else if (query.toLowerCase().includes('company') || query.toLowerCase().includes('corp') || 
                 query.toLowerCase().includes('inc') || query.toLowerCase().includes('ltd')) {
            resourcesResponse = await workbookClient.resources.searchByCompany(query);
          }
          // For name/initials searches
          else {
            resourcesResponse = await workbookClient.resources.searchByName(query);
          }
        } else {
        // No query provided, get all people (use complete dataset)
          resourcesResponse = await workbookClient.resources.getAllResourcesComplete();
        }

        if (!resourcesResponse.success) {
          return {
            people: [],
            totalFound: 0,
            query: query || '',
            message: `Error searching people: ${resourcesResponse.error}`
          };
        }

        const resources = resourcesResponse.data || [];
      
        // Apply limit and format people
        const limitedResources = limit > 0 ? resources.slice(0, limit) : resources;
        const formattedPeople = limitedResources.map((resource: Resource) => ({
          id: resource.Id,
          name: resource.Name || 'Unknown',
          email: resource.Email || '',
          initials: resource.Initials || '',
          company: resource.ResourceFolder || '',
          status: resource.Active ? 'Active' : 'Inactive'
        }));
      
        const cacheStatus = resourcesResponse.cached ? ' (cached)' : '';
        const message = query 
          ? `Found ${formattedPeople.length} people matching "${query}"${cacheStatus}`
          : `Retrieved ${formattedPeople.length} people${cacheStatus}`;
      
        return {
          people: formattedPeople,
          totalFound: formattedPeople.length,
          query: query || '',
          message: message
        };
      
      } catch (error) {
        console.error('❌ Error in searchPeopleTool:', error);
      
        return {
          people: [],
          totalFound: 0,
          query: context.query || '',
          message: `Error searching people: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }
  });
}

/**
 * Create people statistics tool
 * Factory function that accepts initialized WorkbookClient
 */
export function createGetContactStatsTool(workbookClient: WorkbookClient) {
  return createTool({
    id: 'get-people-stats',
    description: `Get statistics and overview of the Workbook CRM database. Use this tool when users ask for:
  - Total number of employees, companies, or contacts
  - Active vs inactive breakdown  
  - Number of companies in the system
  - Database overview or summary
  - "Fresh", "new", "latest" database statistics (auto-purges cache)
  
  Auto-detects freshness keywords and purges cache for up-to-date statistics.`,
  
    inputSchema: z.object({}), // No input parameters needed
  
    outputSchema: z.object({
      totalResources: z.number(),
      activeResources: z.number(),
      inactiveResources: z.number(),
      employees: z.number(),
      clients: z.number(),
      prospects: z.number(),
      suppliers: z.number(),
      contacts: z.number(),
      inactiveBreakdown: z.object({
        employees: z.number(),
        clients: z.number(),
        prospects: z.number(),
        suppliers: z.number(),
        contacts: z.number()
      }),
      message: z.string()
    }),
  
    execute: async () => {
      try {
        console.log('� Getting database statistics...');
      
        const statsResponse = await workbookClient.resources.getStats();
      
        if (!statsResponse.success) {
          return {
            totalResources: 0,
            activeResources: 0,
            inactiveResources: 0,
            employees: 0,
            clients: 0,
            prospects: 0,
            suppliers: 0,
            contacts: 0,
            inactiveBreakdown: {
              employees: 0,
              clients: 0,
              prospects: 0,
              suppliers: 0,
              contacts: 0
            },
            message: `Error getting statistics: ${statsResponse.error}`
          };
        }

        const stats = statsResponse.data!;
        const cacheStatus = statsResponse.cached ? ' (cached)' : '';
        
        // Extract counts by TypeId (based on correct CRM data analysis)
        const typeBreakdown = stats.byResourceType || {};
        const inactiveBreakdown = stats.inactiveByResourceType || {};
        
        const employees = typeBreakdown[ResourceTypes.EMPLOYEE] || 0; // TypeId 2 = Internal employees
        const clients = typeBreakdown[ResourceTypes.CLIENT] || 0; // TypeId 3 = Actual clients/customers
        const prospects = typeBreakdown[ResourceTypes.PROSPECT] || 0; // TypeId 6 = Potential clients  
        const suppliers = typeBreakdown[ResourceTypes.SUPPLIER] || 0; // TypeId 4 = Suppliers/vendors
        const contacts = typeBreakdown[ResourceTypes.CONTACT_PERSON] || 0; // TypeId 10 = Contact persons for clients
        
        const inactiveEmployees = inactiveBreakdown[ResourceTypes.EMPLOYEE] || 0;
        const inactiveClients = inactiveBreakdown[ResourceTypes.CLIENT] || 0;
        const inactiveProspects = inactiveBreakdown[ResourceTypes.PROSPECT] || 0;
        const inactiveSuppliers = inactiveBreakdown[ResourceTypes.SUPPLIER] || 0;
        const inactiveContacts = inactiveBreakdown[ResourceTypes.CONTACT_PERSON] || 0;
        
        const message = `Database contains: ${employees} active employees (${inactiveEmployees} inactive), ${clients} active clients (${inactiveClients} inactive), ${prospects} active prospects (${inactiveProspects} inactive), ${suppliers} active suppliers (${inactiveSuppliers} inactive), and ${contacts} active contact persons (${inactiveContacts} inactive). Total: ${stats.active} active, ${stats.inactive} inactive (${stats.total} total)${cacheStatus}.`;
      
        return {
          totalResources: stats.total,
          activeResources: stats.active,
          inactiveResources: stats.inactive,
          employees: employees,
          clients: clients,
          prospects: prospects,
          suppliers: suppliers,
          contacts: contacts,
          inactiveBreakdown: {
            employees: inactiveEmployees,
            clients: inactiveClients,
            prospects: inactiveProspects,
            suppliers: inactiveSuppliers,
            contacts: inactiveContacts
          },
          message: message
        };
      
      } catch (error) {
        console.error('❌ Error in getPeopleStatsTool:', error);
      
        return {
          totalResources: 0,
          activeResources: 0,
          inactiveResources: 0,
          employees: 0,
          clients: 0,
          prospects: 0,
          suppliers: 0,
          contacts: 0,
          inactiveBreakdown: {
            employees: 0,
            clients: 0,
            prospects: 0,
            suppliers: 0,
            contacts: 0
          },
          message: `Error getting statistics: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }
  });
}