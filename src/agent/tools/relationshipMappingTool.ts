import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { WorkbookClient, HierarchicalResource } from '../../services/index.js';

/**
 * Create relationship mapping tool for visualizing company hierarchies and connections
 * Factory function that accepts initialized WorkbookClient
 */
export function createRelationshipMappingTool(workbookClient: WorkbookClient) {
  return createTool({
  id: 'relationship-mapping',
  description: `Map and visualize relationships between companies, contacts, and employees in Workbook CRM. Use this tool to:
  - View company hierarchical structures
  - See contact-company relationships
  - Identify responsible employees
  - Generate ASCII tree visualizations
  - Analyze connection strength
  
  Provides comprehensive relationship mapping with visual representations.`,
  
  inputSchema: z.object({
    companyId: z.number()
      .optional()
      .describe('Specific company ID to map relationships for'),
    companyName: z.string()
      .optional()
      .describe('Company name to search for (alternative to ID)'),
    includeVisualization: z.boolean()
      .default(true)
      .describe('Whether to generate ASCII tree visualization'),
    maxDepth: z.number()
      .min(1)
      .max(5)
      .default(3)
      .describe('Maximum depth for relationship tree (1-5, default: 3)'),
    includeInactive: z.boolean()
      .default(false)
      .describe('Whether to include inactive resources in the mapping')
  }),
  
  outputSchema: z.object({
    relationships: z.array(z.object({
      companyId: z.number(),
      companyName: z.string(),
      companyType: z.string(),
      active: z.boolean(),
      responsibleEmployee: z.object({
        id: z.number(),
        name: z.string(),
        email: z.string().optional()
      }).optional(),
      structure: z.object({
        contacts: z.array(z.object({
          id: z.number(),
          name: z.string(),
          email: z.string().optional(),
          phone: z.string().optional()
        })),
        portfolioCompanies: z.array(z.object({
          id: z.number(),
          name: z.string()
        })),
        relatedEmployees: z.array(z.object({
          id: z.number(),
          name: z.string(),
          role: z.string()
        }))
      }),
      connectionStrength: z.number(),
      strengthReason: z.string()
    })),
    networkMap: z.string().optional(),
    totalMapped: z.number(),
    message: z.string()
  }),
  
  execute: async ({ context }) => {
    try {
      const { 
        companyId, 
        companyName,
        includeVisualization = true,
        maxDepth = 3,
        includeInactive = false
      } = context;
      
      console.log('🗺️ Starting relationship mapping...');
      
      // Determine which companies to map
      let targetCompanies: any[] = [];
      
      if (companyId) {
        // Get specific company by ID
        const companyResponse = await workbookClient.resources.getById(companyId);
        if (companyResponse.success && companyResponse.data) {
          targetCompanies = [companyResponse.data];
        }
      } else if (companyName) {
        // Search for company by name
        const searchResponse = await workbookClient.resources.findCompaniesByName(companyName);
        if (searchResponse.success && searchResponse.data) {
          targetCompanies = searchResponse.data.slice(0, 5); // Limit to 5 for performance
        }
      } else {
        // Get all companies with hierarchical data
        const allResourcesResponse = await workbookClient.resources.getAllResourcesComplete();
        if (allResourcesResponse.success && allResourcesResponse.data) {
          targetCompanies = allResourcesResponse.data
            .filter(r => (r.TypeId === 1 || r.TypeId === 3) && r.ResponsibleResourceId)
            .slice(0, 10); // Limit to 10 for performance
        }
      }
      
      // Filter by active status if requested
      if (!includeInactive) {
        targetCompanies = targetCompanies.filter(c => c.Active);
      }
      
      if (targetCompanies.length === 0) {
        return {
          relationships: [],
          totalMapped: 0,
          message: 'No companies found matching the criteria'
        };
      }
      
      // Build relationship data for each company
      const relationships = await Promise.all(
        targetCompanies.map(async company => {
          // Get hierarchical structure
          const hierarchyResponse = await workbookClient.resources.getHierarchicalStructure(company.Id);
          const hierarchy = hierarchyResponse.success && hierarchyResponse.data ? hierarchyResponse.data[0] : null;
          
          // Get responsible employee details
          let responsibleEmployee;
          if (company.ResponsibleResourceId) {
            const employeeResponse = await workbookClient.resources.getById(company.ResponsibleResourceId);
            if (employeeResponse.success && employeeResponse.data) {
              responsibleEmployee = {
                id: employeeResponse.data.Id,
                name: employeeResponse.data.Name || 'Unknown',
                email: employeeResponse.data.Email || undefined
              };
            }
          }
          
          // Extract contacts from hierarchy
          const contacts = hierarchy?.contacts || [];
          
          // Find other companies managed by the same account manager
          // This shows the account manager's full client portfolio, not subsidiaries
          const allResourcesResponse = await workbookClient.resources.getAllResourcesComplete();
          const allResources = allResourcesResponse.success ? allResourcesResponse.data : [];
          
          const portfolioCompanies = company.ResponsibleResourceId ? allResources
            ?.filter(r => 
              r.ResponsibleResourceId === company.ResponsibleResourceId &&
              r.Id !== company.Id &&
              (r.TypeId === 1 || r.TypeId === 3) &&
              r.Active // Only show active clients in portfolio
            )
            .slice(0, 5) // Limit for display
            .map(pc => ({
              id: pc.Id,
              name: pc.Name || 'Unknown'
            })) || [] : [];
          
          // Find related employees (just the responsible employee)
          const relatedEmployees = hierarchy?.responsibleEmployee 
            ? [{
                id: hierarchy.responsibleEmployee.Id,
                name: hierarchy.responsibleEmployee.Name || 'Unknown',
                role: 'Account Manager'
              }]
            : [];
          
          // Calculate connection strength (0-100)
          let connectionStrength = 0;
          let strengthFactors: string[] = [];
          
          // Has responsible employee: +30
          if (responsibleEmployee) {
            connectionStrength += 30;
            strengthFactors.push('Has dedicated account manager');
          }
          
          // Contact count: up to +40
          const contactScore = Math.min(contacts.length * 10, 40);
          connectionStrength += contactScore;
          if (contacts.length > 0) {
            strengthFactors.push(`${contacts.length} contact${contacts.length > 1 ? 's' : ''}`);
          }
          
          // Active status: +20
          if (company.Active) {
            connectionStrength += 20;
            strengthFactors.push('Active client');
          }
          
          // Has email: +10
          if (company.Email) {
            connectionStrength += 10;
            strengthFactors.push('Has email');
          }
          
          const strengthReason = strengthFactors.length > 0 
            ? strengthFactors.join(', ')
            : 'No connection factors';
          
          const typeNames = { 1: 'Company', 2: 'Employee', 3: 'Client' };
          const companyType = typeNames[company.TypeId as keyof typeof typeNames] || `Type${company.TypeId}`;
          
          return {
            companyId: company.Id,
            companyName: company.Name || 'Unknown',
            companyType,
            active: company.Active,
            responsibleEmployee,
            structure: {
              contacts: contacts.slice(0, 5).map((c: any) => ({
                id: c.Id || 0,
                name: c.Name || 'Unknown',
                email: c.Email || undefined,
                phone: c.Phone1 || undefined
              })),
              portfolioCompanies,
              relatedEmployees
            },
            connectionStrength: Math.min(connectionStrength, 100),
            strengthReason
          };
        })
      );
      
      // Generate ASCII tree visualization if requested
      let networkMap = '';
      if (includeVisualization && relationships.length > 0) {
        networkMap = generateASCIITree(relationships, maxDepth);
      }
      
      return {
        relationships,
        networkMap: includeVisualization ? networkMap : undefined,
        totalMapped: relationships.length,
        message: `Mapped ${relationships.length} company relationship${relationships.length !== 1 ? 's' : ''}`
      };
      
    } catch (error) {
      console.error('❌ Error in relationshipMappingTool:', error);
      
      return {
        relationships: [],
        totalMapped: 0,
        message: `Error mapping relationships: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  });
}

/**
 * Generate ASCII tree visualization of relationships
 */
function generateASCIITree(relationships: any[], maxDepth: number): string {
  const lines: string[] = [];
  lines.push('🏢 Company Relationship Map');
  lines.push('═══════════════════════════');
  lines.push('');
  
  relationships.forEach((rel, index) => {
    const isLast = index === relationships.length - 1;
    const prefix = isLast ? '└── ' : '├── ';
    const continuationPrefix = isLast ? '    ' : '│   ';
    
    // Company line
    const status = rel.active ? '✓' : '✗';
    const strength = '●'.repeat(Math.ceil(rel.connectionStrength / 20));
    lines.push(`${prefix}📁 ${rel.companyName} [${status}] ${strength}`);
    
    // Responsible employee
    if (rel.responsibleEmployee) {
      lines.push(`${continuationPrefix}├── 👤 Managed by: ${rel.responsibleEmployee.name}`);
    }
    
    // Contacts
    if (rel.structure.contacts.length > 0) {
      lines.push(`${continuationPrefix}├── 📧 Contacts (${rel.structure.contacts.length}):`);
      rel.structure.contacts.forEach((contact: any, cIndex: number) => {
        const contactPrefix = cIndex === rel.structure.contacts.length - 1 ? '└── ' : '├── ';
        const email = contact.email ? ` <${contact.email}>` : '';
        lines.push(`${continuationPrefix}│   ${contactPrefix}${contact.name}${email}`);
      });
    }
    
    // Portfolio companies (other clients of same account manager)
    if (rel.structure.portfolioCompanies.length > 0) {
      lines.push(`${continuationPrefix}└── 👥 Account Manager's Other Clients (${rel.structure.portfolioCompanies.length}):`);
      rel.structure.portfolioCompanies.forEach((portfolio: any, sIndex: number) => {
        const portfolioPrefix = sIndex === rel.structure.portfolioCompanies.length - 1 ? '└── ' : '├── ';
        lines.push(`${continuationPrefix}    ${portfolioPrefix}${portfolio.name}`);
      });
    }
    
    lines.push('');
  });
  
  // Add legend
  lines.push('Legend: ✓ Active | ✗ Inactive | ● Connection Strength');
  
  return lines.join('\n');
}