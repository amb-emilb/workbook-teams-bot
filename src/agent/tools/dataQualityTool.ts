import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { WorkbookClient, Resource } from '../../services/index.js';
import { ResourceTypes, ResourceTypeNames } from '../../constants/resourceTypes.js';

/**
 * Create data quality analysis tool for Workbook CRM
 * Factory function that accepts initialized WorkbookClient
 */
export function createDataQualityTool(workbookClient: WorkbookClient) {
  return createTool({
    id: 'data-quality-analysis',
    description: `Analyze data quality in the Workbook CRM system. Use this tool when users ask to:
  - Check data completeness and quality
  - Find missing or incomplete information
  - Identify duplicate records
  - Get data health recommendations
  - Analyze data integrity issues
  
  Provides comprehensive analysis of missing emails, incomplete profiles, duplicates, and orphaned records.`,
  
    inputSchema: z.object({
      analysisType: z.enum(['overview', 'detailed', 'issues-only'])
        .default('overview')
        .describe('Type of analysis: overview (summary), detailed (full report), issues-only (problems only)'),
      resourceType: z.array(z.number())
        .optional()
        .describe('Resource types to analyze: [1=Companies, 2=Employees, 3=Clients]. Leave empty for all types.'),
      includeRecommendations: z.boolean()
        .default(true)
        .describe('Whether to include improvement recommendations'),
      duplicateThreshold: z.number()
        .min(0)
        .max(1)
        .default(0.8)
        .describe('Similarity threshold for duplicate detection (0-1, default: 0.8)')
    }),
  
    outputSchema: z.object({
      overview: z.object({
        totalResources: z.number(),
        completeness: z.number(),
        healthScore: z.number(),
        criticalIssues: z.number()
      }),
      issues: z.object({
        missingEmails: z.array(z.object({
          id: z.number(),
          name: z.string(),
          type: z.string()
        })),
        missingNames: z.array(z.object({
          id: z.number(),
          type: z.string()
        })),
        orphanedRecords: z.array(z.object({
          id: z.number(),
          name: z.string(),
          type: z.string()
        })),
        invalidEmails: z.array(z.object({
          id: z.number(),
          name: z.string(),
          email: z.string()
        })),
        duplicateNames: z.array(z.object({
          name: z.string(),
          similarity: z.number(),
          resources: z.array(z.object({
            id: z.number(),
            name: z.string(),
            type: z.string()
          }))
        }))
      }),
      recommendations: z.array(z.string()).optional(),
      summary: z.string()
    }),
  
    execute: async ({ context }) => {
      try {
        const { 
          analysisType = 'overview', 
          resourceType, 
          includeRecommendations = true
        } = context;
      
        console.log(`📊 Starting data quality analysis (${analysisType})...`);
      
        // Get complete dataset
        const allResourcesResponse = await workbookClient.resources.getAllResourcesComplete();
      
        if (!allResourcesResponse.success || !allResourcesResponse.data) {
          return {
            overview: { totalResources: 0, completeness: 0, healthScore: 0, criticalIssues: 0 },
            issues: { missingEmails: [], missingNames: [], orphanedRecords: [], invalidEmails: [], duplicateNames: [] },
            recommendations: [],
            summary: `Error fetching resources: ${allResourcesResponse.error}`
          };
        }
      
        let resources = allResourcesResponse.data;
      
        // Apply resource type filter if specified
        if (resourceType && resourceType.length > 0) {
          resources = resources.filter(r => resourceType.includes(r.TypeId || 0));
        }
      
        // Email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const typeNames = ResourceTypeNames;
      
        // Analyze issues
        const issues = {
          missingEmails: resources
            .filter(r => !r.Email || r.Email.trim() === '')
            .map(r => ({
              id: r.Id,
              name: r.Name || 'Unknown',
              type: typeNames[r.TypeId as keyof typeof typeNames] || `Type${r.TypeId}`
            })),
          
          missingNames: resources
            .filter(r => !r.Name || r.Name.trim() === '')
            .map(r => ({
              id: r.Id,
              type: typeNames[r.TypeId as keyof typeof typeNames] || `Type${r.TypeId}`
            })),
          
          orphanedRecords: resources
            .filter(r => (r.TypeId === ResourceTypes.COMPANY || 
                         r.TypeId === ResourceTypes.CLIENT || 
                         r.TypeId === ResourceTypes.PROSPECT) && !r.ResponsibleResourceId)
            .map(r => ({
              id: r.Id,
              name: r.Name || 'Unknown',
              type: typeNames[r.TypeId as keyof typeof typeNames] || `Type${r.TypeId}`
            })),
          
          invalidEmails: resources
            .filter(r => r.Email && r.Email.trim() !== '' && !emailRegex.test(r.Email))
            .map(r => ({
              id: r.Id,
              name: r.Name || 'Unknown',
              email: r.Email || ''
            })),
          
          duplicateNames: [] as Array<{ name: string; similarity: number; resources: Array<{ id: number; name: string; type: string; }> }>
        };
      
        // Detect duplicate names using simple similarity
        if (analysisType === 'detailed' || analysisType === 'issues-only') {
          const nameGroups = new Map<string, Resource[]>();
        
          resources.forEach(resource => {
            const name = resource.Name?.trim().toLowerCase();
            if (name) {
              if (!nameGroups.has(name)) {
                nameGroups.set(name, []);
              }
            nameGroups.get(name)!.push(resource);
            }
          });
        
          // Find exact name duplicates
          nameGroups.forEach((group, name) => {
            if (group.length > 1) {
              issues.duplicateNames.push({
                name: group[0].Name || name,
                similarity: 1.0,
                resources: group.map(r => ({
                  id: r.Id,
                  name: r.Name || 'Unknown',
                  type: typeNames[r.TypeId as keyof typeof typeNames] || `Type${r.TypeId}`
                }))
              });
            }
          });
        }
      
        // Calculate metrics
        const totalResources = resources.length;
        const criticalIssues = issues.missingNames.length + issues.invalidEmails.length + issues.orphanedRecords.length;
      
        // Calculate completeness score
        const completeResources = resources.filter(r => 
          r.Name && r.Name.trim() !== '' &&
        r.Email && r.Email.trim() !== '' && emailRegex.test(r.Email) &&
        (r.TypeId === ResourceTypes.EMPLOYEE || r.ResponsibleResourceId) // Employees don't need ResponsibleResourceId
        );
      
        const completeness = totalResources > 0 ? Math.round((completeResources.length / totalResources) * 100) : 0;
      
        // Calculate health score (0-100)
        const healthScore = Math.max(0, 100 - (
          (issues.missingEmails.length * 2) +         // Missing emails: -2 points each
        (issues.missingNames.length * 5) +          // Missing names: -5 points each  
        (issues.orphanedRecords.length * 3) +       // Orphaned: -3 points each
        (issues.invalidEmails.length * 4) +         // Invalid emails: -4 points each
        (issues.duplicateNames.length * 3)          // Duplicates: -3 points each
        ));
      
        // Generate recommendations
        const recommendations: string[] = [];
        if (includeRecommendations) {
          if (issues.missingEmails.length > 0) {
            recommendations.push(`Add email addresses for ${issues.missingEmails.length} resources`);
          }
          if (issues.orphanedRecords.length > 0) {
            recommendations.push(`Assign responsible employees for ${issues.orphanedRecords.length} client companies`);
          }
          if (issues.invalidEmails.length > 0) {
            recommendations.push(`Fix ${issues.invalidEmails.length} invalid email formats`);
          }
          if (issues.duplicateNames.length > 0) {
            recommendations.push(`Review ${issues.duplicateNames.length} potential duplicate records`);
          }
          if (completeness < 80) {
            recommendations.push('Focus on improving data completeness (currently below 80%)');
          }
          if (healthScore < 70) {
            recommendations.push('Data quality requires immediate attention (health score below 70)');
          }
        }
      
        const cacheStatus = allResourcesResponse.cached ? ' (cached)' : '';
      
        return {
          overview: {
            totalResources,
            completeness,
            healthScore: Math.round(healthScore),
            criticalIssues
          },
          issues,
          recommendations: includeRecommendations ? recommendations : undefined,
          summary: `EXACT DATA: Analyzed ${totalResources} resources, completeness ${completeness}%, health score ${Math.round(healthScore)}/100. Issues: ${issues.missingEmails.length} missing emails, ${issues.orphanedRecords.length} orphaned records, ${issues.invalidEmails.length} invalid emails${cacheStatus}`
        };
      
      } catch (error) {
        console.error('❌ Error in dataQualityTool:', error);
      
        return {
          overview: { totalResources: 0, completeness: 0, healthScore: 0, criticalIssues: 0 },
          issues: { missingEmails: [], missingNames: [], orphanedRecords: [], invalidEmails: [], duplicateNames: [] },
          recommendations: [],
          summary: `Error analyzing data quality: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }
  });
}