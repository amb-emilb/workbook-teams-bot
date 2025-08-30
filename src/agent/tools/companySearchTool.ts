import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { WorkbookClient } from '../../services/index.js';
import { ResourceTypes } from '../../constants/resourceTypes.js';
import { cacheManager } from '../../services/base/cache.js';
import { Resource, Contact } from '../../types/workbook.types.js';

/**
 * Create natural language company search tool using ResourceService
 * Factory function that accepts initialized WorkbookClient
 */
export function createCompanySearchTool(workbookClient: WorkbookClient) {
  return createTool({
    id: 'search-company-by-name',
    description: `🏢 PRIMARY tool for COMPANIES (clients, suppliers, prospects), business entities, and LOCATION searches.

  Use this tool for:
  ✅ "Show me all active clients"
  ✅ "List client companies" 
  ✅ "Show all suppliers"
  ✅ "Find companies in Copenhagen/Denmark"
  ✅ "Show Danish clients"
  ✅ "ADECCO company details"
  ✅ "Clients managed by admin"
  ✅ "All inactive companies"
  
  Handles both search AND display for companies.
  Supports geographic filtering for location-based queries.
  
  IMPORTANT: Use this for COMPANIES (TypeId 3=Clients, 4=Suppliers, 6=Prospects), not individual people.
  For employees or contact persons, use searchContactsTool.
  For data exports, use enhancedExportTool.
  For complex analysis, use geographicAnalysisTool.`,
  
    inputSchema: z.object({
      companyName: z.string()
        .optional()
        .describe('Company name to search for (case-insensitive, supports partial matching)'),
      responsibleEmployee: z.string()
        .optional()
        .describe('Name of responsible employee to search clients for (e.g., "admin", "john")'),
      includeHierarchy: z.boolean()
        .default(true)
        .describe('Whether to include full hierarchy (contacts, responsible employee)'),
      multiple: z.boolean()
        .default(false)
        .describe('Whether to return multiple matching companies (true) or just the first match (false)')
    }),
  
    outputSchema: z.object({
      companies: z.array(z.object({
        id: z.number(),
        name: z.string(),
        typeId: z.number(),
        email: z.string().optional(),
        active: z.boolean(),
        hierarchy: z.object({
          responsibleEmployee: z.string().optional(),
          contactCount: z.number(),
          contacts: z.array(z.object({
            name: z.string(),
            email: z.string().optional(),
            phone: z.string().optional()
          }))
        }).optional()
      })),
      found: z.boolean(),
      count: z.number(),
      message: z.string()
    }),
  
    execute: async ({ context }) => {
      try {
        const { companyName, responsibleEmployee, includeHierarchy = true, multiple = false } = context;
        
        // Validate that at least one search criteria is provided
        if (!companyName && !responsibleEmployee) {
          return {
            companies: [],
            found: false,
            count: 0,
            message: 'Please provide either a company name or responsible employee name to search for.'
          };
        }
        
        // Handle responsible employee search
        if (responsibleEmployee) {
          console.log(`Searching for clients managed by employee: "${responsibleEmployee}"`);
          const result = await searchClientsByEmployee(workbookClient, responsibleEmployee, includeHierarchy);
          return result;
        }
        
        if (!companyName) {
          return {
            companies: [],
            found: false,
            count: 0,
            message: 'Please provide a company name to search for.'
          };
        }
      
        console.log(`Searching for ${multiple ? 'companies' : 'company'}: "${companyName}"${includeHierarchy ? ' with hierarchy' : ''}`);
        
        // Auto-detect freshness keywords and purge cache if needed
        const freshnessKeywords = ['fresh', 'new', 'latest', 'updated', 'current', 'recent', 'purge', 'clear', 'refresh', 'reload', 'real-time', 'live', 'now', 'today'];
        const queryText = companyName!.toLowerCase();
        const needsFreshData = freshnessKeywords.some(keyword => queryText.includes(keyword));
        
        if (needsFreshData) {
          console.log(`[AUTO CACHE PURGE] Detected freshness keywords in "${companyName}", flushing entire cache...`);
          cacheManager.flush();
        }
      
        if (multiple && companyName) {
        // Determine search type based on query
          let companiesResponse;
          // If searching for single letters, assume "starts with" intent
          if (companyName.length === 1 && /^[A-Z]$/i.test(companyName)) {
            console.log(`Detected single letter search - using "starts with" for "${companyName}"`);
            companiesResponse = await workbookClient.resources.findCompaniesStartingWith(companyName);
          } else if (companyName.toLowerCase().includes('starting with') || companyName.toLowerCase().includes('begins with')) {
          // Extract the prefix from queries like "starting with A"
            const prefix = companyName.split(/starting with|begins with/i)[1]?.trim() || companyName;
            companiesResponse = await workbookClient.resources.findCompaniesStartingWith(prefix);
          } else {
          // Use contains search for general queries
            companiesResponse = await workbookClient.resources.findCompaniesByName(companyName);
          }
        
          if (!companiesResponse.success) {
            return {
              companies: [],
              found: false,
              count: 0,
              message: `Error searching for companies "${companyName}": ${companiesResponse.error}`
            };
          }
        
          const companies = companiesResponse.data || [];
        
          if (companies.length === 0) {
            return {
              companies: [],
              found: false,
              count: 0,
              message: `No companies found matching "${companyName}"`
            };
          }
        
          // Build company results (with hierarchy if requested)
          const results = [];
        
          for (const company of companies) {
            if (includeHierarchy) {
              const hierarchyResponse = await workbookClient.resources.getHierarchicalStructure(company.Id);
              const hierarchy = hierarchyResponse.success && hierarchyResponse.data ? hierarchyResponse.data[0] : null;
            
              results.push({
                id: company.Id,
                name: company.Name,
                typeId: company.TypeId || 0,
                email: company.Email,
                active: company.Active,
                hierarchy: hierarchy ? {
                  responsibleEmployee: hierarchy.responsibleEmployee?.Name,
                  contactCount: hierarchy.contacts.length,
                  contacts: hierarchy.contacts.slice(0, 3).map(c => ({
                    name: c.Name,
                    email: c.Email,
                    phone: c.Phone1
                  }))
                } : undefined
              });
            } else {
              results.push({
                id: company.Id,
                name: company.Name,
                typeId: company.TypeId || 0,
                email: company.Email,
                active: company.Active,
                hierarchy: undefined
              });
            }
          }
        
          return {
            companies: results,
            found: true,
            count: companies.length,
            message: `Found ${companies.length} companies matching "${companyName}"${companies.length > 10 ? ' (showing first 10)' : ''}`
          };
        
        } else if (companyName) {
        // Single company lookup with hierarchy
          const hierarchyResponse = await workbookClient.resources.getHierarchicalStructureByName(companyName);
        
          if (!hierarchyResponse.success) {
            return {
              companies: [],
              found: false,
              count: 0,
              message: `Error searching for company "${companyName}": ${hierarchyResponse.error}`
            };
          }
        
          if (!hierarchyResponse.data) {
            return {
              companies: [],
              found: false,
              count: 0,
              message: `Company "${companyName}" not found`
            };
          }
        
          const hierarchy = hierarchyResponse.data;
        
          return {
            companies: [{
              id: hierarchy.resource.Id,
              name: hierarchy.resource.Name,
              typeId: hierarchy.resource.TypeId || 0,
              email: hierarchy.resource.Email,
              active: hierarchy.resource.Active,
              hierarchy: includeHierarchy ? {
                responsibleEmployee: hierarchy.responsibleEmployee?.Name,
                contactCount: hierarchy.contacts.length,
                contacts: hierarchy.contacts.slice(0, 5).map(c => ({
                  name: c.Name,
                  email: c.Email,
                  phone: c.Phone1
                }))
              } : undefined
            }],
            found: true,
            count: 1,
            message: `Found company "${hierarchy.resource.Name}" with ${hierarchy.contacts.length} contacts and responsible employee: ${hierarchy.responsibleEmployee?.Name || 'None'}`
          };
        } else {
          return {
            companies: [],
            found: false,
            count: 0,
            message: 'No search criteria provided.'
          };
        }
      
      } catch (error) {
        console.error('❌ Error in companySearchTool:', error);
      
        return {
          companies: [],
          found: false,
          count: 0,
          message: `Error searching for company "${context.companyName}": ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }
  });
}

/**
 * Helper function to search for clients by responsible employee
 */
async function searchClientsByEmployee(workbookClient: WorkbookClient, employeeName: string, includeHierarchy: boolean) {
  try {
    // Step 1: Find the employee by name using general search
    const searchResponse = await workbookClient.resources.search({ NameContains: employeeName });
    if (!searchResponse.success || !searchResponse.data) {
      return {
        companies: [],
        found: false,
        count: 0,
        message: 'Unable to search for employees in Workbook API.'
      };
    }
    
    const matchingEmployees = searchResponse.data.filter((emp: Resource) => 
      emp.TypeId === ResourceTypes.EMPLOYEE && 
      (emp.Name?.toLowerCase().includes(employeeName.toLowerCase()) ||
       emp.Initials?.toLowerCase().includes(employeeName.toLowerCase()))
    );
    
    if (matchingEmployees.length === 0) {
      return {
        companies: [],
        found: false,
        count: 0,
        message: `No employees found matching "${employeeName}". Please check the spelling or try a partial name.`
      };
    }
    
    // Use the first matching employee
    const employee = matchingEmployees[0];
    const employeeId = employee.Id;
    
    console.log(`[CLIENT SEARCH] Found employee: ${employee.Name} (ID: ${employeeId})`);
    
    // Step 2: Get clients and prospects assigned to this employee
    const assignedClients: Array<{
      id: number;
      name: string;
      typeId: number;
      email?: string;
      active: boolean;
      hierarchy?: {
        responsibleEmployee: string;
        contactCount: number;
        contacts: Array<{ name: string; email?: string; phone?: string }>;
      };
    }> = [];
    
    // Search for companies (which includes clients and prospects)
    const companiesResponse = await workbookClient.resources.findCompaniesByName('');
    if (!companiesResponse.success || !companiesResponse.data) {
      return {
        companies: [],
        found: false,
        count: 0,
        message: 'Unable to retrieve companies from Workbook API.'
      };
    }
    
    const employeeClients = companiesResponse.data.filter((client: Resource) => 
      client.ResponsibleResourceId === employeeId && 
      client.Active && 
      (client.TypeId === ResourceTypes.CLIENT || client.TypeId === ResourceTypes.SUPPLIER || client.TypeId === ResourceTypes.PROSPECT)
    );
      
    // Enrich with hierarchy if requested
    for (const client of employeeClients) {
      try {
        if (includeHierarchy) {
          const hierarchyResponse = await workbookClient.resources.getHierarchicalStructureByName(client.Name);
          const hierarchy = hierarchyResponse.success ? hierarchyResponse.data : null;
          
          assignedClients.push({
            id: client.Id || 0,
            name: client.Name,
            typeId: client.TypeId || 0,
            email: client.Email,
            active: client.Active,
            hierarchy: {
              responsibleEmployee: employee.Name,
              contactCount: hierarchy?.contacts?.length || 0,
              contacts: hierarchy?.contacts?.slice(0, 5).map((c: Contact) => ({
                name: c.Name,
                email: c.Email,
                phone: c.Phone1
              })) || []
            }
          });
        } else {
          assignedClients.push({
            id: client.Id || 0,
            name: client.Name,
            typeId: client.TypeId || 0,
            email: client.Email,
            active: client.Active
          });
        }
      } catch (hierarchyError) {
        console.warn(`[CLIENT SEARCH] Failed to get hierarchy for client ${client.Id}:`, hierarchyError);
        assignedClients.push({
          id: client.Id || 0,
          name: client.Name,
          typeId: client.TypeId || 0,
          email: client.Email,
          active: client.Active,
          hierarchy: includeHierarchy ? {
            responsibleEmployee: employee.Name,
            contactCount: 0,
            contacts: []
          } : undefined
        });
      }
    }
    
    const message = assignedClients.length > 0 
      ? `Found ${assignedClients.length} active clients and prospects managed by ${employee.Name}.`
      : `${employee.Name} currently does not have any active clients or prospects assigned under their responsibility.`;
    
    return {
      companies: assignedClients,
      found: assignedClients.length > 0,
      count: assignedClients.length,
      message
    };
    
  } catch (error) {
    console.error('[CLIENT SEARCH] Error searching by employee:', error);
    throw new Error(`Failed to search for clients managed by ${employeeName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}