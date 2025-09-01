import { 
  CardFactory, 
  Attachment
} from 'botbuilder';

/**
 * Adaptive Card Templates for Rich Workbook Responses
 * Transforms plain text responses into interactive, visually appealing cards
 */

export interface CompanyResult {
  name: string;
  id?: string;
  contactCount?: number;
  responsibleEmployee?: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
}

export interface ContactResult {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
}

export interface DataQualityMetrics {
  totalResources: number;
  completeness: number;
  healthScore: number;
  missingEmails: number;
  orphanedRecords: number;
  invalidEmails: number;
}

export interface DatabaseOverview {
  totalResources: number;
  resourceBreakdown: Array<{
    type: string;
    count: number;
    percentage: number;
    active: number;
    inactive: number;
  }>;
  lastUpdated?: string;
}

export interface PortfolioAnalysis {
  employeeName: string;
  clientCount: number;
  activeClients: number;
  inactiveClients: number;
  workloadPercentage: number;
  topClients?: Array<{
    name: string;
    contactCount: number;
  }>;
}

export interface GeographicResult {
  location: string;
  type: 'country' | 'city' | 'region';
  count: number;
  companies?: CompanyResult[];
  contacts?: ContactResult[];
}

export interface RelationshipMapping {
  employee: {
    name: string;
    email?: string;
    id?: string;
  };
  clients: Array<{
    name: string;
    status: 'active' | 'inactive';
    contactCount?: number;
  }>;
}

export interface DownloadResult {
  fileName: string;
  downloadUrl: string;
  fileSize?: string;
  recordCount?: number;
  expiresAt?: string;
}

/**
 * Create an Adaptive Card for displaying company search results
 */
export function createCompanyResultsCard(companies: CompanyResult[], originalQuery?: string): Attachment {
  const card = {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.3',
    body: [
      {
        type: 'TextBlock',
        text: `🏢 Company Results (${companies.length})`,
        weight: 'Bolder',
        size: 'Medium',
        color: 'Accent'
      },
      {
        type: 'Container',
        items: companies.slice(0, 10).map(company => ({
          type: 'ColumnSet',
          columns: [
            {
              type: 'Column',
              width: 'stretch',
              items: [
                {
                  type: 'TextBlock',
                  text: `**${company.name}**`,
                  weight: 'Bolder',
                  wrap: true
                },
                {
                  type: 'TextBlock',
                  text: [
                    company.contactCount ? `📧 ${company.contactCount} contacts` : '',
                    company.responsibleEmployee ? `👤 ${company.responsibleEmployee}` : '',
                    company.city ? `📍 ${company.city}${company.country ? `, ${company.country}` : ''}` : ''
                  ].filter(Boolean).join(' • '),
                  size: 'Small',
                  color: 'Default',
                  wrap: true,
                  spacing: 'None'
                }
              ]
            },
            {
              type: 'Column',
              width: 'auto',
              items: [
                {
                  type: 'ActionSet',
                  actions: [
                    {
                      type: 'Action.Submit',
                      title: 'Details',
                      data: {
                        verb: 'company_details',
                        companyName: company.name,
                        companyId: company.id
                      }
                    }
                  ]
                }
              ]
            }
          ],
          separator: companies.indexOf(company) > 0
        }))
      }
    ],
    actions: companies.length > 10 ? [
      {
        type: 'Action.Submit',
        title: `View All ${companies.length} Companies`,
        data: {
          verb: 'view_all_companies',
          originalQuery: originalQuery || '',
          totalCount: companies.length
        }
      }
    ] : []
  };

  return CardFactory.adaptiveCard(card);
}

/**
 * Create an Adaptive Card for displaying contact search results
 */
export function createContactResultsCard(contacts: ContactResult[], originalQuery?: string): Attachment {
  const card = {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.3',
    body: [
      {
        type: 'TextBlock',
        text: `👥 Contact Results (${contacts.length})`,
        weight: 'Bolder',
        size: 'Medium',
        color: 'Accent'
      },
      {
        type: 'Container',
        items: contacts.slice(0, 8).map(contact => ({
          type: 'ColumnSet',
          columns: [
            {
              type: 'Column',
              width: 'stretch',
              items: [
                {
                  type: 'TextBlock',
                  text: `**${contact.name}**`,
                  weight: 'Bolder',
                  wrap: true
                },
                {
                  type: 'TextBlock',
                  text: [
                    contact.email ? `📧 ${contact.email}` : '',
                    contact.phone ? `📞 ${contact.phone}` : '',
                    contact.company ? `🏢 ${contact.company}` : ''
                  ].filter(Boolean).join(' • '),
                  size: 'Small',
                  color: 'Default',
                  wrap: true,
                  spacing: 'None'
                }
              ]
            },
            {
              type: 'Column',
              width: 'auto',
              items: contact.email ? [
                {
                  type: 'ActionSet',
                  actions: [
                    {
                      type: 'Action.OpenUrl',
                      title: 'Email',
                      url: `mailto:${contact.email}`
                    }
                  ]
                }
              ] : []
            }
          ],
          separator: contacts.indexOf(contact) > 0
        }))
      }
    ],
    actions: contacts.length > 8 ? [
      {
        type: 'Action.Submit',
        title: `View All ${contacts.length} Contacts`,
        data: {
          verb: 'view_all_contacts',
          originalQuery: originalQuery || '',
          totalCount: contacts.length
        }
      }
    ] : []
  };

  return CardFactory.adaptiveCard(card);
}

/**
 * Create an Adaptive Card for data quality analysis with visual progress bars
 */
export function createDataQualityCard(metrics: DataQualityMetrics): Attachment {
  const completenessColor = metrics.completeness >= 80 ? 'Good' : 
    metrics.completeness >= 60 ? 'Warning' : 'Attention';
  
  const healthColor = metrics.healthScore >= 80 ? 'Good' : 
    metrics.healthScore >= 60 ? 'Warning' : 'Attention';

  const card = {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.3',
    body: [
      {
        type: 'TextBlock',
        text: '📊 Data Quality Analysis',
        weight: 'Bolder',
        size: 'Medium',
        color: 'Accent'
      },
      {
        type: 'FactSet',
        facts: [
          {
            title: 'Total Resources',
            value: metrics.totalResources.toLocaleString()
          },
          {
            title: 'Data Completeness',
            value: `${metrics.completeness}%`
          },
          {
            title: 'Health Score',
            value: `${metrics.healthScore}/100`
          }
        ]
      },
      {
        type: 'TextBlock',
        text: 'Data Completeness',
        weight: 'Bolder',
        spacing: 'Medium'
      },
      {
        type: 'ProgressBar',
        value: metrics.completeness,
        color: completenessColor
      },
      {
        type: 'TextBlock',
        text: 'Health Score',
        weight: 'Bolder',
        spacing: 'Medium'
      },
      {
        type: 'ProgressBar',
        value: metrics.healthScore,
        color: healthColor
      },
      {
        type: 'TextBlock',
        text: '🔍 Issues Found',
        weight: 'Bolder',
        spacing: 'Medium'
      },
      {
        type: 'Container',
        style: 'attention',
        items: [
          {
            type: 'FactSet',
            facts: [
              {
                title: '📧 Missing Emails',
                value: metrics.missingEmails.toLocaleString()
              },
              {
                title: '🔗 Orphaned Records',
                value: metrics.orphanedRecords.toLocaleString()
              },
              {
                title: '❌ Invalid Emails',
                value: metrics.invalidEmails.toLocaleString()
              }
            ]
          }
        ]
      }
    ],
    actions: [
      {
        type: 'Action.Submit',
        title: 'Export Data Quality Report',
        data: {
          verb: 'export_data_quality'
        }
      },
      {
        type: 'Action.Submit',
        title: 'Show Recommendations',
        data: {
          verb: 'data_quality_recommendations'
        }
      }
    ]
  };

  return CardFactory.adaptiveCard(card);
}

/**
 * Create an Adaptive Card for download links with file information
 */
export function createDownloadCard(download: DownloadResult): Attachment {
  // Determine file type icon based on filename
  const getFileIcon = (fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop();
    switch (ext) {
    case 'csv':
      return 'https://cdn-icons-png.flaticon.com/128/337/337932.png'; // CSV icon
    case 'xlsx':
    case 'xls':
      return 'https://cdn-icons-png.flaticon.com/128/337/337958.png'; // Excel icon
    default:
      return 'https://cdn-icons-png.flaticon.com/128/337/337946.png'; // Generic document icon
    }
  };

  const card = {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.3',
    body: [
      {
        type: 'TextBlock',
        text: '📥 Download Ready',
        weight: 'Bolder',
        size: 'Medium',
        color: 'Good'
      },
      {
        type: 'Container',
        style: 'good',
        items: [
          {
            type: 'ColumnSet',
            columns: [
              {
                type: 'Column',
                width: 'auto',
                items: [
                  {
                    type: 'Image',
                    url: getFileIcon(download.fileName),
                    size: 'Medium'
                  }
                ]
              },
              {
                type: 'Column',
                width: 'stretch',
                items: [
                  {
                    type: 'TextBlock',
                    text: `**${download.fileName}**`,
                    weight: 'Bolder',
                    wrap: true
                  },
                  {
                    type: 'FactSet',
                    facts: [
                      download.recordCount ? {
                        title: 'Records',
                        value: download.recordCount.toLocaleString()
                      } : null,
                      download.fileSize ? {
                        title: 'Size',
                        value: download.fileSize
                      } : null,
                      download.expiresAt ? {
                        title: 'Expires',
                        value: download.expiresAt
                      } : null
                    ].filter(Boolean)
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    actions: [
      {
        type: 'Action.OpenUrl',
        title: '📥 Download File',
        url: download.downloadUrl
      },
      {
        type: 'Action.Submit',
        title: 'Export Another Format',
        data: {
          verb: 'export_options'
        }
      }
    ]
  };

  return CardFactory.adaptiveCard(card);
}

/**
 * Create a Database Overview Card for statistics and resource breakdowns
 */
export function createDatabaseOverviewCard(overview: DatabaseOverview): Attachment {
  const card = {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.3',
    body: [
      {
        type: 'TextBlock',
        text: '📊 Database Overview',
        weight: 'Bolder',
        size: 'Large',
        color: 'Accent'
      },
      {
        type: 'TextBlock',
        text: `Total Resources: ${overview.totalResources.toLocaleString()}`,
        weight: 'Bolder',
        size: 'Medium',
        spacing: 'Medium'
      },
      {
        type: 'TextBlock',
        text: 'Resource Breakdown',
        weight: 'Bolder',
        spacing: 'Large'
      },
      {
        type: 'Container',
        items: overview.resourceBreakdown.slice(0, 10).map(resource => ({
          type: 'ColumnSet',
          columns: [
            {
              type: 'Column',
              width: 'stretch',
              items: [
                {
                  type: 'TextBlock',
                  text: `**${resource.type}**`,
                  wrap: true
                },
                {
                  type: 'TextBlock',
                  text: `Active: ${resource.active.toLocaleString()} | Inactive: ${resource.inactive.toLocaleString()}`,
                  size: 'Small',
                  color: 'Default',
                  spacing: 'None'
                }
              ]
            },
            {
              type: 'Column',
              width: 'auto',
              items: [
                {
                  type: 'TextBlock',
                  text: `${resource.count.toLocaleString()}`,
                  weight: 'Bolder',
                  horizontalAlignment: 'Right'
                },
                {
                  type: 'TextBlock',
                  text: `${resource.percentage}%`,
                  size: 'Small',
                  color: 'Accent',
                  horizontalAlignment: 'Right',
                  spacing: 'None'
                }
              ]
            }
          ],
          separator: overview.resourceBreakdown.indexOf(resource) > 0
        }))
      },
      overview.lastUpdated ? {
        type: 'TextBlock',
        text: `Last Updated: ${overview.lastUpdated}`,
        size: 'Small',
        color: 'Default',
        spacing: 'Large',
        horizontalAlignment: 'Center'
      } : null
    ].filter(Boolean),
    actions: [
      {
        type: 'Action.Submit',
        title: 'Export Full Report',
        data: {
          verb: 'export_database_overview'
        }
      },
      {
        type: 'Action.Submit',
        title: 'Refresh Data',
        data: {
          verb: 'refresh_database_overview'
        }
      }
    ]
  };

  return CardFactory.adaptiveCard(card);
}

/**
 * Create a Portfolio Analysis Card for employee workload visualization
 */
export function createPortfolioAnalysisCard(portfolios: PortfolioAnalysis[]): Attachment {
  const maxWorkload = Math.max(...portfolios.map(p => p.clientCount));
  
  const card = {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.3',
    body: [
      {
        type: 'TextBlock',
        text: '💼 Portfolio Analysis',
        weight: 'Bolder',
        size: 'Large',
        color: 'Accent'
      },
      {
        type: 'Container',
        items: portfolios.slice(0, 10).map(portfolio => ({
          type: 'Container',
          items: [
            {
              type: 'ColumnSet',
              columns: [
                {
                  type: 'Column',
                  width: 'stretch',
                  items: [
                    {
                      type: 'TextBlock',
                      text: `**${portfolio.employeeName}**`,
                      wrap: true
                    },
                    {
                      type: 'TextBlock',
                      text: `${portfolio.clientCount} clients (${portfolio.activeClients} active, ${portfolio.inactiveClients} inactive)`,
                      size: 'Small',
                      color: 'Default',
                      spacing: 'None'
                    }
                  ]
                },
                {
                  type: 'Column',
                  width: 'auto',
                  items: [
                    {
                      type: 'TextBlock',
                      text: `${portfolio.workloadPercentage}%`,
                      weight: 'Bolder',
                      color: portfolio.workloadPercentage > 30 ? 'Attention' : 'Good',
                      horizontalAlignment: 'Right'
                    }
                  ]
                }
              ]
            },
            {
              type: 'ProgressBar',
              value: (portfolio.clientCount / maxWorkload) * 100,
              color: portfolio.workloadPercentage > 30 ? 'Attention' : 
                portfolio.workloadPercentage > 20 ? 'Warning' : 'Good'
            }
          ],
          separator: portfolios.indexOf(portfolio) > 0
        }))
      }
    ],
    actions: [
      {
        type: 'Action.Submit',
        title: 'View Details',
        data: {
          verb: 'portfolio_details'
        }
      },
      {
        type: 'Action.Submit',
        title: 'Export Analysis',
        data: {
          verb: 'export_portfolio_analysis'
        }
      }
    ]
  };

  return CardFactory.adaptiveCard(card);
}

/**
 * Create a Geographic Results Card for location-based queries
 */
export function createGeographicResultsCard(results: GeographicResult[]): Attachment {
  const totalCount = results.reduce((sum, r) => sum + r.count, 0);
  
  const card = {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.3',
    body: [
      {
        type: 'TextBlock',
        text: `🌍 Geographic Results (${totalCount} total)`,
        weight: 'Bolder',
        size: 'Large',
        color: 'Accent'
      },
      {
        type: 'Container',
        items: results.slice(0, 10).map(location => ({
          type: 'Container',
          items: [
            {
              type: 'ColumnSet',
              columns: [
                {
                  type: 'Column',
                  width: 'auto',
                  items: [
                    {
                      type: 'TextBlock',
                      text: location.type === 'country' ? '🏳️' : '📍',
                      size: 'Large'
                    }
                  ]
                },
                {
                  type: 'Column',
                  width: 'stretch',
                  items: [
                    {
                      type: 'TextBlock',
                      text: `**${location.location}**`,
                      wrap: true
                    },
                    {
                      type: 'TextBlock',
                      text: `${location.count} ${location.companies ? 'companies' : 'contacts'}`,
                      size: 'Small',
                      color: 'Default',
                      spacing: 'None'
                    }
                  ]
                },
                {
                  type: 'Column',
                  width: 'auto',
                  items: [
                    {
                      type: 'ActionSet',
                      actions: [
                        {
                          type: 'Action.Submit',
                          title: 'View',
                          data: {
                            verb: 'view_location_details',
                            location: location.location,
                            type: location.type
                          }
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ],
          separator: results.indexOf(location) > 0
        }))
      }
    ],
    actions: [
      {
        type: 'Action.Submit',
        title: 'Export All Results',
        data: {
          verb: 'export_geographic_results'
        }
      }
    ]
  };

  return CardFactory.adaptiveCard(card);
}

/**
 * Create a Relationship Mapping Card for employee-client connections
 */
export function createRelationshipMappingCard(mappings: RelationshipMapping[]): Attachment {
  const card = {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.3',
    body: [
      {
        type: 'TextBlock',
        text: '🔗 Employee-Client Relationships',
        weight: 'Bolder',
        size: 'Large',
        color: 'Accent'
      },
      {
        type: 'Container',
        items: mappings.slice(0, 5).map(mapping => ({
          type: 'Container',
          style: 'emphasis',
          items: [
            {
              type: 'TextBlock',
              text: `**${mapping.employee.name}**`,
              weight: 'Bolder'
            },
            mapping.employee.email ? {
              type: 'TextBlock',
              text: `📧 ${mapping.employee.email}`,
              size: 'Small',
              color: 'Default',
              spacing: 'None'
            } : null,
            {
              type: 'TextBlock',
              text: `Managing ${mapping.clients.length} clients:`,
              spacing: 'Small'
            },
            {
              type: 'Container',
              items: mapping.clients.slice(0, 5).map(client => ({
                type: 'ColumnSet',
                columns: [
                  {
                    type: 'Column',
                    width: 'auto',
                    items: [
                      {
                        type: 'TextBlock',
                        text: client.status === 'active' ? '✅' : '⏸️',
                        color: client.status === 'active' ? 'Good' : 'Warning'
                      }
                    ]
                  },
                  {
                    type: 'Column',
                    width: 'stretch',
                    items: [
                      {
                        type: 'TextBlock',
                        text: client.name,
                        wrap: true,
                        size: 'Small'
                      }
                    ]
                  },
                  client.contactCount !== undefined ? {
                    type: 'Column',
                    width: 'auto',
                    items: [
                      {
                        type: 'TextBlock',
                        text: `${client.contactCount} contacts`,
                        size: 'Small',
                        color: 'Accent'
                      }
                    ]
                  } : null
                ].filter(Boolean)
              }))
            },
            mapping.clients.length > 5 ? {
              type: 'TextBlock',
              text: `... and ${mapping.clients.length - 5} more clients`,
              size: 'Small',
              color: 'Accent',
              spacing: 'Small'
            } : null
          ].filter(Boolean),
          separator: mappings.indexOf(mapping) > 0
        }))
      }
    ],
    actions: [
      {
        type: 'Action.Submit',
        title: 'View All Relationships',
        data: {
          verb: 'view_all_relationships'
        }
      },
      {
        type: 'Action.Submit',
        title: 'Export to CSV',
        data: {
          verb: 'export_relationships'
        }
      }
    ]
  };

  return CardFactory.adaptiveCard(card);
}

/**
 * Create a simple status card for general responses
 */
export function createStatusCard(title: string, message: string, status: 'success' | 'warning' | 'error' = 'success'): Attachment {
  const statusConfig = {
    success: { color: 'Good', icon: '✅' },
    warning: { color: 'Warning', icon: '⚠️' },
    error: { color: 'Attention', icon: '❌' }
  };

  const config = statusConfig[status];

  const card = {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.3',
    body: [
      {
        type: 'TextBlock',
        text: `${config.icon} ${title}`,
        weight: 'Bolder',
        size: 'Medium',
        color: config.color
      },
      {
        type: 'TextBlock',
        text: message,
        wrap: true,
        spacing: 'Medium'
      }
    ]
  };

  return CardFactory.adaptiveCard(card);
}

/**
 * Response context to help determine the appropriate card type
 */
export interface ResponseContext {
  toolUsed?: string;
  queryType?: string;
  originalQuery?: string;
  dataStructure?: 'list' | 'single' | 'statistics' | 'hierarchical' | 'file' | 'geographic' | 'relationship';
}

/**
 * Enhanced Response Parser with intelligent card type detection
 */
export class EnhancedResponseParser {
  
  /**
   * Detect the appropriate card type based on response content and context
   */
  static detectCardType(text: string, context?: ResponseContext): string {
    // Priority 1: Use tool context if available
    if (context?.toolUsed) {
      const toolCardMap: Record<string, string> = {
        'getContactStatsTool': 'database-overview',
        'portfolioAnalysisTool': 'portfolio-analysis',
        'geographicAnalysisTool': 'geographic-results',
        'dataQualityTool': 'data-quality',
        'enhancedExportTool': 'download',
        'relationshipMappingTool': 'relationship-mapping'
      };
      
      if (toolCardMap[context.toolUsed]) {
        return toolCardMap[context.toolUsed];
      }
    }
    
    // Priority 2: Analyze query patterns
    const query = (context?.originalQuery || '').toLowerCase();
    
    if (query.match(/database|overview|statistics|breakdown|resource type/)) {
      return 'database-overview';
    }
    if (query.match(/portfolio|workload|employee.*client|client.*distribution/)) {
      return 'portfolio-analysis';
    }
    if (query.match(/denmark|copenhagen|geographic|location|country|city/)) {
      return 'geographic-results';
    }
    if (query.match(/managed by|responsible for|assigned to|relationship/)) {
      return 'relationship-mapping';
    }
    if (query.match(/quality|missing|completeness|orphaned/)) {
      return 'data-quality';
    }
    
    // Priority 3: Content analysis
    const textLower = text.toLowerCase();
    
    // Check for statistics/overview patterns
    if (textLower.match(/total.*resources|resource.*breakdown|database.*statistics/)) {
      return 'database-overview';
    }
    
    // Check for portfolio/workload patterns
    if (textLower.match(/portfolio|workload.*analysis|client.*per.*employee/)) {
      return 'portfolio-analysis';
    }
    
    // Check for geographic patterns
    if (textLower.match(/companies.*in.*(?:denmark|copenhagen)|location.*based/)) {
      return 'geographic-results';
    }
    
    // Check for download/export patterns
    if (textLower.match(/download.*link|csv.*export|file.*generated/)) {
      return 'download';
    }
    
    // Check for company list patterns
    if (textLower.match(/compan(?:y|ies)|client[s]?/) && !textLower.match(/contact|person/)) {
      return 'company-results';
    }
    
    // Check for contact/people patterns
    if (textLower.match(/contact|person|people|employee/)) {
      return 'contact-results';
    }
    
    // Default to status card
    return 'status';
  }
  
  /**
   * Parse database overview from response text
   */
  static parseDatabaseOverview(text: string): DatabaseOverview | null {
    const totalMatch = text.match(/total.*?(\d+)/i);
    const breakdown: DatabaseOverview['resourceBreakdown'] = [];
    
    // Look for resource type patterns
    const lines = text.split('\n');
    for (const line of lines) {
      const typeMatch = line.match(/(?:type\s+)?(\w+).*?:\s*(\d+)/i);
      if (typeMatch) {
        const typeName = typeMatch[1];
        const count = parseInt(typeMatch[2]);
        const activeMatch = line.match(/active:\s*(\d+)/i);
        const inactiveMatch = line.match(/inactive:\s*(\d+)/i);
        
        breakdown.push({
          type: typeName,
          count: count,
          percentage: 0, // Will calculate after getting all
          active: activeMatch ? parseInt(activeMatch[1]) : count,
          inactive: inactiveMatch ? parseInt(inactiveMatch[1]) : 0
        });
      }
    }
    
    // Calculate percentages
    const total = breakdown.reduce((sum, item) => sum + item.count, 0) || 
                  (totalMatch ? parseInt(totalMatch[1]) : 0);
    
    if (total > 0) {
      breakdown.forEach(item => {
        item.percentage = Math.round((item.count / total) * 100);
      });
    }
    
    return breakdown.length > 0 || total > 0 ? {
      totalResources: total,
      resourceBreakdown: breakdown,
      lastUpdated: new Date().toLocaleString()
    } : null;
  }
  
  /**
   * Parse portfolio analysis from response text
   */
  static parsePortfolioAnalysis(text: string): PortfolioAnalysis[] | null {
    const portfolios: PortfolioAnalysis[] = [];
    const employeePattern = /(?:employee|user):\s*([^\n,]+).*?(\d+)\s*client/gi;
    
    let match;
    while ((match = employeePattern.exec(text)) !== null) {
      const activeMatch = text.match(new RegExp(`${match[1]}.*?(\\d+)\\s*active`, 'i'));
      const inactiveMatch = text.match(new RegExp(`${match[1]}.*?(\\d+)\\s*inactive`, 'i'));
      
      portfolios.push({
        employeeName: match[1].trim(),
        clientCount: parseInt(match[2]),
        activeClients: activeMatch ? parseInt(activeMatch[1]) : parseInt(match[2]),
        inactiveClients: inactiveMatch ? parseInt(inactiveMatch[1]) : 0,
        workloadPercentage: 0 // Will calculate after getting all
      });
    }
    
    // Calculate workload percentages
    const totalClients = portfolios.reduce((sum, p) => sum + p.clientCount, 0);
    if (totalClients > 0) {
      portfolios.forEach(p => {
        p.workloadPercentage = Math.round((p.clientCount / totalClients) * 100);
      });
    }
    
    return portfolios.length > 0 ? portfolios : null;
  }
  
  /**
   * Parse geographic results from response text
   */
  static parseGeographicResults(text: string): GeographicResult[] | null {
    const results: GeographicResult[] = [];
    const locationPattern = /(?:in\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?).*?(\d+)\s*(?:compan|contact)/gi;
    
    let match;
    while ((match = locationPattern.exec(text)) !== null) {
      const location = match[1].trim();
      const count = parseInt(match[2]);
      
      // Determine if it's a country or city
      const isCountry = ['Denmark', 'Sweden', 'Norway', 'Germany'].includes(location);
      
      // Try to extract company/contact details for this location
      const companies = ResponseParser.parseCompanyResults(text);
      const contacts = ResponseParser.parseContactResults(text);
      
      results.push({
        location: location,
        type: isCountry ? 'country' : 'city',
        count: count,
        companies: companies && text.toLowerCase().includes('compan') ? companies.slice(0, 5) : undefined,
        contacts: contacts && text.toLowerCase().includes('contact') ? contacts.slice(0, 5) : undefined
      });
    }
    
    return results.length > 0 ? results : null;
  }
  
  /**
   * Parse relationship mappings from response text
   */
  static parseRelationshipMappings(text: string): RelationshipMapping[] | null {
    const mappings: RelationshipMapping[] = [];
    const employeePattern = /(?:employee|managed by|responsible):\s*([^\n,]+)/gi;
    
    let match;
    while ((match = employeePattern.exec(text)) !== null) {
      const employeeName = match[1].trim();
      const clientsPattern = new RegExp(`${employeeName}.*?manages?.*?([^\\n]+)`, 'gi');
      const clientsMatch = clientsPattern.exec(text);
      
      if (clientsMatch) {
        // Extract client names
        const clientNames = clientsMatch[1].split(/,|and/).map(c => c.trim());
        
        mappings.push({
          employee: {
            name: employeeName
          },
          clients: clientNames.map(name => ({
            name: name,
            status: 'active' as const // Default to active
          }))
        });
      }
    }
    
    return mappings.length > 0 ? mappings : null;
  }
}

/**
 * Parse text response and extract structured data for Adaptive Cards
 */
export class ResponseParser {
  
  static parseCompanyResults(text: string): CompanyResult[] | null {
    const companies: CompanyResult[] = [];
    
    // Check if this is a summary/statistics response rather than a company list
    const isSummaryResponse = text.match(/(?:total|database|overview|portfolio|statistics|analysis complete|workload)/i) &&
                             !text.match(/^\s*\d+\.\s+/m); // Not a numbered list
    
    if (isSummaryResponse) {
      // Don't try to parse companies from summary/statistics responses
      return null;
    }
    
    // Look for company patterns in the text
    const companyPatterns = [
      /(?:company|companies)[:\s]*["']?([^"'\n]+)["']?/gi,
      /\*\*([^*]+)\*\*(?:[^0-9]*(\d+)\s*contact[s]?)?/gi,
      /Name:\s*([^\n]+)/gi,
      /^\d+\.\s+([^\n]+)/gim // Numbered lists
    ];

    for (const pattern of companyPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const name = match[1]?.trim();
        
        // Validate the parsed name
        if (name && 
            name.length > 2 && 
            name.length < 100 && // Reasonable company name length
            /[a-zA-Z]/.test(name) && // Must contain at least one letter
            !(/^\d+[,.]?\d*$/.test(name)) && // Not just a number
            !name.match(/^(Details|with contacts|employees|contacts|prospects)$/i)) { // Not metadata
          
          // Check if we already have this company (avoid duplicates)
          const exists = companies.some(c => c.name.toLowerCase() === name.toLowerCase());
          if (!exists) {
            companies.push({
              name,
              contactCount: match[2] ? parseInt(match[2]) : undefined
            });
          }
        }
      }
    }

    return companies.length > 0 ? companies.slice(0, 20) : null;
  }

  static parseContactResults(text: string): ContactResult[] | null {
    const contacts: ContactResult[] = [];
    
    // Look for contact patterns
    const lines = text.split('\n');
    for (const line of lines) {
      const emailMatch = line.match(/([^<>\s]+@[^<>\s]+\.[^<>\s]+)/);
      const nameMatch = line.match(/(?:Name:|-)?\s*([A-Za-zÀ-ÿ\s]+)(?:\s+<|$)/);
      
      if (emailMatch || nameMatch) {
        contacts.push({
          name: nameMatch?.[1]?.trim() || 'Unknown',
          email: emailMatch?.[1]?.trim()
        });
      }
    }

    return contacts.length > 0 ? contacts.slice(0, 20) : null;
  }

  static parseDataQuality(text: string): DataQualityMetrics | null {
    const totalMatch = text.match(/(?:total|analyzed):\s*(\d+)/i);
    const completenessMatch = text.match(/completeness:\s*(\d+)%/i);
    const healthMatch = text.match(/health score:\s*(\d+)/i);
    const missingEmailsMatch = text.match(/(\d+)\s*resources missing email/i);
    const orphanedMatch = text.match(/(\d+)\s*orphaned/i);
    const invalidEmailsMatch = text.match(/(\d+)\s*resources with invalid email/i);

    if (totalMatch || completenessMatch || healthMatch) {
      return {
        totalResources: totalMatch ? parseInt(totalMatch[1]) : 0,
        completeness: completenessMatch ? parseInt(completenessMatch[1]) : 0,
        healthScore: healthMatch ? parseInt(healthMatch[1]) : 0,
        missingEmails: missingEmailsMatch ? parseInt(missingEmailsMatch[1]) : 0,
        orphanedRecords: orphanedMatch ? parseInt(orphanedMatch[1]) : 0,
        invalidEmails: invalidEmailsMatch ? parseInt(invalidEmailsMatch[1]) : 0
      };
    }

    return null;
  }

  static parseDownloadLink(text: string): DownloadResult | null {
    const urlMatch = text.match(/(https?:\/\/[^\s)]+(?:\.csv|\/files\/[^\s)]+))/i);
    const fileNameMatch = text.match(/(?:file|export):\s*([^\n]+\.csv)/i) || 
                         text.match(/([^/]+\.csv)/i);
    const recordMatch = text.match(/(\d+)\s*(?:records|rows|items)/i);

    if (urlMatch) {
      return {
        fileName: fileNameMatch?.[1] || 'export.csv',
        downloadUrl: urlMatch[1],
        recordCount: recordMatch ? parseInt(recordMatch[1]) : undefined
      };
    }

    return null;
  }
}