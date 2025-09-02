import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { WorkbookClient } from '../../services/index.js';
import { ResourceTypes } from '../../constants/resourceTypes.js';
import { cacheManager } from '../../services/base/cache.js';
import { Resource, Contact } from '../../types/workbook.types.js';
import * as fs from 'fs';
import * as path from 'path';
import { ensureFreshData } from '../../utils/freshnessDetection.js';

/**
 * Handle bulk hierarchy mode - retrieve all companies with hierarchical data
 */
async function handleBulkHierarchyMode(workbookClient: WorkbookClient, includeHierarchy: boolean) {
  try {
    // Get all resources (use complete dataset)
    const resourcesResponse = await workbookClient.resources.getAllResourcesComplete();
    
    if (!resourcesResponse.success || !resourcesResponse.data) {
      return {
        companies: [],
        found: false,
        count: 0,
        message: `Error fetching resources: ${resourcesResponse.error}`
      };
    }

    const resources = resourcesResponse.data;
    
    // Filter to get companies (those with ResponsibleResourceId)
    const companies = resources.filter(r => r.ResponsibleResourceId && r.ResponsibleResourceId > 0);
    
    // Build hierarchical data
    const companiesWithDetails = await Promise.all(
      companies.map(async company => {
        // Find responsible employee
        const responsibleEmployee = company.ResponsibleResourceId
          ? resources.find(r => r.Id === company.ResponsibleResourceId)
          : undefined;
        
        let contacts: Contact[] = [];
        
        if (includeHierarchy) {
          const contactsResponse = await workbookClient.resources.getContactsForResource(company.Id);
          if (contactsResponse.success && contactsResponse.data) {
            contacts = contactsResponse.data;
          }
        }
        
        return {
          id: company.Id,
          name: company.Name || 'Unknown',
          typeId: company.TypeId || 0,
          active: company.Active,
          email: company.Email || '',
          phone: company.Phone1 || '',
          address: company.Address1 || '',
          city: company.City || '',
          country: company.Country || '',
          responsibleEmployee: responsibleEmployee?.Name || 'Unassigned',
          responsibleEmployeeId: company.ResponsibleResourceId || 0,
          contacts: includeHierarchy ? contacts : [],
          contactCount: contacts.length
        };
      })
    );
    
    // Generate meaningful summary for Teams message limits
    const cacheStatus = resourcesResponse.cached ? ' (cached)' : '';
    
    // Calculate summary statistics
    const activeCompanies = companiesWithDetails.filter(c => c.active);
    const inactiveCompanies = companiesWithDetails.filter(c => !c.active);
    const companiesWithContacts = companiesWithDetails.filter(c => c.contactCount > 0);
    const totalContacts = companiesWithDetails.reduce((sum, c) => sum + c.contactCount, 0);
    
    // Group by responsible employee
    const employeeStats = companiesWithDetails.reduce((acc, company) => {
      const employee = company.responsibleEmployee;
      if (!acc[employee]) {
        acc[employee] = { count: 0, companies: [] };
      }
      acc[employee].count++;
      acc[employee].companies.push(company.name);
      return acc;
    }, {} as Record<string, { count: number; companies: string[] }>);
    
    // Get top 5 employees by client count
    const topEmployees = Object.entries(employeeStats)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 5);
    
    // Get top 20 companies with details for meaningful output
    const topCompanies = companiesWithDetails
      .sort((a, b) => b.contactCount - a.contactCount)
      .slice(0, 20);
    
    // Generate CSV file for bulk data
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const fileName = `bulk-companies-${timestamp}.csv`;
    const exportsDir = path.join(process.cwd(), 'exports');
    
    // Ensure exports directory exists
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }
    
    const filePath = path.join(exportsDir, fileName);
    
    // Generate CSV content
    let csvContent = 'Company ID,Company Name,Status,Email,Phone,Address,City,Country,Responsible Employee,Contact Count,Contacts\n';
    
    companiesWithDetails.forEach(company => {
      const contactList = company.contacts.slice(0, 5).map(c => 
        `${c.Name} (${c.Email || 'no email'})`
      ).join('; ');
      
      csvContent += [
        company.id,
        `"${company.name.replace(/"/g, '""')}"`,
        company.active ? 'Active' : 'Inactive',
        company.email || '',
        company.phone || '',
        `"${(company.address || '').replace(/"/g, '""')}"`,
        company.city || '',
        company.country || '',
        `"${company.responsibleEmployee.replace(/"/g, '""')}"`,
        company.contactCount,
        `"${contactList}"`
      ].join(',') + '\n';
    });
    
    // Write CSV file
    fs.writeFileSync(filePath, csvContent, 'utf-8');
    console.log(`✅ Bulk export saved: ${filePath}`);
    
    // Build summary message (without the full data)
    let message = `📊 **Company Portfolio Analysis Complete**${cacheStatus}\n\n`;
    message += '**Summary Statistics:**\n';
    message += `• Total Companies: ${companiesWithDetails.length} (${activeCompanies.length} active, ${inactiveCompanies.length} inactive)\n`;
    message += `• Total Contacts: ${totalContacts} across ${companiesWithContacts.length} companies\n`;
    message += `• Average Contacts per Company: ${companiesWithContacts.length > 0 ? (totalContacts / companiesWithContacts.length).toFixed(1) : 0}\n\n`;
    
    message += '**Top 5 Account Managers:**\n';
    topEmployees.forEach(([name, stats], index) => {
      message += `${index + 1}. ${name}: ${stats.count} companies\n`;
    });
    
    // Group by country for geographic insights
    const countryStats = companiesWithDetails.reduce((acc, company) => {
      const country = company.country || 'Unknown';
      if (!acc[country]) {acc[country] = 0;}
      acc[country]++;
      return acc;
    }, {} as Record<string, number>);
    
    const topCountries = Object.entries(countryStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    message += '\n**Geographic Distribution (Top 5):**\n';
    topCountries.forEach(([country, count]) => {
      message += `• ${country}: ${count} companies\n`;
    });
    
    message += '\n📁 **Export Details:**\n';
    message += `• File: ${fileName}\n`;
    message += `• Location: ${filePath}\n`;
    message += '• Format: CSV with company details and contacts\n';
    message += `• Records: ${companiesWithDetails.length} companies exported\n\n`;
    message += '💡 **Next Steps:** Open the CSV file in Excel or any spreadsheet application for detailed analysis.';
    
    return {
      companies: [], // Don't return the full array to avoid token limits
      found: companiesWithDetails.length > 0,
      count: companiesWithDetails.length,
      message,
      filePath: filePath,
      fileName: fileName,
      // Add summary stats for programmatic use
      summary: {
        totalCompanies: companiesWithDetails.length,
        activeCompanies: activeCompanies.length,
        inactiveCompanies: inactiveCompanies.length,
        totalContacts: totalContacts,
        topEmployees: topEmployees.map(([name, stats]) => ({ name, count: stats.count })),
        sampleCompanies: topCompanies.slice(0, 3).map(c => c.name)
      }
    };
    
  } catch (error) {
    console.error('❌ Error in bulk hierarchy mode:', error);
    return {
      companies: [],
      found: false,
      count: 0,
      message: `Error in bulk hierarchy processing: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Create natural language company search tool using ResourceService
 * Factory function that accepts initialized WorkbookClient
 */
export function createCompanySearchTool(workbookClient: WorkbookClient) {
  return createTool({
    id: 'search-company-by-name',
    description: `🏢 COMPANY SEARCH TOOL - Searches and retrieves basic company data and information.

  PRIMARY USE CASES:
  ✅ "Show me all active clients" - basic company lists
  ✅ "List client companies" - simple company searches
  ✅ "Show all suppliers" - retrieve supplier data
  ✅ "ADECCO company details" - get company information
  ✅ "Clients managed by admin" - search by responsible employee
  ✅ "All inactive companies" - status-based searches
  ✅ "Companies starting with A" - name-based filtering
  
  🏗️ BULK HIERARCHY OPERATIONS (replaces hierarchicalSearchTool):
  ✅ "All companies with their full hierarchy structures"
  ✅ "Bulk export all client relationships and contacts" 
  ✅ "Mass hierarchy processing for data analysis"
  ✅ "Complete organizational structure mapping"
  
  ❌ DO NOT USE for:
  - Relationship trees or visualization requests (use relationshipMappingTool instead)
  - "Show relationship tree" or "visualize connections" (use relationshipMappingTool)
  - ASCII tree diagrams or relationship mapping (use relationshipMappingTool)
  - Network analysis or connection visualization (use relationshipMappingTool)
  - Data exports to files (use enhancedExportTool instead)
  - Location-based queries (use geographicAnalysisTool instead)
  
  This tool provides basic company data retrieval, not relationship visualization.`,
  
    inputSchema: z.object({
      companyName: z.string()
        .optional()
        .describe('Company name to search for (case-insensitive, supports partial matching). Not required when bulkMode=true.'),
      responsibleEmployee: z.string()
        .optional()
        .describe('Name of responsible employee to search clients for (e.g., "admin", "john")'),
      includeHierarchy: z.boolean()
        .default(true)
        .describe('Whether to include full hierarchy (contacts, responsible employee)'),
      multiple: z.boolean()
        .default(false)
        .describe('Whether to return multiple matching companies (true) or just the first match (false)'),
      bulkMode: z.boolean()
        .default(false)
        .describe('Bulk hierarchy processing: returns all companies with hierarchical data (ignores companyName filter)')
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
      message: z.string(),
      summary: z.object({
        totalCompanies: z.number(),
        activeCompanies: z.number(),
        inactiveCompanies: z.number(),
        totalContacts: z.number(),
        topEmployees: z.array(z.object({
          name: z.string(),
          count: z.number()
        })),
        sampleCompanies: z.array(z.string())
      }).optional()
    }),
  
    execute: async ({ context }) => {
      try {
        const { companyName, responsibleEmployee, includeHierarchy = true, multiple = false, bulkMode = false } = context;
        
        // Use universal freshness detection (Phase 7A)
        ensureFreshData(`company search ${companyName || responsibleEmployee || 'bulk'}`, 'companySearchTool');
        
        // Handle bulk mode - bypass normal validation
        if (bulkMode) {
          console.log('🏗️ Bulk hierarchy mode activated - retrieving all companies with hierarchical data');
          return await handleBulkHierarchyMode(workbookClient, includeHierarchy);
        }
        
        // Validate that at least one search criteria is provided for normal mode
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
                phone: company.Phone1,
                city: company.City,
                country: company.Country,
                responsibleEmployee: hierarchy?.responsibleEmployee?.Name,
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
                phone: company.Phone1,
                city: company.City,
                country: company.Country,
                responsibleEmployee: undefined, // Not fetched in non-hierarchy mode
                hierarchy: undefined
              });
            }
          }
        
          // Build detailed message with actual company data
          let multiMessage = `**Found ${companies.length} companies matching "${companyName}"**\n\n`;
          
          results.forEach((company, index) => {
            multiMessage += `${index + 1}. **${company.name}**\n`;
            multiMessage += `   • Status: ${company.active ? 'Active' : 'Inactive'}\n`;
            if (company.email) {multiMessage += `   • Email: ${company.email}\n`;}
            if (company.phone) {multiMessage += `   • Phone: ${company.phone}\n`;}
            if (company.city || company.country) {
              multiMessage += `   • Location: ${[company.city, company.country].filter(Boolean).join(', ')}\n`;
            }
            if (company.responsibleEmployee) {
              multiMessage += `   • Responsible: ${company.responsibleEmployee}\n`;
            }
            multiMessage += '\n';
          });
          
          if (companies.length > 10) {
            multiMessage += `... and ${companies.length - 10} more companies. Use export tools for complete list.`;
          }
          
          return {
            companies: results,
            found: true,
            count: companies.length,
            message: multiMessage
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
          
          // Build detailed message with actual contact information
          let detailedMessage = `**Company: ${hierarchy.resource.Name}**\n\n`;
          detailedMessage += '**Company Details:**\n';
          detailedMessage += `• Status: ${hierarchy.resource.Active ? 'Active' : 'Inactive'}\n`;
          detailedMessage += `• Email: ${hierarchy.resource.Email || 'Not provided'}\n`;
          detailedMessage += `• Phone: ${hierarchy.resource.Phone1 || 'Not provided'}\n`;
          detailedMessage += `• Address: ${hierarchy.resource.Address1 || 'Not provided'}\n`;
          if (hierarchy.resource.City || hierarchy.resource.Country) {
            detailedMessage += `• Location: ${[hierarchy.resource.City, hierarchy.resource.Country].filter(Boolean).join(', ')}\n`;
          }
          detailedMessage += `• Responsible Employee: ${hierarchy.responsibleEmployee?.Name || 'None assigned'}\n`;
          detailedMessage += `• Total Contacts: ${hierarchy.contacts.length}\n`;
          
          if (includeHierarchy && hierarchy.contacts.length > 0) {
            detailedMessage += `\n**Contact Persons (${Math.min(10, hierarchy.contacts.length)} of ${hierarchy.contacts.length}):**\n`;
            hierarchy.contacts.slice(0, 10).forEach((contact, index) => {
              detailedMessage += `${index + 1}. **${contact.Name}**\n`;
              if (contact.Title) {detailedMessage += `   • Title: ${contact.Title}\n`;}
              if (contact.Email) {detailedMessage += `   • Email: ${contact.Email}\n`;}
              if (contact.Phone1) {detailedMessage += `   • Phone: ${contact.Phone1}\n`;}
              if (contact.CellPhone) {detailedMessage += `   • Mobile: ${contact.CellPhone}\n`;}
            });
            
            if (hierarchy.contacts.length > 10) {
              detailedMessage += `\n... and ${hierarchy.contacts.length - 10} more contacts.\n`;
            }
          }
          
        
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
            message: detailedMessage
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