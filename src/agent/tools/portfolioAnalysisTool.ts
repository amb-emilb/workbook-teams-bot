import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { WorkbookClient } from '../../services/index.js';

/**
 * Create portfolio analysis tool for analyzing employee workload and client distribution
 * Factory function that accepts initialized WorkbookClient
 */
export function createPortfolioAnalysisTool(workbookClient: WorkbookClient) {
  return createTool({
    id: 'portfolio-analysis',
    description: `Analyze employee portfolios and client distribution in Workbook CRM. Use this tool to:
  - View employee workload and client assignments
  - Analyze client distribution across employees
  - Identify workload imbalances
  - Get contact counts per client
  - Find top clients by contact volume
  
  Provides comprehensive workload analysis and distribution metrics.`,
  
    inputSchema: z.object({
      employeeId: z.number()
        .optional()
        .describe('Specific employee ID to analyze. Leave empty to analyze all employees.'),
      employeeName: z.string()
        .optional()
        .describe('Employee name to search for (alternative to ID)'),
      includeContactCounts: z.boolean()
        .default(false)
        .describe('Whether to fetch contact counts (requires API calls per client - set to true only when needed)'),
      includeInactiveClients: z.boolean()
        .default(false)
        .describe('Whether to include inactive clients in the analysis'),
      topClientsLimit: z.number()
        .min(1)
        .max(10)
        .default(5)
        .describe('Number of top clients to show per employee (1-10, default: 5)'),
      analysisMode: z.enum(['summary', 'detailed', 'top-performers'])
        .default('summary')
        .describe('Analysis mode: summary (client counts only), detailed (with contacts), top-performers (top 10 employees)')
    }),
  
    outputSchema: z.object({
      portfolios: z.array(z.object({
        employee: z.object({
          id: z.number(),
          name: z.string(),
          email: z.string().optional()
        }),
        clientCount: z.number(),
        activeClients: z.number(),
        inactiveClients: z.number(),
        totalContacts: z.number(),
        avgContactsPerClient: z.number(),
        topClients: z.array(z.object({
          id: z.number(),
          name: z.string(),
          contactCount: z.number(),
          active: z.boolean()
        }))
      })),
      summary: z.object({
        totalEmployees: z.number(),
        totalClients: z.number(),
        avgClientsPerEmployee: z.number(),
        maxClientsPerEmployee: z.number(),
        minClientsPerEmployee: z.number(),
        workloadDistribution: z.enum(['balanced', 'uneven', 'concentrated'])
      }),
      message: z.string()
    }),
  
    execute: async ({ context }) => {
      try {
        const { 
          employeeId, 
          employeeName,
          includeContactCounts = false, 
          includeInactiveClients = false,
          topClientsLimit = 5,
          analysisMode = 'summary'
        } = context;
      
        console.log('📊 Starting portfolio analysis...');
      
        // Get complete dataset
        const allResourcesResponse = await workbookClient.resources.getAllResourcesComplete();
      
        if (!allResourcesResponse.success || !allResourcesResponse.data) {
          return {
            portfolios: [],
            summary: {
              totalEmployees: 0,
              totalClients: 0,
              avgClientsPerEmployee: 0,
              maxClientsPerEmployee: 0,
              minClientsPerEmployee: 0,
              workloadDistribution: 'balanced' as const
            },
            message: `Error fetching resources: ${allResourcesResponse.error}`
          };
        }
      
        const allResources = allResourcesResponse.data;
      
        // Identify employees (TypeId 2) 
        let employees = allResources.filter(r => r.TypeId === 2);
      
        // Filter to specific employee if requested
        if (employeeId) {
          employees = employees.filter(e => e.Id === employeeId);
        } else if (employeeName) {
          const lowerName = employeeName.toLowerCase();
          employees = employees.filter(e => 
            e.Name?.toLowerCase().includes(lowerName) ||
          e.Initials?.toLowerCase().includes(lowerName)
          );
        }
      
        // Identify all clients (TypeId 1 or 3)
        let allClients = allResources.filter(r => r.TypeId === 1 || r.TypeId === 3);
      
        // Filter out inactive clients if requested
        if (!includeInactiveClients) {
          allClients = allClients.filter(c => c.Active);
        }
      
        // Apply analysis mode filtering
        if (!employeeId && !employeeName) {
        // Pre-calculate client counts for all employees
          const employeeClientCounts = employees.map(emp => ({
            employee: emp,
            clientCount: allClients.filter(c => c.ResponsibleResourceId === emp.Id).length
          }));
        
          if (analysisMode === 'top-performers' || analysisMode === 'detailed') {
          // For detailed analysis or top performers, limit to top 10 employees
            const topEmployees = employeeClientCounts
              .filter(e => e.clientCount > 0)
              .sort((a, b) => b.clientCount - a.clientCount)
              .slice(0, 10)
              .map(e => e.employee);
          
            employees = topEmployees;
            console.log(`📊 Analyzing top ${employees.length} employees by client count`);
          } else {
          // For summary mode, include all employees with clients but don't fetch contact details
            employees = employeeClientCounts
              .filter(e => e.clientCount > 0)
              .map(e => e.employee);
            console.log(`📊 Summary analysis of ${employees.length} employees with clients`);
          }
        }
      
        // Build portfolio data for each employee
        const portfolios = await Promise.all(
          employees.map(async employee => {
          // Find clients assigned to this employee
            const assignedClients = allClients.filter(c => c.ResponsibleResourceId === employee.Id);
          
            // Calculate contact counts based on mode and settings
            let totalContacts = 0;
            let clientsWithContacts;
          
            // Only fetch contact counts in detailed mode OR when explicitly requested
            const shouldFetchContacts = (analysisMode === 'detailed' || includeContactCounts) && assignedClients.length > 0;
          
            if (shouldFetchContacts) {
            // For detailed analysis, only fetch contacts for top clients to show
              const clientsToFetchContacts = assignedClients.slice(0, topClientsLimit);
            
              // Fetch contact counts only for top clients
              const topClientsWithContacts = await Promise.all(
                clientsToFetchContacts.map(async client => {
                  const contactsResponse = await workbookClient.resources.getContactsForResource(client.Id);
                  const contactCount = contactsResponse.success ? (contactsResponse.data?.length || 0) : 0;
                  totalContacts += contactCount;
                
                  return {
                    id: client.Id,
                    name: client.Name || 'Unknown',
                    contactCount,
                    active: client.Active
                  };
                })
              );
            
              // Add remaining clients without contact counts (for accurate client count)
              const remainingClients = assignedClients.slice(topClientsLimit).map(client => ({
                id: client.Id,
                name: client.Name || 'Unknown',
                contactCount: -1, // -1 indicates not fetched
                active: client.Active
              }));
            
              clientsWithContacts = [...topClientsWithContacts, ...remainingClients];
            
            // Note: totalContacts only reflects the top clients we fetched
            // We don't estimate for the rest to maintain accuracy
            } else {
            // Summary mode or contact counts not requested
              clientsWithContacts = assignedClients.map(client => ({
                id: client.Id,
                name: client.Name || 'Unknown',
                contactCount: -1, // -1 indicates not fetched
                active: client.Active
              }));
            }
          
            // Sort clients by contact count (only those with actual counts, -1 goes to end)
            const topClients = clientsWithContacts
              .sort((a, b) => {
                if (a.contactCount === -1) {return 1;}
                if (b.contactCount === -1) {return -1;}
                return b.contactCount - a.contactCount;
              })
              .slice(0, topClientsLimit)
              .map(client => ({
                ...client,
                contactCount: client.contactCount === -1 ? 0 : client.contactCount
              }));
          
            const activeCount = assignedClients.filter(c => c.Active).length;
            const inactiveCount = assignedClients.length - activeCount;
          
            // Calculate average only from fetched contacts
            const fetchedClientsCount = clientsWithContacts.filter(c => c.contactCount !== -1).length;
            const avgContacts = fetchedClientsCount > 0 
              ? Math.round((totalContacts / fetchedClientsCount) * 10) / 10 
              : 0;
          
            return {
              employee: {
                id: employee.Id,
                name: employee.Name || 'Unknown',
                email: employee.Email || undefined
              },
              clientCount: assignedClients.length,
              activeClients: activeCount,
              inactiveClients: inactiveCount,
              totalContacts,
              avgContactsPerClient: avgContacts,
              topClients
            };
          })
        );
      
        // Filter out employees with no clients unless specifically requested
        const filteredPortfolios = employeeId || employeeName 
          ? portfolios 
          : portfolios.filter(p => p.clientCount > 0);
      
        // Calculate summary statistics
        const clientCounts = filteredPortfolios.map(p => p.clientCount);
        const totalClients = clientCounts.reduce((sum, count) => sum + count, 0);
        const avgClients = filteredPortfolios.length > 0 
          ? Math.round((totalClients / filteredPortfolios.length) * 10) / 10 
          : 0;
        const maxClients = Math.max(...clientCounts, 0);
        const minClients = clientCounts.length > 0 ? Math.min(...clientCounts) : 0;
      
        // Determine workload distribution
        let workloadDistribution: 'balanced' | 'uneven' | 'concentrated';
        if (filteredPortfolios.length === 0) {
          workloadDistribution = 'balanced';
        } else {
          const stdDev = Math.sqrt(
            clientCounts.reduce((sum, count) => sum + Math.pow(count - avgClients, 2), 0) / clientCounts.length
          );
          const coefficientOfVariation = avgClients > 0 ? stdDev / avgClients : 0;
        
          if (coefficientOfVariation < 0.3) {
            workloadDistribution = 'balanced';
          } else if (coefficientOfVariation < 0.6) {
            workloadDistribution = 'uneven';
          } else {
            workloadDistribution = 'concentrated';
          }
        }
      
        const cacheStatus = allResourcesResponse.cached ? ' (cached)' : '';
        const modeDescription = analysisMode === 'detailed' ? ' with contact details' 
          : analysisMode === 'top-performers' ? ' (top performers)'
            : ' (summary only)';
      
        return {
          portfolios: filteredPortfolios,
          summary: {
            totalEmployees: filteredPortfolios.length,
            totalClients,
            avgClientsPerEmployee: avgClients,
            maxClientsPerEmployee: maxClients,
            minClientsPerEmployee: minClients,
            workloadDistribution
          },
          message: `Portfolio analysis complete${modeDescription}: ${filteredPortfolios.length} employees managing ${totalClients} clients (workload: ${workloadDistribution})${cacheStatus}`
        };
      
      } catch (error) {
        console.error('❌ Error in portfolioAnalysisTool:', error);
      
        return {
          portfolios: [],
          summary: {
            totalEmployees: 0,
            totalClients: 0,
            avgClientsPerEmployee: 0,
            maxClientsPerEmployee: 0,
            minClientsPerEmployee: 0,
            workloadDistribution: 'balanced' as const
          },
          message: `Error analyzing portfolios: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }
  });
}