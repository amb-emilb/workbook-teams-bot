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
export function createCompanyResultsCard(companies: CompanyResult[]): Attachment {
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
                        action: 'company_details',
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
          action: 'view_all_companies'
        }
      }
    ] : []
  };

  return CardFactory.adaptiveCard(card);
}

/**
 * Create an Adaptive Card for displaying contact search results
 */
export function createContactResultsCard(contacts: ContactResult[]): Attachment {
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
          action: 'view_all_contacts'
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
          action: 'export_data_quality'
        }
      },
      {
        type: 'Action.Submit',
        title: 'Show Recommendations',
        data: {
          action: 'data_quality_recommendations'
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
          action: 'export_options'
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
 * Parse text response and extract structured data for Adaptive Cards
 */
export class ResponseParser {
  
  static parseCompanyResults(text: string): CompanyResult[] | null {
    const companies: CompanyResult[] = [];
    
    // Look for company patterns in the text
    const companyPatterns = [
      /(?:company|companies)[:\s]*["']?([^"'\n]+)["']?/gi,
      /\*\*([^*]+)\*\*(?:[^0-9]*(\d+)\s*contact[s]?)?/gi,
      /Name:\s*([^\n]+)/gi
    ];

    for (const pattern of companyPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const name = match[1]?.trim();
        if (name && name.length > 2) {
          companies.push({
            name,
            contactCount: match[2] ? parseInt(match[2]) : undefined
          });
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