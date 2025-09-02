import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { WorkbookClient, RelationshipService } from '../../services/index.js';
import { ResourceTypes } from '../../constants/resourceTypes.js';
import { ensureFreshData } from '../../utils/freshnessDetection.js';

/**
 * Create relationship mapping tool for visualizing company hierarchies and connections
 * Factory function that accepts initialized WorkbookClient
 */
export function createRelationshipMappingTool(workbookClient: WorkbookClient) {
  return createTool({
    id: 'relationship-mapping',
    description: `RELATIONSHIP MAPPING TOOL - Use this tool specifically for visualizing and mapping relationships between entities.

  PRIMARY USE CASES:
  - Generate relationship trees and hierarchical visualizations (ASCII format)
  - Map networks between clients, contacts, and employees
  - Visualize employee-to-company responsibility mappings
  - Show comprehensive relationship structures with depth analysis
  - Create connection strength analysis and relationship diagrams
  
  DO NOT USE for:
  - Simple company searches or data retrieval (use companySearchTool instead)
  - Basic contact lookups (use searchContactsTool instead)
  - Data exports or file generation (use enhancedExportTool instead)
  - Geographic analysis (use geographicAnalysisTool instead)
  
  This tool focuses on relationship visualization and mapping, not basic data retrieval.`,
  
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
        
        // Use universal freshness detection (Phase 7A)
        ensureFreshData('relationship mapping', 'relationshipMappingTool');
      
        // Initialize relationship service
        const relationshipService = new RelationshipService(workbookClient);
        
        // Determine target companies for mapping
        let targetCompanyIds: number[] = [];
      
        if (companyId) {
          // Get specific company by ID
          targetCompanyIds = [companyId];
        } else if (companyName) {
          // Search for company by name
          const searchResponse = await workbookClient.resources.findCompaniesByName(companyName);
          if (searchResponse.success && searchResponse.data) {
            targetCompanyIds = searchResponse.data.slice(0, 5).map(c => c.Id); // Limit to 5 for performance
          }
        } else {
          // Get top companies with hierarchical data
          const allResourcesResponse = await workbookClient.resources.getAllResourcesComplete();
          if (allResourcesResponse.success && allResourcesResponse.data) {
            targetCompanyIds = allResourcesResponse.data
              .filter(r => (r.TypeId === ResourceTypes.CLIENT || 
                           r.TypeId === ResourceTypes.SUPPLIER ||
                           r.TypeId === ResourceTypes.PROSPECT) && 
                           (includeInactive || r.Active))
              .slice(0, 10) // Limit to 10 for performance
              .map(r => r.Id);
          }
        }
      
        if (targetCompanyIds.length === 0) {
          return {
            relationships: [],
            totalMapped: 0,
            message: 'No companies found matching the criteria'
          };
        }
      
        // Create relationship map using the service
        let relationshipMap;
        
        if (targetCompanyIds.length === 1) {
          // Single company relationship mapping
          relationshipMap = await relationshipService.createCompanyRelationshipMap(targetCompanyIds[0], {
            maxDepth,
            includeInactive,
            includeVisualization
          });
        } else {
          // Multi-company network mapping
          relationshipMap = await relationshipService.createNetworkRelationshipMap(targetCompanyIds, {
            maxDepth,
            includeInactive,
            includeVisualization
          });
        }
        
        // Convert RelationshipService format to tool output format
        const relationships = relationshipMap.nodes
          .filter(node => node.type === 'company')
          .map(companyNode => {
            // Find responsible employee for this company
            const responsibleConnection = relationshipMap.connections.find(c => 
              c.toId === companyNode.id && c.connectionType === 'responsible_for'
            );
            const responsibleEmployee = responsibleConnection 
              ? relationshipMap.nodes.find(n => n.id === responsibleConnection.fromId && n.type === 'employee')
              : undefined;
            
            // Find contacts for this company
            const contactConnections = relationshipMap.connections.filter(c => 
              c.toId === companyNode.id && c.connectionType === 'contact_of'
            );
            const contacts = contactConnections.map(conn => {
              const contact = relationshipMap.nodes.find(n => n.id === conn.fromId && n.type === 'contact');
              return contact ? {
                id: contact.id,
                name: contact.name,
                email: contact.email,
                phone: contact.phone
              } : null;
            }).filter(Boolean);
            
            // Find portfolio companies (other companies with same responsible employee)
            const portfolioCompanies: Array<{id: number; name: string}> = [];
            if (responsibleEmployee) {
              const otherResponsibleConnections = relationshipMap.connections.filter(c => 
                c.fromId === responsibleEmployee.id && 
                c.connectionType === 'responsible_for' && 
                c.toId !== companyNode.id
              );
              
              otherResponsibleConnections.forEach(conn => {
                const portfolioCompany = relationshipMap.nodes.find(n => n.id === conn.toId && n.type === 'company');
                if (portfolioCompany) {
                  portfolioCompanies.push({
                    id: portfolioCompany.id,
                    name: portfolioCompany.name
                  });
                }
              });
            }
            
            // Calculate connection strength from RelationshipService data
            const allConnections = relationshipMap.connections.filter(c => 
              c.fromId === companyNode.id || c.toId === companyNode.id
            );
            const avgStrength = allConnections.length > 0 
              ? allConnections.reduce((sum, conn) => sum + conn.strength, 0) / allConnections.length
              : 0;
            
            const strengthFactors = [];
            if (responsibleEmployee) {strengthFactors.push('Has dedicated account manager');}
            if (contacts.length > 0) {strengthFactors.push(`${contacts.length} contact person(s)`);}
            if (portfolioCompanies.length > 0) {strengthFactors.push(`Portfolio of ${portfolioCompanies.length} companies`);}
            if (companyNode.active) {strengthFactors.push('Active company');}
            
            return {
              companyId: companyNode.id,
              companyName: companyNode.name,
              companyType: getResourceTypeName(companyNode.resourceType),
              active: companyNode.active,
              responsibleEmployee: responsibleEmployee ? {
                id: responsibleEmployee.id,
                name: responsibleEmployee.name,
                email: responsibleEmployee.email
              } : undefined,
              structure: {
                contacts: contacts as Array<{id: number; name: string; email?: string; phone?: string}>,
                portfolioCompanies,
                relatedEmployees: responsibleEmployee ? [{
                  id: responsibleEmployee.id,
                  name: responsibleEmployee.name,
                  role: 'Account Manager'
                }] : []
              },
              connectionStrength: Math.round(avgStrength * 100),
              strengthReason: strengthFactors.join(', ') || 'Basic company information available'
            };
          });
        
        return {
          relationships,
          networkMap: includeVisualization ? relationshipMap.visualTree : undefined,
          totalMapped: relationshipMap.totalNodes,
          message: `✅ Successfully mapped ${relationships.length} companies with ${relationshipMap.connections.length} connections across ${relationshipMap.totalNodes} total entities (companies, contacts, employees).`
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
 * Convert resource type ID to human-readable name
 */
function getResourceTypeName(typeId: number): string {
  switch (typeId) {
  case ResourceTypes.CLIENT: return 'Client';
  case ResourceTypes.SUPPLIER: return 'Supplier'; 
  case ResourceTypes.PROSPECT: return 'Prospect';
  case ResourceTypes.EMPLOYEE: return 'Employee';
  case ResourceTypes.CONTACT_PERSON: return 'Contact';
  default: return 'Unknown';
  }
}
