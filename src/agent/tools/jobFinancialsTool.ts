import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { WorkbookClient } from '../../services/index.js';
import { MappedDepartmentProfitSplit, MappedDepartment } from '../../types/job-api.types.js';

/**
 * Create job financials tool for cost analysis and profitability tracking
 * Factory function that accepts initialized WorkbookClient
 */
export function createJobFinancialsTool(workbookClient: WorkbookClient) {
  return createTool({
    id: 'job-financials',
    description: `JOB FINANCIALS TOOL - Use this tool for cost analysis and profitability tracking.

    PRIMARY USE CASES:
    - Analyze job costs, revenues, and profitability
    - Track budget vs actual spending
    - Generate financial reports and forecasts
    - Calculate project margins and ROI
    - Monitor billing rates and price optimization
    
    DO NOT USE for:
    - Job creation or management (use jobManagementTool instead)
    - Resource allocation and capacity planning (use resourcePlanningTool instead)
    - Time entry recording or task scheduling (use jobManagementTool instead)
    
    This tool focuses on financial analysis, cost tracking, and profitability metrics.`,

    inputSchema: z.object({
      operation: z.enum(['get_costs', 'get_revenue', 'analyze_profitability', 'budget_analysis', 'price_optimization', 'financial_forecast', 'department_breakdown'])
        .describe('Operation to perform on job financials'),
      
      // Job identification
      jobId: z.number()
        .optional()
        .describe('Job ID for specific job financial analysis'),
      jobIds: z.array(z.number())
        .optional()
        .describe('Array of job IDs for portfolio analysis'),
      clientId: z.number()
        .optional()
        .describe('Client ID for client-level financial analysis'),
      projectId: z.number()
        .optional()
        .describe('Project ID for project-level analysis'),
      
      // Time period filters
      startDate: z.string()
        .optional()
        .describe('Start date for financial analysis (ISO format)'),
      endDate: z.string()
        .optional()
        .describe('End date for financial analysis (ISO format)'),
      periodType: z.enum(['week', 'month', 'quarter', 'year'])
        .default('month')
        .describe('Time period granularity for analysis'),
      
      // Financial parameters
      currencyId: z.number()
        .default(1)
        .describe('Currency ID (1=DKK, 5=EUR, etc.)'),
      includeExpenses: z.boolean()
        .default(true)
        .describe('Include expense costs in analysis'),
      includeForecast: z.boolean()
        .default(false)
        .describe('Include forecasted amounts in calculations'),
      marginThreshold: z.number()
        .min(0)
        .max(100)
        .default(20)
        .describe('Minimum acceptable profit margin percentage'),
      
      // Budget analysis parameters
      budgetType: z.enum(['original', 'revised', 'current'])
        .default('current')
        .describe('Budget type for comparison analysis'),
      varianceThreshold: z.number()
        .min(0)
        .default(10)
        .describe('Variance threshold percentage for alerts'),
      
      // Price optimization parameters
      targetMargin: z.number()
        .min(0)
        .max(100)
        .optional()
        .describe('Target profit margin for price optimization'),
      competitiveRate: z.number()
        .min(0)
        .optional()
        .describe('Competitive market rate for comparison'),
      
      // Filtering options
      includeCompleted: z.boolean()
        .default(true)
        .describe('Include completed jobs in analysis'),
      limit: z.number()
        .min(1)
        .max(100)
        .default(20)
        .describe('Maximum number of jobs to analyze')
    }),

    outputSchema: z.object({
      success: z.boolean(),
      operation: z.string(),
      message: z.string(),
      jobFinancials: z.object({
        jobId: z.number(),
        jobName: z.string(),
        clientName: z.string(),
        currency: z.string(),
        costs: z.object({
          totalCost: z.number(),
          laborCost: z.number(),
          expenseCost: z.number(),
          overheadCost: z.number(),
          actualHours: z.number(),
          averageHourlyRate: z.number()
        }),
        revenue: z.object({
          totalRevenue: z.number(),
          invoicedAmount: z.number(),
          remainingToInvoice: z.number(),
          billedHours: z.number(),
          averageBillRate: z.number()
        }),
        profitability: z.object({
          grossProfit: z.number(),
          grossMargin: z.number(),
          netProfit: z.number(),
          netMargin: z.number(),
          roi: z.number()
        }),
        budget: z.object({
          budgetedAmount: z.number(),
          budgetedHours: z.number(),
          variance: z.number(),
          variancePercentage: z.number(),
          status: z.string()
        }).optional()
      }).optional(),
      portfolioAnalysis: z.array(z.object({
        jobId: z.number(),
        jobName: z.string(),
        totalRevenue: z.number(),
        totalCost: z.number(),
        grossMargin: z.number(),
        status: z.string(),
        riskLevel: z.string()
      })).optional(),
      costBreakdown: z.object({
        laborCosts: z.array(z.object({
          resourceName: z.string(),
          hours: z.number(),
          rate: z.number(),
          cost: z.number()
        })),
        expenseCosts: z.array(z.object({
          expenseType: z.string(),
          amount: z.number(),
          description: z.string()
        })),
        totalsByCategory: z.object({
          development: z.number(),
          management: z.number(),
          design: z.number(),
          other: z.number()
        })
      }).optional(),
      forecast: z.object({
        period: z.string(),
        forecastedRevenue: z.number(),
        forecastedCosts: z.number(),
        forecastedMargin: z.number(),
        completionDate: z.string(),
        riskFactors: z.array(z.string()),
        recommendations: z.array(z.string())
      }).optional(),
      priceOptimization: z.object({
        currentRate: z.number(),
        suggestedRate: z.number(),
        impactAnalysis: z.object({
          revenueIncrease: z.number(),
          marginImprovement: z.number(),
          competitivePosition: z.string()
        }),
        recommendations: z.array(z.string())
      }).optional(),
      summary: z.object({
        totalJobs: z.number(),
        totalRevenue: z.number(),
        totalCosts: z.number(),
        averageMargin: z.number(),
        profitableJobs: z.number(),
        unprofitableJobs: z.number(),
        topPerformingJob: z.string().optional(),
        underperformingJobs: z.array(z.string()),
        periodCovered: z.object({
          from: z.string(),
          to: z.string()
        })
      }).optional()
    }),

    execute: async ({ context }) => {
      try {
        const {
          operation,
          jobId,
          jobIds,
          startDate,
          endDate,
          periodType,
          currencyId,
          varianceThreshold,
          targetMargin,
          competitiveRate,
          limit
        } = context;

        console.log(`💰 Job Financials Tool - Operation: ${operation}`, context);

        const currencyName = getCurrencyName(currencyId || 1);

        switch (operation) {
        case 'get_costs': {
          if (!jobId) {
            return {
              success: false,
              operation: 'get_costs',
              message: 'Job ID is required for cost analysis'
            };
          }

          console.log(`💸 Analyzing costs for job ${jobId} using ExpenditureSummaryHoursAndCostRequest API`);
            
          // Get comprehensive expenditure summary using the new API
          const expenditureResponse = await workbookClient.jobs.getExpenditureSummary(jobId);
          if (!expenditureResponse.success) {
            return {
              success: false,
              operation: 'get_costs',
              message: `❌ Failed to retrieve expenditure summary for job ${jobId}: ${'error' in expenditureResponse ? expenditureResponse.error : 'Unknown error'}`
            };
          }

          if (!Array.isArray(expenditureResponse.data) || expenditureResponse.data.length === 0) {
            return {
              success: false,
              operation: 'get_costs',
              message: `❌ No expenditure data found for job ${jobId}`
            };
          }

          // Process expenditure summary data
          const summaryData = expenditureResponse.data;

          // Extract totals (RowType 2 = Total row)
          const totalsRow = summaryData.find(row => row.rowType === 2 && row.description === 'Total');

          // Calculate from activity summary rows (RowType 1)
          const activityRows = summaryData.filter(row => row.rowType === 1);
          const totalCost = totalsRow?.actualCosts || 0;
          const totalRevenue = totalsRow?.actualPrice || 0;
          const totalHours = totalsRow?.actualHours || 0;
          const quotedPrice = totalsRow?.quotedPrice || 0;
          const billedAmount = totalsRow?.billed || 0;
          const unBilledAmount = totalsRow?.unBilled || 0;
          const currency = summaryData[0]?.currencyCode || currencyName;

          // Build labor cost breakdown from activity data
          const laborCosts = activityRows.map(activity => ({
            resourceName: activity.description,
            hours: activity.actualHours || 0,
            rate: (activity.actualHours && activity.actualCosts && activity.actualHours > 0) 
              ? Math.round((activity.actualCosts / activity.actualHours) * 100) / 100 
              : 0,
            cost: activity.actualCosts || 0
          })).filter(labor => labor.hours > 0);

          // Calculate profitability metrics
          const grossProfit = totalRevenue - totalCost;
          const grossMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100) : 0;

          // Get job details for better context
          const jobDetailsResponse = await workbookClient.jobs.getJobDetails(jobId);
          const jobDetails = (jobDetailsResponse.success && jobDetailsResponse.data && typeof jobDetailsResponse.data === 'object' && 'jobName' in jobDetailsResponse.data) ? jobDetailsResponse.data : null;
          const jobName = jobDetails ? (jobDetails as {jobName: string}).jobName : `Job ${jobId}`;
          const clientName = jobDetails ? (jobDetails as {customerName: string}).customerName : 'Client';

          return {
            success: true,
            operation: 'get_costs',
            message: `✅ Cost analysis completed for job ${jobId} using ExpenditureSummaryHoursAndCostRequest`,
            jobFinancials: {
              jobId: jobId,
              jobName: jobName,
              clientName: clientName,
              currency: currency,
              costs: {
                totalCost: Math.round(totalCost * 100) / 100,
                laborCost: Math.round(totalCost * 100) / 100, // All costs from activity summaries
                expenseCost: 0, // Would need separate expense tracking
                overheadCost: 0, // Not available from current APIs
                actualHours: Math.round(totalHours * 100) / 100,
                averageHourlyRate: totalHours > 0 ? Math.round((totalCost / totalHours) * 100) / 100 : 0
              },
              revenue: {
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                invoicedAmount: Math.round(billedAmount * 100) / 100,
                remainingToInvoice: Math.round(unBilledAmount * 100) / 100,
                billedHours: Math.round(totalHours * 100) / 100,
                averageBillRate: totalHours > 0 ? Math.round((totalRevenue / totalHours) * 100) / 100 : 0
              },
              profitability: {
                grossProfit: Math.round(grossProfit * 100) / 100,
                grossMargin: Math.round(grossMargin * 100) / 100,
                netProfit: Math.round(grossProfit * 100) / 100,
                netMargin: Math.round(grossMargin * 100) / 100,
                roi: totalCost > 0 ? Math.round((grossProfit / totalCost) * 100 * 100) / 100 : 0
              },
              budget: quotedPrice > 0 ? {
                budgetedAmount: Math.round(quotedPrice * 100) / 100,
                budgetedHours: totalHours, // Use actual hours as estimate
                variance: Math.round((totalRevenue - quotedPrice) * 100) / 100,
                variancePercentage: quotedPrice > 0 ? Math.round(((totalRevenue - quotedPrice) / quotedPrice) * 100 * 100) / 100 : 0,
                status: totalRevenue > quotedPrice ? 'Over Budget' : totalRevenue < quotedPrice ? 'Under Budget' : 'On Budget'
              } : undefined
            },
            costBreakdown: {
              laborCosts: laborCosts,
              expenseCosts: [], // Would need separate expense API call
              totalsByCategory: {
                development: Math.round(totalCost * 0.6 * 100) / 100, // Estimated breakdown
                management: Math.round(totalCost * 0.2 * 100) / 100,
                design: Math.round(totalCost * 0.15 * 100) / 100,
                other: Math.round(totalCost * 0.05 * 100) / 100
              }
            }
          };
        }

        case 'get_revenue': {
          if (!jobId) {
            return {
              success: false,
              operation: 'get_revenue',
              message: 'Job ID is required for revenue analysis'
            };
          }

          console.log(`💵 Analyzing revenue for job ${jobId} using InvoicesRequest and ExpenditureSummaryHoursAndCostRequest APIs`);

          // Get expenditure summary for revenue and cost data
          const expenditureResponse = await workbookClient.jobs.getExpenditureSummary(jobId);
          
          // Get invoices for detailed billing information
          const invoicesResponse = await workbookClient.jobs.getInvoices(jobId);
          
          // Get job details for context
          const jobDetailsResponse = await workbookClient.jobs.getJobDetails(jobId);

          // Handle errors
          if (!expenditureResponse.success) {
            return {
              success: false,
              operation: 'get_revenue',
              message: `❌ Failed to retrieve expenditure data for job ${jobId}: ${'error' in expenditureResponse ? expenditureResponse.error : 'Unknown error'}`
            };
          }

          if (!Array.isArray(expenditureResponse.data) || expenditureResponse.data.length === 0) {
            return {
              success: false,
              operation: 'get_revenue',
              message: `❌ No expenditure data found for job ${jobId}`
            };
          }

          // Process expenditure summary data
          const summaryData = expenditureResponse.data;
          const totalsRow = summaryData.find(row => row.rowType === 2 && row.description === 'Total');

          const totalCost = totalsRow?.actualCosts || 0;
          const totalRevenue = totalsRow?.actualPrice || 0;
          const totalHours = totalsRow?.actualHours || 0;
          const quotedPrice = totalsRow?.quotedPrice || 0;
          const billedAmount = totalsRow?.billed || 0;
          const unBilledAmount = totalsRow?.unBilled || 0;
          const currency = summaryData[0]?.currencyCode || currencyName;

          // Process invoice data for more accurate billing information
          let invoicedAmount = 0;
          let invoiceCount = 0;
          if (invoicesResponse.success && Array.isArray(invoicesResponse.data)) {
            invoicesResponse.data.forEach(invoice => {
              invoicedAmount += invoice.amountTot || 0;
              invoiceCount++;
            });
          }

          // Use invoice data if available, otherwise fall back to expenditure data
          const actualInvoicedAmount = invoiceCount > 0 ? invoicedAmount : billedAmount;
          const actualRemainingToInvoice = invoiceCount > 0 ? (totalRevenue - invoicedAmount) : unBilledAmount;

          // Calculate profitability metrics
          const grossProfit = totalRevenue - totalCost;
          const grossMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100) : 0;

          // Get job and client names
          const jobDetails = (jobDetailsResponse.success && jobDetailsResponse.data && typeof jobDetailsResponse.data === 'object' && 'jobName' in jobDetailsResponse.data) ? jobDetailsResponse.data : null;
          const jobName = jobDetails ? (jobDetails as {jobName: string}).jobName : `Job ${jobId}`;
          const clientName = jobDetails ? (jobDetails as {customerName: string}).customerName : 'Client';

          return {
            success: true,
            operation: 'get_revenue',
            message: `✅ Revenue analysis completed for job ${jobId} using real APIs (${invoiceCount} invoices found)`,
            jobFinancials: {
              jobId: jobId,
              jobName: jobName,
              clientName: clientName,
              currency: currency,
              costs: {
                totalCost: Math.round(totalCost * 100) / 100,
                laborCost: Math.round(totalCost * 100) / 100,
                expenseCost: 0,
                overheadCost: 0,
                actualHours: Math.round(totalHours * 100) / 100,
                averageHourlyRate: totalHours > 0 ? Math.round((totalCost / totalHours) * 100) / 100 : 0
              },
              revenue: {
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                invoicedAmount: Math.round(actualInvoicedAmount * 100) / 100,
                remainingToInvoice: Math.round(actualRemainingToInvoice * 100) / 100,
                billedHours: Math.round(totalHours * 100) / 100,
                averageBillRate: totalHours > 0 ? Math.round((totalRevenue / totalHours) * 100) / 100 : 0
              },
              profitability: {
                grossProfit: Math.round(grossProfit * 100) / 100,
                grossMargin: Math.round(grossMargin * 100) / 100,
                netProfit: Math.round(grossProfit * 100) / 100,
                netMargin: Math.round(grossMargin * 100) / 100,
                roi: totalCost > 0 ? Math.round((grossProfit / totalCost) * 100 * 100) / 100 : 0
              },
              budget: quotedPrice > 0 ? {
                budgetedAmount: Math.round(quotedPrice * 100) / 100,
                budgetedHours: totalHours,
                variance: Math.round((totalRevenue - quotedPrice) * 100) / 100,
                variancePercentage: quotedPrice > 0 ? Math.round(((totalRevenue - quotedPrice) / quotedPrice) * 100 * 100) / 100 : 0,
                status: totalRevenue > quotedPrice ? 'Over Budget' : totalRevenue < quotedPrice ? 'Under Budget' : 'On Budget'
              } : undefined
            }
          };
        }

        case 'analyze_profitability': {
          console.log(`📊 Analyzing profitability for ${jobId ? `job ${jobId}` : jobIds ? `${jobIds.length} jobs` : 'portfolio'}`);
            
          if (jobId) {
            // Single job profitability using real API data
            console.log(`📊 Fetching real profitability data for job ${jobId}`);
            
            // Get expenditure summary for comprehensive financial data
            const expenditureResponse = await workbookClient.jobs.getExpenditureSummary(jobId);
            const invoicesResponse = await workbookClient.jobs.getInvoices(jobId);
            const jobDetailsResponse = await workbookClient.jobs.getJobDetails(jobId);

            if (!expenditureResponse.success) {
              return {
                success: false,
                operation: 'analyze_profitability',
                message: `❌ Failed to retrieve profitability data for job ${jobId}: ${'error' in expenditureResponse ? expenditureResponse.error : 'Unknown error'}`
              };
            }

            if (!Array.isArray(expenditureResponse.data) || expenditureResponse.data.length === 0) {
              return {
                success: false,
                operation: 'analyze_profitability',
                message: `❌ No profitability data found for job ${jobId}`
              };
            }

            // Process expenditure summary data
            const summaryData = expenditureResponse.data;
            const totalsRow = summaryData.find(row => row.rowType === 2 && row.description === 'Total');
            
            const totalCost = totalsRow?.actualCosts || 0;
            const totalRevenue = totalsRow?.actualPrice || 0;
            const totalHours = totalsRow?.actualHours || 0;
            const billedAmount = totalsRow?.billed || 0;
            const currency = summaryData[0]?.currencyCode || currencyName;

            // Calculate profitability metrics
            const grossProfit = totalRevenue - totalCost;
            const grossMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100) : 0;
            const roi = totalCost > 0 ? ((grossProfit / totalCost) * 100) : 0;

            // Get job and client names
            const jobDetails = (jobDetailsResponse.success && jobDetailsResponse.data && typeof jobDetailsResponse.data === 'object' && 'jobName' in jobDetailsResponse.data) ? jobDetailsResponse.data : null;
            const jobName = jobDetails ? (jobDetails as {jobName: string}).jobName : `Job ${jobId}`;
            const clientName = jobDetails ? (jobDetails as {customerName: string}).customerName : 'Client';

            // Process invoice data
            let invoicedAmount = 0;
            if (invoicesResponse.success && Array.isArray(invoicesResponse.data)) {
              invoicesResponse.data.forEach(invoice => {
                invoicedAmount += invoice.amountTot || 0;
              });
            }

            const actualInvoicedAmount = invoicedAmount || billedAmount;
            const remainingToInvoice = totalRevenue - actualInvoicedAmount;
              
            return {
              success: true,
              operation: 'analyze_profitability',
              message: `✅ Profitability analysis completed for job ${jobId} using real API data`,
              jobFinancials: {
                jobId: jobId,
                jobName: jobName,
                clientName: clientName,
                currency: currency,
                costs: {
                  totalCost: Math.round(totalCost * 100) / 100,
                  laborCost: Math.round(totalCost * 100) / 100,
                  expenseCost: 0,
                  overheadCost: 0,
                  actualHours: Math.round(totalHours * 100) / 100,
                  averageHourlyRate: totalHours > 0 ? Math.round((totalCost / totalHours) * 100) / 100 : 0
                },
                revenue: {
                  totalRevenue: Math.round(totalRevenue * 100) / 100,
                  invoicedAmount: Math.round(actualInvoicedAmount * 100) / 100,
                  remainingToInvoice: Math.round(remainingToInvoice * 100) / 100,
                  billedHours: Math.round(totalHours * 100) / 100,
                  averageBillRate: totalHours > 0 ? Math.round((totalRevenue / totalHours) * 100) / 100 : 0
                },
                profitability: {
                  grossProfit: Math.round(grossProfit * 100) / 100,
                  grossMargin: Math.round(grossMargin * 100) / 100,
                  netProfit: Math.round(grossProfit * 100) / 100,
                  netMargin: Math.round(grossMargin * 100) / 100,
                  roi: Math.round(roi * 100) / 100
                }
              }
            };
          } else if (jobIds && jobIds.length > 0) {
            // Portfolio profitability for multiple jobs
            console.log(`📊 Analyzing portfolio profitability for ${jobIds.length} jobs`);
            
            const portfolioAnalysis = [];
            let totalPortfolioRevenue = 0;
            let totalPortfolioCosts = 0;
            let profitableCount = 0;
            let unprofitableCount = 0;

            // Process each job
            for (const id of jobIds.slice(0, limit)) {
              const expResponse = await workbookClient.jobs.getExpenditureSummary(id);
              const jobResponse = await workbookClient.jobs.getJobDetails(id);
              
              if (expResponse.success && Array.isArray(expResponse.data) && expResponse.data.length > 0) {
                const summaryData = expResponse.data;
                const totalsRow = summaryData.find(row => row.rowType === 2 && row.description === 'Total');
                
                const cost = totalsRow?.actualCosts || 0;
                const revenue = totalsRow?.actualPrice || 0;
                const margin = revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0;
                
                const jobDetails = (jobResponse.success && jobResponse.data) ? jobResponse.data : null;
                const jobName = jobDetails ? (jobDetails as {jobName: string}).jobName : `Job ${id}`;
                
                portfolioAnalysis.push({
                  jobId: id,
                  jobName: jobName,
                  totalRevenue: Math.round(revenue * 100) / 100,
                  totalCost: Math.round(cost * 100) / 100,
                  grossMargin: Math.round(margin * 100) / 100,
                  status: 'Active',
                  riskLevel: margin < 10 ? 'High' : margin < 20 ? 'Medium' : 'Low'
                });
                
                totalPortfolioRevenue += revenue;
                totalPortfolioCosts += cost;
                if (margin > 0) {profitableCount++;}
                else {unprofitableCount++;}
              }
            }

            const avgMargin = totalPortfolioRevenue > 0 ? ((totalPortfolioRevenue - totalPortfolioCosts) / totalPortfolioRevenue) * 100 : 0;
            const topPerformer = portfolioAnalysis.reduce((prev, current) => 
              (prev.grossMargin > current.grossMargin) ? prev : current, portfolioAnalysis[0]);
            const underperformers = portfolioAnalysis.filter(job => job.grossMargin < 10).map(job => job.jobName);

            return {
              success: true,
              operation: 'analyze_profitability',
              message: `✅ Portfolio profitability analysis completed for ${portfolioAnalysis.length} jobs using real API data`,
              portfolioAnalysis: portfolioAnalysis,
              summary: {
                totalJobs: portfolioAnalysis.length,
                totalRevenue: Math.round(totalPortfolioRevenue * 100) / 100,
                totalCosts: Math.round(totalPortfolioCosts * 100) / 100,
                averageMargin: Math.round(avgMargin * 100) / 100,
                profitableJobs: profitableCount,
                unprofitableJobs: unprofitableCount,
                topPerformingJob: topPerformer ? `${topPerformer.jobName} (${topPerformer.grossMargin}% margin)` : undefined,
                underperformingJobs: underperformers,
                periodCovered: {
                  from: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                  to: endDate || new Date().toISOString()
                }
              }
            };
          } else {
            return {
              success: false,
              operation: 'analyze_profitability',
              message: 'Job ID or Job IDs array is required for profitability analysis'
            };
          }
        }

        case 'budget_analysis': {
          if (!jobId) {
            return {
              success: false,
              operation: 'budget_analysis',
              message: 'Job ID is required for budget analysis'
            };
          }

          console.log(`📋 Analyzing budget vs actual for job ${jobId} using real API data`);
            
          // Get expenditure summary for budget and actual data
          const expenditureResponse = await workbookClient.jobs.getExpenditureSummary(jobId);
          const invoicesResponse = await workbookClient.jobs.getInvoices(jobId);
          const jobDetailsResponse = await workbookClient.jobs.getJobDetails(jobId);

          if (!expenditureResponse.success) {
            return {
              success: false,
              operation: 'budget_analysis',
              message: `❌ Failed to retrieve budget data for job ${jobId}: ${'error' in expenditureResponse ? expenditureResponse.error : 'Unknown error'}`
            };
          }

          if (!Array.isArray(expenditureResponse.data) || expenditureResponse.data.length === 0) {
            return {
              success: false,
              operation: 'budget_analysis',
              message: `❌ No budget data found for job ${jobId}`
            };
          }

          // Process expenditure summary data
          const summaryData = expenditureResponse.data;
          const totalsRow = summaryData.find(row => row.rowType === 2 && row.description === 'Total');
          
          const totalCost = totalsRow?.actualCosts || 0;
          const totalRevenue = totalsRow?.actualPrice || 0;
          const totalHours = totalsRow?.actualHours || 0;
          const quotedPrice = totalsRow?.quotedPrice || 0; // This is the budgeted amount
          const billedAmount = totalsRow?.billed || 0;
          const currency = summaryData[0]?.currencyCode || currencyName;

          // Calculate budget variance
          const budgetVariance = totalRevenue - quotedPrice;
          const variancePercent = quotedPrice > 0 ? (budgetVariance / quotedPrice) * 100 : 0;
          const overThreshold = Math.abs(variancePercent) > varianceThreshold;

          // Calculate profitability metrics
          const grossProfit = totalRevenue - totalCost;
          const grossMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100) : 0;
          const roi = totalCost > 0 ? ((grossProfit / totalCost) * 100) : 0;

          // Get job and client names
          const jobDetails = (jobDetailsResponse.success && jobDetailsResponse.data && typeof jobDetailsResponse.data === 'object' && 'jobName' in jobDetailsResponse.data) ? jobDetailsResponse.data : null;
          const jobName = jobDetails ? (jobDetails as {jobName: string}).jobName : `Job ${jobId}`;
          const clientName = jobDetails ? (jobDetails as {customerName: string}).customerName : 'Client';

          // Process invoice data
          let invoicedAmount = 0;
          if (invoicesResponse.success && Array.isArray(invoicesResponse.data)) {
            invoicesResponse.data.forEach(invoice => {
              invoicedAmount += invoice.amountTot || 0;
            });
          }

          const actualInvoicedAmount = invoicedAmount || billedAmount;
          const remainingToInvoice = totalRevenue - actualInvoicedAmount;
            
          return {
            success: true,
            operation: 'budget_analysis',
            message: `✅ Budget analysis completed for job ${jobId} using real API data${overThreshold ? ' - Variance alert triggered!' : ''}`,
            jobFinancials: {
              jobId: jobId,
              jobName: jobName,
              clientName: clientName,
              currency: currency,
              costs: {
                totalCost: Math.round(totalCost * 100) / 100,
                laborCost: Math.round(totalCost * 100) / 100,
                expenseCost: 0,
                overheadCost: 0,
                actualHours: Math.round(totalHours * 100) / 100,
                averageHourlyRate: totalHours > 0 ? Math.round((totalCost / totalHours) * 100) / 100 : 0
              },
              revenue: {
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                invoicedAmount: Math.round(actualInvoicedAmount * 100) / 100,
                remainingToInvoice: Math.round(remainingToInvoice * 100) / 100,
                billedHours: Math.round(totalHours * 100) / 100,
                averageBillRate: totalHours > 0 ? Math.round((totalRevenue / totalHours) * 100) / 100 : 0
              },
              profitability: {
                grossProfit: Math.round(grossProfit * 100) / 100,
                grossMargin: Math.round(grossMargin * 100) / 100,
                netProfit: Math.round(grossProfit * 100) / 100,
                netMargin: Math.round(grossMargin * 100) / 100,
                roi: Math.round(roi * 100) / 100
              },
              budget: {
                budgetedAmount: Math.round(quotedPrice * 100) / 100,
                budgetedHours: totalHours, // Using actual hours as we don't have budgeted hours in API
                variance: Math.round(budgetVariance * 100) / 100,
                variancePercentage: Math.round(variancePercent * 100) / 100,
                status: budgetVariance > 0 ? 'Over Budget' : budgetVariance < 0 ? 'Under Budget' : 'On Budget'
              }
            }
          };
        }

        case 'price_optimization': {
          if (!jobId) {
            return {
              success: false,
              operation: 'price_optimization',
              message: 'Job ID is required for price optimization analysis'
            };
          }

          console.log(`💡 Analyzing price optimization for job ${jobId} using real API data`);
            
          // Get real financial data from API
          const expenditureResponse = await workbookClient.jobs.getExpenditureSummary(jobId);

          if (!expenditureResponse.success) {
            return {
              success: false,
              operation: 'price_optimization',
              message: `❌ Failed to retrieve price data for job ${jobId}: ${'error' in expenditureResponse ? expenditureResponse.error : 'Unknown error'}`
            };
          }

          if (!Array.isArray(expenditureResponse.data) || expenditureResponse.data.length === 0) {
            return {
              success: false,
              operation: 'price_optimization',
              message: `❌ No pricing data found for job ${jobId}`
            };
          }

          // Process expenditure summary data
          const summaryData = expenditureResponse.data;
          const totalsRow = summaryData.find(row => row.rowType === 2 && row.description === 'Total');
          
          const totalCost = totalsRow?.actualCosts || 0;
          const totalRevenue = totalsRow?.actualPrice || 0;
          const totalHours = totalsRow?.actualHours || 0;
          const currency = summaryData[0]?.currencyCode || currencyName;

          // Calculate current rate and margin
          const currentRate = totalHours > 0 ? totalRevenue / totalHours : 0;
          const currentMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;

          // Calculate suggested rate based on target margin or competitive positioning
          let suggestedRate = currentRate;
          if (targetMargin && totalHours > 0) {
            // Calculate rate needed to achieve target margin
            suggestedRate = Math.ceil((totalCost / (1 - targetMargin / 100)) / totalHours);
          } else if (competitiveRate) {
            // Position relative to competitive rate
            suggestedRate = Math.min(competitiveRate * 1.05, currentRate * 1.15);
          } else if (currentRate > 0) {
            // Default 10% increase if profitable, or set to break-even if not
            suggestedRate = currentMargin > 0 ? currentRate * 1.1 : (totalCost / totalHours) * 1.1;
          }

          // Calculate impact of price change
          const revenueIncrease = totalHours > 0 ? (suggestedRate - currentRate) * totalHours : 0;
          const newRevenue = totalHours > 0 ? suggestedRate * totalHours : 0;
          const newMargin = newRevenue > 0 ? ((newRevenue - totalCost) / newRevenue) * 100 : 0;
          const marginImprovement = newMargin - currentMargin;

            
          return {
            success: true,
            operation: 'price_optimization',
            message: `✅ Price optimization analysis completed for job ${jobId} using real API data`,
            priceOptimization: {
              currentRate: Math.round(currentRate * 100) / 100,
              suggestedRate: Math.round(suggestedRate * 100) / 100,
              impactAnalysis: {
                revenueIncrease: Math.round(revenueIncrease * 100) / 100,
                marginImprovement: Math.round(marginImprovement * 100) / 100,
                competitivePosition: competitiveRate ? 
                  (suggestedRate <= competitiveRate ? 'Competitive' : 
                    suggestedRate <= competitiveRate * 1.2 ? 'Premium' : 'Luxury') : 
                  currentMargin > 30 ? 'Market Leader' : 'Standard'
              },
              recommendations: [
                revenueIncrease > 0 ? 
                  `Increase hourly rate from ${Math.round(currentRate)} to ${Math.round(suggestedRate)} ${currency} for ${Math.round(revenueIncrease)} ${currency} additional revenue` :
                  revenueIncrease < 0 ?
                    `Consider reducing rate to ${Math.round(suggestedRate)} ${currency} to improve competitiveness` :
                    'Current pricing is optimal for market position',
                targetMargin ? 
                  `This adjustment achieves target margin of ${targetMargin}%` :
                  currentMargin < 10 ?
                    'URGENT: Current margin is below sustainable levels' :
                    'Consider gradual implementation over 2-3 months',
                currentMargin < 0 ?
                  'WARNING: Project is currently unprofitable - immediate pricing review required' :
                  'Monitor client response and adjust based on market feedback',
                totalHours === 0 ?
                  'No hours recorded yet - price optimization will improve with more data' :
                  'Use value-based pricing for similar future projects'
              ]
            }
          };
        }

        case 'financial_forecast': {
          console.log(`🔮 Creating financial forecast for ${periodType} period using real API data`);
            
          // Get real baseline data from API
          let baseRevenue = 0;
          let baseCosts = 0;
          let jobCount = 0;
          
          if (jobId) {
            // Single job forecast
            const expenditureResponse = await workbookClient.jobs.getExpenditureSummary(jobId);
            
            if (!expenditureResponse.success) {
              return {
                success: false,
                operation: 'financial_forecast',
                message: `❌ Failed to retrieve forecast data for job ${jobId}: ${'error' in expenditureResponse ? expenditureResponse.error : 'Unknown error'}`
              };
            }

            if (Array.isArray(expenditureResponse.data) && expenditureResponse.data.length > 0) {
              const totalsRow = expenditureResponse.data.find(row => row.rowType === 2 && row.description === 'Total');
              baseRevenue = totalsRow?.actualPrice || 0;
              baseCosts = totalsRow?.actualCosts || 0;
              jobCount = 1;
            }
          } else if (jobIds && jobIds.length > 0) {
            // Portfolio forecast
            for (const id of jobIds.slice(0, Math.min(jobIds.length, 10))) { // Sample up to 10 jobs
              const expResponse = await workbookClient.jobs.getExpenditureSummary(id);
              if (expResponse.success && Array.isArray(expResponse.data) && expResponse.data.length > 0) {
                const totalsRow = expResponse.data.find(row => row.rowType === 2 && row.description === 'Total');
                baseRevenue += totalsRow?.actualPrice || 0;
                baseCosts += totalsRow?.actualCosts || 0;
                jobCount++;
              }
            }
          } else {
            // No specific job or portfolio provided
            // Return message that we need job IDs
            return {
              success: false,
              operation: 'financial_forecast',
              message: 'Financial forecasting requires job IDs. Please provide specific job ID(s) for forecast analysis.'
            };
          }

          if (baseRevenue === 0 && baseCosts === 0) {
            return {
              success: false,
              operation: 'financial_forecast',
              message: '❌ No historical data available for forecasting. Please ensure the job(s) have financial data.'
            };
          }

          // Calculate growth rates based on period and current performance
          const currentMargin = baseRevenue > 0 ? ((baseRevenue - baseCosts) / baseRevenue) * 100 : 0;
          
          // Adjust growth rate based on current performance
          let revenueGrowthRate = 1.0;
          let costEfficiencyRate = 1.0;
          
          if (periodType === 'year') {
            revenueGrowthRate = currentMargin > 20 ? 1.15 : currentMargin > 10 ? 1.10 : 1.05;
            costEfficiencyRate = 0.97; // 3% efficiency gain
          } else if (periodType === 'quarter') {
            revenueGrowthRate = currentMargin > 20 ? 1.08 : currentMargin > 10 ? 1.05 : 1.02;
            costEfficiencyRate = 0.99; // 1% efficiency gain
          } else { // month
            revenueGrowthRate = currentMargin > 20 ? 1.03 : currentMargin > 10 ? 1.02 : 1.01;
            costEfficiencyRate = 0.997; // 0.3% efficiency gain
          }

          // Apply forecast model
          const forecastedRevenue = baseRevenue * revenueGrowthRate;
          const forecastedCosts = baseCosts * costEfficiencyRate;
          const forecastedMargin = forecastedRevenue > 0 ? ((forecastedRevenue - forecastedCosts) / forecastedRevenue) * 100 : 0;

          // Calculate completion date
          const daysToAdd = periodType === 'year' ? 365 : periodType === 'quarter' ? 90 : 30;
          const completionDate = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);

          // Dynamic risk factors based on current performance
          const riskFactors = [];
          if (currentMargin < 10) {riskFactors.push('Low current margins increase financial risk');}
          if (baseCosts > baseRevenue * 0.8) {riskFactors.push('High cost ratio threatens profitability');}
          if (jobCount === 1) {riskFactors.push('Single job dependency creates concentration risk');}
          riskFactors.push('Market competition may pressure pricing');
          riskFactors.push('Resource availability constraints');
          if (currentMargin < 0) {riskFactors.push('CRITICAL: Current unprofitability requires immediate action');}

          // Dynamic recommendations based on data
          const recommendations = [];
          if (currentMargin < 15) {recommendations.push('Priority: Improve pricing strategy to increase margins');}
          if (baseCosts > 0) {recommendations.push(`Target ${Math.round(costEfficiencyRate * 100 - 100)}% cost reduction through process optimization`);}
          if (currentMargin > 25) {recommendations.push('Excellent margins - consider scaling operations');}
          recommendations.push('Focus on high-margin service offerings');
          if (jobCount > 1) {recommendations.push(`Diversified across ${jobCount} jobs - maintain portfolio balance`);}
          recommendations.push('Build financial reserves for market volatility');
            
          return {
            success: true,
            operation: 'financial_forecast',
            message: `✅ Financial forecast completed for ${periodType} period based on ${jobCount} job(s) real data`,
            forecast: {
              period: `${periodType} - ${new Date().toISOString().slice(0, 7)}`,
              forecastedRevenue: Math.round(forecastedRevenue * 100) / 100,
              forecastedCosts: Math.round(forecastedCosts * 100) / 100,
              forecastedMargin: Math.round(forecastedMargin * 100) / 100,
              completionDate: completionDate.toISOString(),
              riskFactors: riskFactors,
              recommendations: recommendations
            }
          };
        }

        case 'department_breakdown': {
          if (!jobId) {
            return {
              success: false,
              operation: 'department_breakdown',
              message: 'Job ID is required for department financial breakdown analysis'
            };
          }

          console.log(`📊 Analyzing department profit breakdown for job ${jobId} using DepartmentProfitSplitVisualizationRequest API`);
            
          // Get actual departments for proper name mapping
          const departmentsResponse = await workbookClient.jobs.getDepartments(1);
          const departmentMap = new Map<number, string>();
          if (departmentsResponse.success && departmentsResponse.data) {
            const departments = departmentsResponse.data as MappedDepartment[];
            departments.forEach(dept => {
              departmentMap.set(dept.id, dept.name);
            });
          }

          // Get department profit split using the new API
          const deptBreakdownResponse = await workbookClient.jobs.getDepartmentProfitSplit(jobId, false, 1);
          
          if (!deptBreakdownResponse.success) {
            return {
              success: false,
              operation: 'department_breakdown',
              message: `❌ Failed to retrieve department breakdown for job ${jobId}: ${'error' in deptBreakdownResponse ? deptBreakdownResponse.error : 'Unknown error'}`
            };
          }

          if (!deptBreakdownResponse.data || !Array.isArray(deptBreakdownResponse.data) || deptBreakdownResponse.data.length === 0) {
            return {
              success: false,
              operation: 'department_breakdown',
              message: `❌ No department breakdown data found for job ${jobId}`
            };
          }

          const departmentData = deptBreakdownResponse.data as MappedDepartmentProfitSplit[];
          
          // Separate department data from totals
          const departments = departmentData.filter((dept: MappedDepartmentProfitSplit) => dept.recordType === 1); // Department records
          const totalsData = departmentData.find((dept: MappedDepartmentProfitSplit) => dept.recordType === 2); // Total record

          if (departments.length === 0) {
            return {
              success: false,
              operation: 'department_breakdown',
              message: `❌ No department data found in breakdown for job ${jobId}`
            };
          }

          // Process department breakdown with actual department names
          const departmentBreakdown = departments.map((dept: MappedDepartmentProfitSplit) => ({
            departmentId: dept.departmentId,
            departmentName: (dept.departmentId && departmentMap.has(dept.departmentId)) 
              ? departmentMap.get(dept.departmentId)! 
              : dept.departmentName || `Department ${dept.departmentId}`,
            departmentType: dept.departmentType, // "Owner" or "Delivery"
            currency: dept.currencyCode,
            priceQuote: {
              amount: dept.priceQuoteShare || 0,
              percentage: dept.priceQuoteSharePercentage || 0
            },
            tasks: {
              amount: dept.taskAmount || 0,
              percentage: dept.taskPercentage || 0
            },
            timeShare: {
              amount: dept.timeShare || 0,
              percentage: dept.timePercentage || 0
            },
            invoices: {
              amount: dept.invoiceShare || 0,
              percentage: dept.invoicePercentage || 0
            }
          }));

          // Calculate insights
          const ownerDepartments = departmentBreakdown.filter(dept => dept.departmentType === 'Owner');
          const deliveryDepartments = departmentBreakdown.filter(dept => dept.departmentType === 'Delivery');
          
          const totalPriceQuote = totalsData?.priceQuoteShare || 0;
          const totalTaskAmount = totalsData?.taskAmount || 0;
          const totalTimeShare = totalsData?.timeShare || 0;
          const totalInvoiceShare = totalsData?.invoiceShare || 0;

          // Identify top performing departments
          const topRevenuecontributor = departmentBreakdown.reduce((prev, current) => 
            (current.invoices.amount > prev.invoices.amount) ? current : prev, departmentBreakdown[0]);
          
          const topTimecontributor = departmentBreakdown.reduce((prev, current) => 
            (current.timeShare.amount > prev.timeShare.amount) ? current : prev, departmentBreakdown[0]);

          // Generate insights
          const insights = [];
          if (ownerDepartments.length > 0) {
            const ownerRevenue = ownerDepartments.reduce((sum, dept) => sum + dept.invoices.amount, 0);
            insights.push(`Owner departments generate ${Math.round((ownerRevenue / totalInvoiceShare) * 100)}% of total revenue`);
          }
          if (deliveryDepartments.length > 0) {
            const deliveryRevenue = deliveryDepartments.reduce((sum, dept) => sum + dept.invoices.amount, 0);
            insights.push(`Delivery departments generate ${Math.round((deliveryRevenue / totalInvoiceShare) * 100)}% of total revenue`);
          }
          insights.push(`${topRevenuecontributor.departmentName} is the top revenue contributor (${topRevenuecontributor.invoices.amount} ${totalsData?.currencyCode})`);
          insights.push(`${topTimecontributor.departmentName} has the highest time allocation (${topTimecontributor.timeShare.amount} ${totalsData?.currencyCode})`);

          return {
            success: true,
            operation: 'department_breakdown',
            message: `✅ Department breakdown analysis completed for job ${jobId} with ${departments.length} departments`,
            breakdown: {
              jobId: jobId,
              currency: totalsData?.currencyCode || 'DKK',
              departments: departmentBreakdown,
              summary: {
                totalDepartments: departments.length,
                ownerDepartments: ownerDepartments.length,
                deliveryDepartments: deliveryDepartments.length,
                totals: {
                  priceQuote: totalPriceQuote,
                  taskAmount: totalTaskAmount,
                  timeShare: totalTimeShare,
                  invoiceShare: totalInvoiceShare
                },
                topContributors: {
                  revenue: {
                    department: topRevenuecontributor.departmentName,
                    amount: topRevenuecontributor.invoices.amount,
                    percentage: topRevenuecontributor.invoices.percentage
                  },
                  time: {
                    department: topTimecontributor.departmentName,
                    amount: topTimecontributor.timeShare.amount,
                    percentage: topTimecontributor.timeShare.percentage
                  }
                }
              },
              insights: insights
            }
          };
        }

        default:
          return {
            success: false,
            operation: operation,
            message: `Unknown operation: ${operation}. Supported operations: get_costs, get_revenue, analyze_profitability, budget_analysis, price_optimization, financial_forecast, department_breakdown`
          };
        }

      } catch (error) {
        console.error('❌ Error in jobFinancialsTool:', error);
        return {
          success: false,
          operation: context.operation || 'unknown',
          message: `Error in job financials: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }
  });
}

/**
 * Helper function to get currency name from ID
 */
function getCurrencyName(currencyId: number): string {
  const currencyMap: Record<number, string> = {
    1: 'DKK',
    2: 'USD',
    3: 'GBP',
    5: 'EUR'
  };
  return currencyMap[currencyId] || 'Unknown';
}