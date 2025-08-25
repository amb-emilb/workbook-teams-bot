import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { WorkbookClient } from '../../services/index.js';

/**
 * Create natural language company search tool using ResourceService
 * Factory function that accepts initialized WorkbookClient
 */
export function createCompanySearchTool(workbookClient: WorkbookClient) {
  return createTool({
    id: 'search-company-by-name',
    description: `Find companies by name using natural language. Use this tool when users ask to:
  - Find a specific company by name (e.g., "ADECCO", "Microsoft", "Ambition")
  - Get company details and structure
  - Look up client information by company name
  
  This tool supports case-insensitive partial matching and returns full company hierarchy.`,
  
    inputSchema: z.object({
      companyName: z.string()
        .min(1)
        .describe('Company name to search for (case-insensitive, supports partial matching)'),
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
        const { companyName, includeHierarchy = true, multiple = false } = context;
      
        console.log(`🔍 Searching for ${multiple ? 'companies' : 'company'}: "${companyName}"${includeHierarchy ? ' with hierarchy' : ''}`);
      
        if (multiple) {
        // Determine search type based on query
          let companiesResponse;
          // If searching for single letters, assume "starts with" intent
          if (companyName.length === 1 && /^[A-Z]$/i.test(companyName)) {
            console.log(`🎯 Detected single letter search - using "starts with" for "${companyName}"`);
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
        
        } else {
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