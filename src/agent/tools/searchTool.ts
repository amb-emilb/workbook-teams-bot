import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { WorkbookClient, Resource } from '../../services/index.js';

/**
 * Create search people tool for the Workbook CRM system
 * Factory function that accepts initialized WorkbookClient
 */
export function createSearchContactsTool(workbookClient: WorkbookClient) {
  return createTool({
    id: 'search-people',
    description: `Search for people in the Workbook CRM system (employees, clients, contacts). Use this tool when users ask to:
  - Find people by name, email, or company
  - Search for specific individuals or organizations
  - Look up customer/employee information
  - Get people details from the database
  
  The search is case-insensitive and searches across name, email, initials, and company fields.
  If no query is provided, returns all people.`,
  
    inputSchema: z.object({
      query: z.string()
        .optional()
        .describe('Search query to find people (searches name, email, initials, company fields)'),
      limit: z.number()
        .min(1)
        .max(50)
        .default(10)
        .describe('Maximum number of results to return (1-50, default: 10)')
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
        const { query, limit = 10 } = context;
      
        console.log(`🔍 Searching people with query: "${query || 'all'}", limit: ${limit}`);
      
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
        const limitedResources = resources.slice(0, limit);
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
  - Database overview or summary`,
  
    inputSchema: z.object({}), // No input parameters needed
  
    outputSchema: z.object({
      totalResources: z.number(),
      employees: z.number(),
      companies: z.number(),
      projects: z.number(),
      contacts: z.number(),
      message: z.string()
    }),
  
    execute: async () => {
      try {
        console.log('📊 Getting database statistics...');
      
        const statsResponse = await workbookClient.resources.getStats();
      
        if (!statsResponse.success) {
          return {
            totalResources: 0,
            employees: 0,
            companies: 0,
            projects: 0,
            contacts: 0,
            message: `Error getting statistics: ${statsResponse.error}`
          };
        }

        const stats = statsResponse.data!;
        const cacheStatus = statsResponse.cached ? ' (cached)' : '';
        
        // Extract counts by TypeId (based on actual data analysis)
        const typeBreakdown = stats.byResourceType || {};
        const employees = typeBreakdown[2] || 0; // TypeId 2 = Internal employees
        const companies = typeBreakdown[6] || 0; // TypeId 6 = Real companies/corporations  
        const projects = typeBreakdown[3] || 0; // TypeId 3 = Projects/departments
        const contacts = (typeBreakdown[4] || 0) + (typeBreakdown[10] || 0); // TypeId 4 & 10 = Individual contacts
      
        const message = `Database contains: ${employees} employees, ${companies} companies, ${projects} projects/departments, and ${contacts} contacts (${stats.total} total resources)${cacheStatus}.`;
      
        return {
          totalResources: stats.total,
          employees: employees,
          companies: companies,
          projects: projects,
          contacts: contacts,
          message: message
        };
      
      } catch (error) {
        console.error('❌ Error in getPeopleStatsTool:', error);
      
        return {
          totalResources: 0,
          employees: 0,
          companies: 0,
          projects: 0,
          contacts: 0,
          message: `Error getting statistics: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }
  });
}