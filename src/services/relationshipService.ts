import { WorkbookClient } from './workbookClient.js';
import { Resource } from '../types/workbook.types.js';
import { ResourceTypes } from '../constants/resourceTypes.js';

export interface RelationshipNode {
  id: number;
  name: string;
  type: 'company' | 'contact' | 'employee';
  resourceType: number;
  active: boolean;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  connectionStrength: number;
  connectionType: 'responsible' | 'contact' | 'hierarchy' | 'related';
  depth: number;
}

export interface RelationshipTree {
  rootNode: RelationshipNode;
  children: RelationshipTree[];
  connections: RelationshipConnection[];
}

export interface RelationshipConnection {
  fromId: number;
  toId: number;
  connectionType: 'responsible_for' | 'contact_of' | 'parent_of' | 'child_of' | 'related_to';
  strength: number;
  description: string;
}

export interface RelationshipMap {
  nodes: RelationshipNode[];
  connections: RelationshipConnection[];
  totalNodes: number;
  maxDepth: number;
  visualTree?: string;
}

/**
 * RelationshipService handles complex data relationships between companies, contacts, and employees
 */
export class RelationshipService {
  constructor(private workbookClient: WorkbookClient) {
    this.workbookClient = workbookClient;
  }

  /**
   * Create comprehensive relationship map for a specific company
   */
  async createCompanyRelationshipMap(
    companyId: number,
    options: {
      maxDepth?: number;
      includeInactive?: boolean;
      includeVisualization?: boolean;
    } = {}
  ): Promise<RelationshipMap> {
    const { maxDepth = 3, includeInactive = false, includeVisualization = true } = options;

    console.log(`🔗 Creating relationship map for company ${companyId} (depth: ${maxDepth})`);

    // Get the root company
    const rootCompanyResponse = await this.workbookClient.resources.getById(companyId);
    if (!rootCompanyResponse.success || !rootCompanyResponse.data) {
      throw new Error(`Company with ID ${companyId} not found`);
    }

    const rootCompany = rootCompanyResponse.data;
    const nodes: RelationshipNode[] = [];
    const connections: RelationshipConnection[] = [];

    // Create root node
    const rootNode: RelationshipNode = {
      id: rootCompany.Id,
      name: rootCompany.Name || 'Unknown Company',
      type: 'company',
      resourceType: rootCompany.TypeId || 0,
      active: rootCompany.Active,
      email: rootCompany.Email || undefined,
      phone: rootCompany.Phone1 || undefined,
      address: rootCompany.Address1 || undefined,
      city: rootCompany.City || undefined,
      country: rootCompany.Country || undefined,
      connectionStrength: 1.0,
      connectionType: 'hierarchy',
      depth: 0
    };

    nodes.push(rootNode);

    // Build relationship tree recursively
    await this.buildRelationshipTree(rootCompany, nodes, connections, 0, maxDepth, includeInactive);

    // Generate ASCII visualization if requested
    let visualTree: string | undefined;
    if (includeVisualization) {
      visualTree = this.generateVisualTree(nodes, connections, rootNode);
    }

    return {
      nodes,
      connections,
      totalNodes: nodes.length,
      maxDepth,
      visualTree
    };
  }

  /**
   * Create relationship map for multiple companies (network analysis)
   */
  async createNetworkRelationshipMap(
    companyIds: number[],
    options: {
      maxDepth?: number;
      includeInactive?: boolean;
      includeVisualization?: boolean;
    } = {}
  ): Promise<RelationshipMap> {
    const { maxDepth = 2, includeInactive = false, includeVisualization = true } = options;

    console.log(`🌐 Creating network relationship map for ${companyIds.length} companies`);

    const allNodes: RelationshipNode[] = [];
    const allConnections: RelationshipConnection[] = [];

    // Process each company
    for (const companyId of companyIds.slice(0, 10)) { // Limit to 10 for performance
      try {
        const companyMap = await this.createCompanyRelationshipMap(companyId, {
          maxDepth,
          includeInactive,
          includeVisualization: false
        });

        // Merge nodes (avoid duplicates)
        for (const node of companyMap.nodes) {
          if (!allNodes.find(n => n.id === node.id && n.type === node.type)) {
            allNodes.push(node);
          }
        }

        // Merge connections (avoid duplicates)
        for (const connection of companyMap.connections) {
          if (!allConnections.find(c => 
            c.fromId === connection.fromId && 
            c.toId === connection.toId && 
            c.connectionType === connection.connectionType
          )) {
            allConnections.push(connection);
          }
        }
      } catch (error) {
        console.warn(`Failed to map company ${companyId}:`, error);
      }
    }

    // Generate network visualization if requested
    let visualTree: string | undefined;
    if (includeVisualization && allNodes.length > 0) {
      const rootNode = allNodes[0]; // Use first company as root for visualization
      visualTree = this.generateVisualTree(allNodes, allConnections, rootNode);
    }

    return {
      nodes: allNodes,
      connections: allConnections,
      totalNodes: allNodes.length,
      maxDepth,
      visualTree
    };
  }

  /**
   * Build relationship tree recursively
   */
  private async buildRelationshipTree(
    currentResource: Resource,
    nodes: RelationshipNode[],
    connections: RelationshipConnection[],
    currentDepth: number,
    maxDepth: number,
    includeInactive: boolean
  ): Promise<void> {
    if (currentDepth >= maxDepth) {
      return;
    }

    // Add responsible employee if exists
    if (currentResource.ResponsibleResourceId) {
      try {
        const responsibleResponse = await this.workbookClient.resources.getById(currentResource.ResponsibleResourceId);
        if (responsibleResponse.success && responsibleResponse.data) {
          const responsible = responsibleResponse.data;
          
          if (includeInactive || responsible.Active) {
            const responsibleNode: RelationshipNode = {
              id: responsible.Id,
              name: responsible.Name || 'Unknown Employee',
              type: 'employee',
              resourceType: responsible.TypeId || 0,
              active: responsible.Active,
              email: responsible.Email || undefined,
              phone: responsible.Phone1 || undefined,
              connectionStrength: 0.9,
              connectionType: 'responsible',
              depth: currentDepth + 1
            };

            if (!nodes.find(n => n.id === responsible.Id && n.type === 'employee')) {
              nodes.push(responsibleNode);
            }

            // Add connection
            connections.push({
              fromId: responsible.Id,
              toId: currentResource.Id,
              connectionType: 'responsible_for',
              strength: 0.9,
              description: `${responsible.Name} is responsible for ${currentResource.Name}`
            });
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch responsible employee ${currentResource.ResponsibleResourceId}:`, error);
      }
    }

    // Add contact persons if company
    if (currentResource.TypeId === ResourceTypes.CLIENT || 
        currentResource.TypeId === ResourceTypes.SUPPLIER || 
        currentResource.TypeId === ResourceTypes.PROSPECT) {
      
      try {
        const contactsResponse = await this.workbookClient.resources.getContactsForResource(currentResource.Id, !includeInactive);
        if (contactsResponse.success && contactsResponse.data) {
          for (const contact of contactsResponse.data.slice(0, 5)) { // Limit to 5 contacts
            if (includeInactive || contact.Active) {
              const contactNode: RelationshipNode = {
                id: contact.Id,
                name: contact.Name || 'Unknown Contact',
                type: 'contact',
                resourceType: ResourceTypes.CONTACT_PERSON,
                active: contact.Active,
                email: contact.Email || undefined,
                phone: contact.Phone1 || contact.CellPhone || undefined,
                connectionStrength: 0.7,
                connectionType: 'contact',
                depth: currentDepth + 1
              };

              if (!nodes.find(n => n.id === contact.Id && n.type === 'contact')) {
                nodes.push(contactNode);
              }

              // Add connection
              connections.push({
                fromId: contact.Id,
                toId: currentResource.Id,
                connectionType: 'contact_of',
                strength: 0.7,
                description: `${contact.Name} is a contact person for ${currentResource.Name}`
              });
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch contacts for company ${currentResource.Id}:`, error);
      }
    }

    // Add related companies (if there are any hierarchical relationships)
    // This could be expanded to include parent/child companies, partnerships, etc.
    // For now, we'll focus on direct relationships through responsible employees and contacts
  }

  /**
   * Generate ASCII tree visualization
   */
  private generateVisualTree(
    nodes: RelationshipNode[],
    connections: RelationshipConnection[],
    rootNode: RelationshipNode
  ): string {
    const lines: string[] = [];
    const processed = new Set<number>();

    const buildTreeRecursive = (node: RelationshipNode, prefix: string, isLast: boolean): void => {
      if (processed.has(node.id)) {
        return;
      }
      processed.add(node.id);

      // Add current node
      const connector = prefix + (isLast ? '└── ' : '├── ');
      const typeIcon = node.type === 'company' ? '🏢' : node.type === 'employee' ? '👤' : '📧';
      const statusIcon = node.active ? '✅' : '❌';
      lines.push(`${connector}${typeIcon} ${node.name} ${statusIcon}`);

      // Find children
      const childConnections = connections.filter(c => c.fromId === node.id || c.toId === node.id);
      const childNodes = childConnections
        .map(c => {
          const childId = c.fromId === node.id ? c.toId : c.fromId;
          return nodes.find(n => n.id === childId);
        })
        .filter(n => n && !processed.has(n.id)) as RelationshipNode[];

      // Sort children by type and name
      childNodes.sort((a, b) => {
        if (a.type !== b.type) {
          const typeOrder = { employee: 0, contact: 1, company: 2 };
          return typeOrder[a.type] - typeOrder[b.type];
        }
        return a.name.localeCompare(b.name);
      });

      // Process children
      childNodes.forEach((child, index) => {
        const isLastChild = index === childNodes.length - 1;
        const newPrefix = prefix + (isLast ? '    ' : '│   ');
        buildTreeRecursive(child, newPrefix, isLastChild);
      });
    };

    lines.push(`\n🔗 Relationship Tree for ${rootNode.name}`);
    lines.push('═'.repeat(50));
    buildTreeRecursive(rootNode, '', true);
    lines.push('═'.repeat(50));
    lines.push(`📊 Total nodes: ${nodes.length} | Total connections: ${connections.length}\n`);

    return lines.join('\n');
  }

  /**
   * Analyze connection strength between entities
   */
  calculateConnectionStrength(
    fromNode: RelationshipNode,
    toNode: RelationshipNode,
    connectionType: RelationshipConnection['connectionType']
  ): number {
    const baseStrengths = {
      responsible_for: 0.9,
      contact_of: 0.7,
      parent_of: 0.8,
      child_of: 0.8,
      related_to: 0.5
    };

    let strength = baseStrengths[connectionType] || 0.5;

    // Adjust based on activity status
    if (!fromNode.active || !toNode.active) {
      strength *= 0.7;
    }

    // Adjust based on completeness of data
    if (fromNode.email && toNode.email) {
      strength += 0.1;
    }
    if (fromNode.phone && toNode.phone) {
      strength += 0.1;
    }

    return Math.min(strength, 1.0);
  }

  /**
   * Get relationship statistics
   */
  getRelationshipStats(relationshipMap: RelationshipMap): {
    companiesCount: number;
    contactsCount: number;
    employeesCount: number;
    activeNodesCount: number;
    strongConnectionsCount: number;
    averageConnectionStrength: number;
  } {
    const stats = {
      companiesCount: relationshipMap.nodes.filter(n => n.type === 'company').length,
      contactsCount: relationshipMap.nodes.filter(n => n.type === 'contact').length,
      employeesCount: relationshipMap.nodes.filter(n => n.type === 'employee').length,
      activeNodesCount: relationshipMap.nodes.filter(n => n.active).length,
      strongConnectionsCount: relationshipMap.connections.filter(c => c.strength >= 0.8).length,
      averageConnectionStrength: relationshipMap.connections.length > 0 
        ? relationshipMap.connections.reduce((sum, c) => sum + c.strength, 0) / relationshipMap.connections.length
        : 0
    };

    return stats;
  }
}