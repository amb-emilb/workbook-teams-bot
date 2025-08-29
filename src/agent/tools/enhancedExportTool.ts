import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { WorkbookClient, Resource } from '../../services/index.js';
import { ResourceTypes } from '../../constants/resourceTypes.js';
import { fileStorageService } from '../../routes/fileRoutes.js';
import { ExportContext, EnrichedResource } from '../../types/tool-results.js';
import * as fs from 'fs';
import * as path from 'path';


/**
 * Create enhanced Export Tool for multi-format data export
 * Factory function that accepts initialized WorkbookClient
 */
export function createEnhancedExportTool(workbookClient: WorkbookClient) {
  return createTool({
    id: 'enhanced-export',
    description: `🗂️ FILE EXPORT ONLY - Use ONLY when users explicitly want downloadable files.

  DO NOT USE for display/viewing queries:
  ❌ "Show me all active clients" → Use companySearchTool (for display)
  ❌ "List employees" → Use searchContactsTool (for display)
  ❌ "Give me stats" → Use getContactStatsTool (for display)
  
  ONLY use when users want EXPORTS/DOWNLOADS:
  ✅ "Export all active clients to CSV"
  ✅ "Give me a CSV of employees"  
  ✅ "Download contact data as spreadsheet"
  ✅ "Create a file with Danish clients"
  
  Key indicators for this tool:
  - Words: export, download, CSV, spreadsheet, file, save
  - User wants data they can open in Excel/save locally
  - NOT for just displaying/viewing data in chat`,
  
    inputSchema: z.object({
      format: z.enum(['csv', 'json', 'report', 'statistics'])
        .default('csv')
        .describe('Export format: csv (spreadsheet), json (structured), report (formatted text), statistics (summary)'),
    
      exportType: z.enum(['all', 'filtered', 'custom'])
        .default('filtered')
        .describe('Export scope: all resources, filtered subset, or custom selection'),
        
      // Natural language context for intelligent processing
      userQuery: z.string()
        .optional()
        .describe('Original user request for intelligent context processing'),
    
      // Filtering options
      resourceTypes: z.array(z.number())
        .optional()
        .describe('Filter by resource types: 1=Company, 2=Employee, 3=Client, 4=Supplier, 6=Prospect, 10=Contact Person. For "companies" use [1,3,6]'),
      active: z.boolean()
        .optional()
        .describe('Filter by active status'),
      companyIds: z.array(z.number())
        .optional()
        .describe('Filter by specific company IDs'),
      departmentIds: z.array(z.number())
        .optional()
        .describe('Filter by department IDs'),
    
      // Field selection (enhanced for intelligent mapping)
      fields: z.array(z.enum([
        'Id', 'Name', 'Email', 'Phone1', 'Active', 'TypeId', 
        'ResponsibleResourceId', 'ResponsibleEmployee', 'ResourceFolder', 'ProjectName', 'Initials', 
        'Address1', 'City', 'Country', 'UserLogin', 'CompanyName', 'ContactType'
      ]))
        .optional()
        .describe('Specific fields to include (auto-selected based on user request if not specified)'),
        
      // Geographic filtering
      country: z.string()
        .optional()
        .describe('Filter by country (e.g., "Denmark", "Norway", detected from user query)'),
        
      // Enhanced mapping options for intelligent exports
      includeResponsibleEmployee: z.boolean()
        .default(false)
        .describe('Include responsible employee name and details (auto-enabled for client exports)'),
        
      includeCompanyMapping: z.boolean()
        .default(false)
        .describe('For contacts, include their company information (auto-enabled for contact exports)'),
    
      includeInactive: z.boolean()
        .default(false)
        .describe('Include inactive resources in export'),
    
      includeContactCounts: z.boolean()
        .default(false)
        .describe('Include contact counts for companies (slower)'),
    
      // Output options
      saveToFile: z.boolean()
        .default(false)
        .describe('Save export to file in exports directory'),
      fileName: z.string()
        .optional()
        .describe('Custom filename (auto-generated if not provided)'),
    
      limit: z.number()
        .min(0)
        .optional()
        .describe('Limit number of records (0 or undefined for no limit)')
    }),
  
    outputSchema: z.object({
      success: z.boolean(),
      format: z.string(),
      recordCount: z.number(),
      filePath: z.string().optional(),
      preview: z.string(),
      data: z.any().optional(),
      statistics: z.object({
        totalRecords: z.number(),
        activeCount: z.number(),
        inactiveCount: z.number(),
        employeeCount: z.number(),
        contactCount: z.number(),
        companiesWithContacts: z.number(),
        uniqueCompanies: z.number(),
        uniqueDepartments: z.number()
      }).optional(),
      exportedFields: z.array(z.string()),
      exportTime: z.string(),
      fileSize: z.string().optional(),
      downloadUrl: z.string().optional()
    }),
  
    execute: async ({ context }) => {
      console.log('� Enhanced Export Tool - Starting export...', context);
    
      try {
        // Context is already validated by the tool framework, no need for manual validation
        // Just use the context directly
      
        const {
          format,
          resourceTypes,
          active,
          companyIds,
          departmentIds,
          fields,
          includeInactive,
          includeResponsibleEmployee,
          includeCompanyMapping,
          country,
          userQuery,
          saveToFile,
          fileName,
          limit
        } = context;
        
        // Intelligent processing based on user query
        const intelligentContext = userQuery ? processUserQuery(userQuery) : {};
        console.log('🧠 Intelligent context from user query:', intelligentContext);

        // Build search parameters with intelligent overrides
        const searchParams: Record<string, string | number | boolean | string[] | number[]> = {};
        
        // Apply intelligent context or explicit parameters
        const finalResourceTypes = resourceTypes || intelligentContext.resourceTypes;
        const finalCountry = country || intelligentContext.country;
        const finalActive = active !== undefined ? active : intelligentContext.activeOnly;
        const finalIncludeResponsible = includeResponsibleEmployee || intelligentContext.includeResponsibleEmployee;
        const finalIncludeCompany = includeCompanyMapping || intelligentContext.includeCompanyMapping;
      
        if (finalResourceTypes) {searchParams.ResourceType = finalResourceTypes;}
        if (finalActive !== undefined) {searchParams.Active = finalActive;}
        if (companyIds) {searchParams.CompanyIds = companyIds;}
        if (departmentIds) {searchParams.DepartmentIds = departmentIds;}

        // Get data from WorkbookClient
        console.log('� Fetching resources with parameters:', searchParams);
        const response = await workbookClient.resources.search(searchParams);
      
        if (!response.success || !response.data) {
          throw new Error('Failed to fetch resource data');
        }

        let resources = response.data;
      
        // Apply post-fetch filtering
        if (!includeInactive && finalActive !== false) {
          resources = resources.filter(r => r.Active);
        }
        
        // Apply geographic filtering using country codes
        if (finalCountry) {
          const countryCode = getCountryCode(finalCountry);
          resources = resources.filter(r => 
            r.Country && (countryCode ? r.Country === countryCode : 
              r.Country.toLowerCase().includes(finalCountry.toLowerCase()))
          );
          console.log(`Geographic filter applied: ${finalCountry} (${countryCode || 'text match'}), ${resources.length} resources remain`);
        }
        
        // Enhanced data mapping
        if (finalIncludeResponsible || finalIncludeCompany) {
          resources = await enrichResourcesWithDetails(resources, workbookClient, {
            includeResponsibleEmployee: finalIncludeResponsible,
            includeCompanyMapping: finalIncludeCompany
          });
        }
      
        // Apply limit only if specified and greater than 0
        if (limit && limit > 0) {
          resources = resources.slice(0, limit);
        }

        // Define intelligent field selection
        const exportFields = fields || getIntelligentFields(intelligentContext, {
          includeResponsibleEmployee: finalIncludeResponsible,
          includeCompanyMapping: finalIncludeCompany
        });
        
        console.log('📋 Export fields selected:', exportFields);

        // Calculate statistics
        const stats = {
          totalRecords: resources.length,
          activeCount: resources.filter(r => r.Active).length,
          inactiveCount: resources.filter(r => !r.Active).length,
          employeeCount: resources.filter(r => r.TypeId === ResourceTypes.EMPLOYEE).length,
          contactCount: resources.filter(r => r.TypeId === ResourceTypes.CONTACT_PERSON).length,
          companiesWithContacts: new Set(
            resources
              .filter(r => r.TypeId === ResourceTypes.CONTACT_PERSON && (r.ResourceFolder || r.ProjectName))
              .map(r => r.ResourceFolder || r.ProjectName)
          ).size,
          uniqueCompanies: new Set(
            resources
              .filter(r => (r.TypeId === ResourceTypes.COMPANY || 
                           r.TypeId === ResourceTypes.CLIENT || 
                           r.TypeId === ResourceTypes.PROSPECT) && r.ResourceFolder)
              .map(r => r.ResourceFolder)
          ).size,
          uniqueDepartments: new Set(
            resources
              .filter(r => r.ResourceFolder)
              .map(r => r.ResourceFolder)
          ).size
        };

        let exportData: string | object;
        let preview: string;
        let filePath: string | undefined;
        let fileSize: string | undefined;

        // Generate export based on format
        switch (format) {
        case 'csv':
          exportData = generateCSV(resources, exportFields);
          preview = exportData.split('\n').slice(0, 6).join('\n') + '\n... (showing first 5 rows)';
          break;
          
        case 'json':
          exportData = JSON.stringify(
            resources.map(r => filterFields(r, exportFields)),
            null,
            2
          );
          preview = JSON.stringify(
            resources.slice(0, 3).map(r => filterFields(r, exportFields)),
            null,
            2
          ) + '\n... (showing first 3 records)';
          break;
          
        case 'report':
          exportData = generateReport(resources, stats, exportFields);
          preview = exportData.split('\n').slice(0, 20).join('\n') + '\n... (truncated)';
          break;
          
        case 'statistics':
          exportData = generateStatistics(stats, resources);
          preview = exportData;
          break;
          
        default:
          throw new Error(`Unsupported format: ${format}`);
        }

        // Save to file if requested
        let downloadUrl: string | undefined;
        if (saveToFile) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const defaultFileName = `workbook-export-${format}-${timestamp}`;
          const actualFileName = fileName || defaultFileName;
          const fileExtension = format === 'csv' ? 'csv' : 
            format === 'json' ? 'json' : 'txt';
          
          const fullFileName = `${actualFileName}.${fileExtension}`;
          const fileSizeBytes = Buffer.byteLength(exportData, 'utf-8');
          fileSize = formatFileSize(fileSizeBytes);

          // Use PostgreSQL file storage for Teams compatibility
          if (fileStorageService) {
            try {
              const contentType = format === 'csv' ? 'text/csv' :
                format === 'json' ? 'application/json' : 'text/plain';
              
              const result = await fileStorageService.storeFile({
                filename: fullFileName,
                content: exportData,
                content_type: contentType,
                expires_hours: 24, // Files expire after 24 hours
                max_downloads: 100 // Allow up to 100 downloads
              });
              
              filePath = `PostgreSQL Storage: ${result.fileId}`;
              downloadUrl = result.downloadUrl;
              
              console.log(`Export saved to PostgreSQL storage: ${fullFileName} (${fileSize})`);
              console.log(`Download URL: ${downloadUrl}`);
              
            } catch (error) {
              console.warn('Failed to store in PostgreSQL, falling back to local:', error);
              
              // Fallback to local storage
              const exportsDir = path.join(process.cwd(), 'exports');
              if (!fs.existsSync(exportsDir)) {
                fs.mkdirSync(exportsDir, { recursive: true });
              }
              
              filePath = path.join(exportsDir, fullFileName);
              fs.writeFileSync(filePath, exportData, 'utf-8');
              console.log(`Export saved locally: ${filePath}`);
            }
          } else {
            // Local storage fallback
            const exportsDir = path.join(process.cwd(), 'exports');
            if (!fs.existsSync(exportsDir)) {
              fs.mkdirSync(exportsDir, { recursive: true });
            }
            
            filePath = path.join(exportsDir, fullFileName);
            fs.writeFileSync(filePath, exportData, 'utf-8');
            console.log(`Export saved locally (no PostgreSQL): ${filePath}`);
          }
        }

        console.log(`Export completed: ${stats.totalRecords} records in ${format} format`);

        return {
          success: true,
          format,
          recordCount: stats.totalRecords,
          filePath,
          preview,
          data: saveToFile ? undefined : exportData,
          statistics: stats,
          exportedFields: exportFields,
          exportTime: new Date().toISOString(),
          fileSize,
          downloadUrl
        };

      } catch (error) {
        console.error('Enhanced Export Tool error:', error);
        return {
          success: false,
          format: context.format,
          recordCount: 0,
          preview: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          exportedFields: [],
          exportTime: new Date().toISOString()
        };
      }
    }
  });
}

// Helper functions
function filterFields(resource: Resource, fields: string[]): Record<string, unknown> {
  const filtered: Record<string, unknown> = {};
  fields.forEach(field => {
    if (field in resource) {
      filtered[field] = resource[field as keyof Resource];
    }
  });
  return filtered;
}

function generateCSV(resources: Resource[], fields: string[]): string {
  const header = fields.join(',');
  const rows = resources.map(resource => 
    fields.map(field => {
      const value = resource[field as keyof Resource];
      const stringValue = value?.toString() || '';
      // Escape CSV values that contain commas or quotes
      return stringValue.includes(',') || stringValue.includes('"') 
        ? `"${stringValue.replace(/"/g, '""')}"` 
        : stringValue;
    }).join(',')
  );
  return [header, ...rows].join('\n');
}

function generateReport(resources: Resource[], stats: { totalRecords: number; activeCount: number; inactiveCount: number; employeeCount: number; contactCount: number; companiesWithContacts: number; uniqueCompanies: number; uniqueDepartments: number }, fields: string[]): string {
  const timestamp = new Date().toLocaleString();
  
  let report = '# Workbook Resource Export Report\n';
  report += `Generated: ${timestamp}\n\n`;
  
  report += '## Summary Statistics\n';
  report += `- Total Resources: ${stats.totalRecords}\n`;
  report += `- Active: ${stats.activeCount}\n`;
  report += `- Inactive: ${stats.inactiveCount}\n`;
  report += `- Employees: ${stats.employeeCount}\n`;
  report += `- Contacts: ${stats.contactCount}\n`;
  report += `- Companies with Contacts: ${stats.companiesWithContacts}\n\n`;
  
  report += '## Exported Fields\n';
  report += fields.map(f => `- ${f}`).join('\n') + '\n\n';
  
  report += '## Resource Data\n';
  resources.slice(0, 10).forEach((resource, index) => {
    report += `### ${index + 1}. ${resource.Name || 'Unknown'}\n`;
    fields.forEach(field => {
      const value = resource[field as keyof Resource];
      if (value !== undefined && value !== null && value !== '') {
        report += `- ${field}: ${value}\n`;
      }
    });
    report += '\n';
  });
  
  if (resources.length > 10) {
    report += `... and ${resources.length - 10} more resources\n`;
  }
  
  return report;
}

function generateStatistics(stats: { totalRecords: number; activeCount: number; inactiveCount: number; employeeCount: number; contactCount: number; companiesWithContacts: number; uniqueCompanies: number; uniqueDepartments: number }, resources: Resource[]): string {
  const timestamp = new Date().toLocaleString();
  
  let report = '# Workbook Database Statistics\n';
  report += `Generated: ${timestamp}\n\n`;
  
  report += '## Overview\n';
  report += `- Total Resources: ${stats.totalRecords}\n`;
  report += `- Active: ${stats.activeCount} (${((stats.activeCount / stats.totalRecords) * 100).toFixed(1)}%)\n`;
  report += `- Inactive: ${stats.inactiveCount} (${((stats.inactiveCount / stats.totalRecords) * 100).toFixed(1)}%)\n\n`;
  
  report += '## Resource Types\n';
  report += `- Employees: ${stats.employeeCount} (${((stats.employeeCount / stats.totalRecords) * 100).toFixed(1)}%)\n`;
  report += `- Contacts: ${stats.contactCount} (${((stats.contactCount / stats.totalRecords) * 100).toFixed(1)}%)\n\n`;
  
  report += '## Company Distribution\n';
  report += `- Companies with Contacts: ${stats.companiesWithContacts}\n`;
  
  // Top companies by contact count
  const companyContactCounts = resources
    .filter(r => r.TypeId === 10 && (r.ResourceFolder || r.ProjectName))
    .reduce((acc: Record<string, number>, resource) => {
      const company = resource.ResourceFolder || resource.ProjectName || 'Unknown';
      acc[company] = (acc[company] || 0) + 1;
      return acc;
    }, {});
    
  const topCompanies = Object.entries(companyContactCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);
    
  if (topCompanies.length > 0) {
    report += '\n### Top Companies by Contact Count\n';
    topCompanies.forEach(([company, count], index) => {
      report += `${index + 1}. ${company}: ${count} contacts\n`;
    });
  }
  
  return report;
}

function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) {return '0 Bytes';}
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

// Intelligent query processing for natural language requests
function processUserQuery(query: string): {
  resourceTypes?: number[];
  country?: string;
  activeOnly?: boolean;
  includeResponsibleEmployee?: boolean;
  includeCompanyMapping?: boolean;
  exportType?: string;
} {
  const queryLower = query.toLowerCase();
  const context: ExportContext = {};
  
  // Detect resource types
  if (queryLower.includes('client') && !queryLower.includes('prospect')) {
    context.resourceTypes = [ResourceTypes.CLIENT];
    context.includeResponsibleEmployee = queryLower.includes('responsible') || queryLower.includes('employee');
  } else if (queryLower.includes('prospect')) {
    context.resourceTypes = [ResourceTypes.PROSPECT];
  } else if (queryLower.includes('employee') && !queryLower.includes('responsible')) {
    context.resourceTypes = [ResourceTypes.EMPLOYEE];
  } else if (queryLower.includes('contact') && !queryLower.includes('employee')) {
    context.resourceTypes = [ResourceTypes.CONTACT_PERSON];
    context.includeCompanyMapping = queryLower.includes('company') || queryLower.includes('mapped');
  } else if (queryLower.includes('supplier')) {
    context.resourceTypes = [ResourceTypes.SUPPLIER];
  } else if (queryLower.includes('companies') || queryLower.includes('company')) {
    context.resourceTypes = [ResourceTypes.COMPANY, ResourceTypes.CLIENT, ResourceTypes.PROSPECT];
  }
  
  // Detect geographic filters
  if (queryLower.includes('danish') || queryLower.includes('denmark')) {
    context.country = 'Denmark';
  } else if (queryLower.includes('norwegian') || queryLower.includes('norway')) {
    context.country = 'Norway';
  } else if (queryLower.includes('swedish') || queryLower.includes('sweden')) {
    context.country = 'Sweden';
  }
  
  // Detect active/inactive preference  
  if (queryLower.includes('active') && !queryLower.includes('inactive')) {
    context.activeOnly = true;
  } else if (queryLower.includes('inactive')) {
    context.activeOnly = false;
  } else {
    // Default to active only for most business queries
    context.activeOnly = true;
  }
  
  // Detect responsible employee mapping
  if (queryLower.includes('responsible') || queryLower.includes('employee')) {
    context.includeResponsibleEmployee = true;
  }
  
  // Detect company mapping for contacts
  if (queryLower.includes('company') || queryLower.includes('mapped')) {
    context.includeCompanyMapping = true;
  }
  
  return context;
}

// Get intelligent field selection based on context
function getIntelligentFields(context: ExportContext, options: {
  includeResponsibleEmployee?: boolean;
  includeCompanyMapping?: boolean;
}): string[] {
  const baseFields = ['Name', 'Email', 'Phone1', 'Active'];
  
  // Add fields based on resource type
  if (context.resourceTypes) {
    if (context.resourceTypes.includes(ResourceTypes.CLIENT) || 
        context.resourceTypes.includes(ResourceTypes.PROSPECT)) {
      baseFields.push('City', 'Country', 'Address1');
      if (options.includeResponsibleEmployee) {
        baseFields.push('ResponsibleEmployee');
      }
    }
    
    if (context.resourceTypes.includes(ResourceTypes.CONTACT_PERSON)) {
      baseFields.push('Initials');
      if (options.includeCompanyMapping) {
        baseFields.push('CompanyName', 'ContactType');
      }
    }
    
    if (context.resourceTypes.includes(ResourceTypes.EMPLOYEE)) {
      baseFields.push('Initials');
      // Note: UserLogin excluded for security reasons
    }
  }
  
  // Always include ID and TypeId for reference
  return ['Id', ...baseFields, 'TypeId'];
}

// Enhanced resource enrichment with responsible employee and company mapping
async function enrichResourcesWithDetails(
  resources: Resource[], 
  workbookClient: WorkbookClient, 
  options: {
    includeResponsibleEmployee?: boolean;
    includeCompanyMapping?: boolean;
  }
): Promise<Resource[]> {
  console.log(`🔄 Enriching ${resources.length} resources with additional details...`);
  
  // Get all unique responsible resource IDs and parent company IDs needed
  const responsibleIds = new Set<number>();
  const parentCompanyIds = new Set<number>();
  
  resources.forEach(resource => {
    if (options.includeResponsibleEmployee && resource.ResponsibleResourceId) {
      responsibleIds.add(resource.ResponsibleResourceId);
    }
    
    if (options.includeCompanyMapping && resource.TypeId === ResourceTypes.CONTACT_PERSON) {
      if (resource.ParentResourceId) {
        parentCompanyIds.add(resource.ParentResourceId);
      }
    }
  });
  
  // Fetch responsible employee details if needed
  const employeeMap = new Map<number, string>();
  if (options.includeResponsibleEmployee && responsibleIds.size > 0) {
    console.log(`👥 Fetching ${responsibleIds.size} responsible employee details...`);
    
    for (const empId of responsibleIds) {
      try {
        const empResponse = await workbookClient.resources.getById(empId);
        if (empResponse.success && empResponse.data) {
          employeeMap.set(empId, empResponse.data.Name || `Employee ${empId}`);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to fetch employee ${empId}:`, error);
        employeeMap.set(empId, `Employee ${empId}`);
      }
    }
  }
  
  // Fetch parent company details for contact persons if needed
  const companyMap = new Map<number, string>();
  if (options.includeCompanyMapping && parentCompanyIds.size > 0) {
    console.log(`🏢 Fetching ${parentCompanyIds.size} parent company details...`);
    
    for (const companyId of parentCompanyIds) {
      try {
        const companyResponse = await workbookClient.resources.getById(companyId);
        if (companyResponse.success && companyResponse.data) {
          companyMap.set(companyId, companyResponse.data.Name || `Company ${companyId}`);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to fetch company ${companyId}:`, error);
        companyMap.set(companyId, `Company ${companyId}`);
      }
    }
  }
  
  // Enrich resources with additional data
  const enrichedResources = resources.map(resource => {
    const enriched: EnrichedResource = { ...resource };
    
    // Add responsible employee name
    if (options.includeResponsibleEmployee && resource.ResponsibleResourceId) {
      enriched.ResponsibleEmployee = employeeMap.get(resource.ResponsibleResourceId) || 
                                   `Employee ${resource.ResponsibleResourceId}`;
    }
    
    // Add company mapping for contacts
    if (options.includeCompanyMapping && resource.TypeId === ResourceTypes.CONTACT_PERSON) {
      // Use proper parent company relationship
      if (resource.ParentResourceId && companyMap.has(resource.ParentResourceId)) {
        enriched.CompanyName = companyMap.get(resource.ParentResourceId);
      } else {
        // Fallback to ResourceFolder/ProjectName if ParentResourceId not available
        enriched.CompanyName = resource.ResourceFolder || resource.ProjectName || 'Unknown Company';
      }
      enriched.ContactType = 'Contact Person';
    }
    
    return enriched;
  });
  
  console.log('Resource enrichment complete');
  return enrichedResources;
}

/**
 * Map common country names to their ISO2 codes
 * Based on Workbook API's Country field format
 */
function getCountryCode(countryName: string): string | null {
  const countryMap: Record<string, string> = {
    // Nordic countries
    'denmark': 'DK',
    'danmark': 'DK',
    'danish': 'DK',
    'norway': 'NO',
    'norge': 'NO',
    'norwegian': 'NO',
    'sweden': 'SE', 
    'sverige': 'SE',
    'swedish': 'SE',
    'finland': 'FI',
    'suomi': 'FI',
    'finnish': 'FI',
    'iceland': 'IS',
    'ísland': 'IS',
    'icelandic': 'IS',
    
    // Major European countries
    'germany': 'DE',
    'deutschland': 'DE',
    'german': 'DE',
    'united kingdom': 'GB',
    'uk': 'GB',
    'britain': 'GB',
    'british': 'GB',
    'england': 'GB',
    'france': 'FR',
    'french': 'FR',
    'netherlands': 'NL',
    'holland': 'NL',
    'dutch': 'NL',
    'belgium': 'BE',
    'belgian': 'BE',
    'spain': 'ES',
    'spanish': 'ES',
    'italy': 'IT',
    'italian': 'IT',
    'austria': 'AT',
    'austrian': 'AT',
    'switzerland': 'CH',
    'swiss': 'CH',
    
    // Others
    'czech republic': 'CZ',
    'czech': 'CZ',
    'poland': 'PL',
    'polish': 'PL',
    'usa': 'US',
    'united states': 'US',
    'america': 'US',
    'american': 'US',
    'canada': 'CA',
    'canadian': 'CA'
  };
  
  const normalized = countryName.toLowerCase().trim();
  return countryMap[normalized] || null;
}