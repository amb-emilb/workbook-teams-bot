import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { WorkbookClient, Resource } from '../../services/index.js';
import { ResourceTypes } from '../../constants/resourceTypes.js';
import { ensureFreshData } from '../../utils/freshnessDetection.js';

/**
 * Create search people tool for the Workbook CRM system
 * Factory function that accepts initialized WorkbookClient
 */
export function createSearchContactsTool(workbookClient: WorkbookClient) {
  return createTool({
    id: 'search-people',
    description: `Search for PEOPLE/INDIVIDUALS in the Workbook CRM system (employees and contact persons). Use this tool when users ask for:
  - "employees" or "staff" or "workers" 
  - "contact persons" or "contacts" (people working at client companies)
  - Individual people by name, email, or contact details
  - Employee information or contact person details
  - Person-specific data (names, emails, phone numbers)
  - "Show me employees" or "list of contact persons"
  
  IMPORTANT: This tool searches both EMPLOYEES (Type 2) and CONTACT PERSONS (Type 10).
  For CLIENT COMPANIES, use the company search tool instead.
  
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
      
        console.log(`Searching people with query: "${query || 'all'}", limit: ${limit}`);
        
        // Use universal freshness detection (Phase 7A)
        ensureFreshData(query || 'all', 'searchContactsTool');
      
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
          // Handle "all employees", "all staff", "employees", "staff" queries
          else if (query.toLowerCase().includes('employee') || query.toLowerCase().includes('staff') || 
                  query.toLowerCase().includes('all') || query.toLowerCase() === 'employees' ||
                  query.toLowerCase() === 'staff') {
            resourcesResponse = await workbookClient.resources.getAllResourcesComplete();
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
        
        // Filter for only people types (employees and contact persons)
        const peopleResources = resources.filter((resource: Resource) => 
          resource.TypeId === ResourceTypes.EMPLOYEE || resource.TypeId === ResourceTypes.CONTACT_PERSON
        );
      
        // Apply limit and format people
        const limitedResources = limit > 0 ? peopleResources.slice(0, limit) : peopleResources;
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
          totalFound: peopleResources.length, // Total people found before limit
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
    description: `📊 PRIMARY tool for DATABASE STATISTICS and overview numbers.

  Use this tool for:
  ✅ "Database statistics"
  ✅ "Give me database overview"
  ✅ "How many clients/employees total?"
  ✅ "Active vs inactive breakdown"
  ✅ "Which resource types have most inactive entries"
  ✅ "Compare prospects to clients"
  ✅ "Resource type summary"
  ✅ "Fresh/latest stats"
  
  🎯 HANDLES ALL ACTIVE/INACTIVE ANALYSIS - not a data quality issue!
  
  Returns numerical summaries and breakdowns, not individual records.
  Auto-purges cache for fresh data when requested.
  
  DO NOT use for finding specific companies or people - use specialized search tools.`,
  
    inputSchema: z.object({
      query: z.string()
        .optional()
        .describe('Optional context about the statistics request (used for detecting freshness keywords)')
    }), // Accept optional query for freshness detection
  
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
  
    execute: async ({ context }) => {
      try {
        const { query } = context || {};
        console.log(`Getting database statistics... ${query ? `(context: "${query}")` : ''}`);
        
        // Use universal freshness detection (Phase 7A) - CRITICAL for database overviews
        ensureFreshData(query || 'overview', 'getContactStatsTool');
      
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