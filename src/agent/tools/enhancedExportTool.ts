import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { WorkbookClient, Resource } from '../../services/index.js';
import * as fs from 'fs';
import * as path from 'path';

interface ValidationError {
  path: (string | number)[];
  message: string;
}

/**
 * Create enhanced Export Tool for multi-format data export
 * Factory function that accepts initialized WorkbookClient
 */
export function createEnhancedExportTool(workbookClient: WorkbookClient): ReturnType<typeof createTool> {
  return createTool({
  id: 'enhanced-export',
  description: `Export Workbook data in multiple formats with advanced customization. Use this tool to:
  - Export resource data to CSV, JSON, or formatted text
  - Custom field selection and filtering
  - Apply filters by type, status, company, department
  - Generate formatted reports with statistics
  - Save exports to files or return as data
  
  Supports comprehensive data export with business-friendly formatting.`,
  
  inputSchema: z.object({
    format: z.enum(['csv', 'json', 'report', 'statistics'])
      .default('csv')
      .describe('Export format: csv (spreadsheet), json (structured), report (formatted text), statistics (summary)'),
    
    exportType: z.enum(['all', 'filtered', 'custom'])
      .default('all')
      .describe('Export scope: all resources, filtered subset, or custom selection'),
    
    // Filtering options
    resourceTypes: z.array(z.number())
      .optional()
      .describe('Filter by resource types (2=Employee, 10=Contact)'),
    active: z.boolean()
      .optional()
      .describe('Filter by active status'),
    companyIds: z.array(z.number())
      .optional()
      .describe('Filter by specific company IDs'),
    departmentIds: z.array(z.number())
      .optional()
      .describe('Filter by department IDs'),
    
    // Field selection
    fields: z.array(z.enum([
      'Id', 'Name', 'Email', 'Phone1', 'Active', 'TypeId', 
      'ResponsibleResourceId', 'ResourceFolder', 'ProjectName', 'Initials', 
      'Address1', 'City', 'Country', 'UserLogin'
    ]))
      .optional()
      .describe('Specific fields to include (if not specified, includes key fields)'),
    
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
      .min(1)
      .max(5000)
      .optional()
      .describe('Limit number of records (default: no limit)')
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
      activeRecords: z.number(),
      inactiveRecords: z.number(),
      employeeCount: z.number(),
      contactCount: z.number(),
      companiesWithContacts: z.number()
    }).optional(),
    exportedFields: z.array(z.string()),
    exportTime: z.string(),
    fileSize: z.string().optional()
  }),
  
  execute: async ({ context }) => {
    console.log('📤 Enhanced Export Tool - Starting export...', context);
    
    try {
      // Validate input against schema
      const exportTool = createEnhancedExportTool(workbookClient);
      const validationResult = exportTool.inputSchema?.safeParse(context);
      if (!validationResult?.success) {
        const errors = validationResult?.error?.errors?.map((e: ValidationError) => `${e.path.join('.')}: ${e.message}`).join(', ') || 'Validation failed';
        return {
          success: false,
          format: context.format || 'unknown',
          recordCount: 0,
          preview: `❌ Input validation failed: ${errors}`,
          exportedFields: [],
          exportTime: new Date().toISOString()
        };
      }
      
      const {
        format,
        exportType,
        resourceTypes,
        active,
        companyIds,
        departmentIds,
        fields,
        includeInactive,
        includeContactCounts,
        saveToFile,
        fileName,
        limit
      } = validationResult.data;

      // Build search parameters
      const searchParams: Record<string, any> = {};
      
      if (resourceTypes) searchParams.ResourceType = resourceTypes;
      if (active !== undefined) searchParams.Active = active;
      if (companyIds) searchParams.CompanyIds = companyIds;
      if (departmentIds) searchParams.DepartmentIds = departmentIds;

      // Get data from WorkbookClient
      console.log('🔍 Fetching resources with parameters:', searchParams);
      const response = await workbookClient.resources.search(searchParams);
      
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch resource data');
      }

      let resources = response.data;
      
      // Apply post-fetch filtering
      if (!includeInactive) {
        resources = resources.filter(r => r.Active);
      }
      
      // Apply limit
      if (limit) {
        resources = resources.slice(0, limit);
      }

      // Define default fields if none specified
      const exportFields = fields || [
        'Id', 'Name', 'Email', 'Phone1', 'Active', 'TypeId', 
        'ResourceFolder', 'Initials', 'City', 'Country'
      ];

      // Calculate statistics
      const stats = {
        totalRecords: resources.length,
        activeRecords: resources.filter(r => r.Active).length,
        inactiveRecords: resources.filter(r => !r.Active).length,
        employeeCount: resources.filter(r => r.TypeId === 2).length,
        contactCount: resources.filter(r => r.TypeId === 10).length,
        companiesWithContacts: new Set(
          resources
            .filter(r => r.TypeId === 10 && (r.ResourceFolder || r.ProjectName))
            .map(r => r.ResourceFolder || r.ProjectName)
        ).size
      };

      let exportData: any;
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
      if (saveToFile) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const defaultFileName = `workbook-export-${format}-${timestamp}`;
        const actualFileName = fileName || defaultFileName;
        const fileExtension = format === 'csv' ? 'csv' : 
                            format === 'json' ? 'json' : 'txt';
        
        const exportsDir = path.join(process.cwd(), 'exports');
        if (!fs.existsSync(exportsDir)) {
          fs.mkdirSync(exportsDir, { recursive: true });
        }
        
        filePath = path.join(exportsDir, `${actualFileName}.${fileExtension}`);
        fs.writeFileSync(filePath, exportData, 'utf-8');
        
        // Calculate file size
        const fileSizeBytes = Buffer.byteLength(exportData, 'utf-8');
        fileSize = formatFileSize(fileSizeBytes);
        
        console.log(`💾 Export saved to: ${filePath}`);
      }

      console.log(`✅ Export completed: ${stats.totalRecords} records in ${format} format`);

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
        fileSize
      };

    } catch (error) {
      console.error('❌ Enhanced Export Tool error:', error);
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
function filterFields(resource: Resource, fields: string[]): Record<string, any> {
  const filtered: Record<string, any> = {};
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

function generateReport(resources: Resource[], stats: any, fields: string[]): string {
  const timestamp = new Date().toLocaleString();
  
  let report = `# Workbook Resource Export Report\n`;
  report += `Generated: ${timestamp}\n\n`;
  
  report += `## Summary Statistics\n`;
  report += `- Total Resources: ${stats.totalRecords}\n`;
  report += `- Active: ${stats.activeRecords}\n`;
  report += `- Inactive: ${stats.inactiveRecords}\n`;
  report += `- Employees: ${stats.employeeCount}\n`;
  report += `- Contacts: ${stats.contactCount}\n`;
  report += `- Companies with Contacts: ${stats.companiesWithContacts}\n\n`;
  
  report += `## Exported Fields\n`;
  report += fields.map(f => `- ${f}`).join('\n') + '\n\n';
  
  report += `## Resource Data\n`;
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

function generateStatistics(stats: any, resources: Resource[]): string {
  const timestamp = new Date().toLocaleString();
  
  let report = `# Workbook Database Statistics\n`;
  report += `Generated: ${timestamp}\n\n`;
  
  report += `## Overview\n`;
  report += `- Total Resources: ${stats.totalRecords}\n`;
  report += `- Active: ${stats.activeRecords} (${((stats.activeRecords / stats.totalRecords) * 100).toFixed(1)}%)\n`;
  report += `- Inactive: ${stats.inactiveRecords} (${((stats.inactiveRecords / stats.totalRecords) * 100).toFixed(1)}%)\n\n`;
  
  report += `## Resource Types\n`;
  report += `- Employees: ${stats.employeeCount} (${((stats.employeeCount / stats.totalRecords) * 100).toFixed(1)}%)\n`;
  report += `- Contacts: ${stats.contactCount} (${((stats.contactCount / stats.totalRecords) * 100).toFixed(1)}%)\n\n`;
  
  report += `## Company Distribution\n`;
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
    report += `\n### Top Companies by Contact Count\n`;
    topCompanies.forEach(([company, count], index) => {
      report += `${index + 1}. ${company}: ${count} contacts\n`;
    });
  }
  
  return report;
}

function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}