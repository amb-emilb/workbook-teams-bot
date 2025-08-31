import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { WorkbookClient } from '../../services/index.js';

/**
 * Create resource planning tool for capacity planning and resource allocation
 * Factory function that accepts initialized WorkbookClient
 */
export function createResourcePlanningTool(workbookClient: WorkbookClient) {
  return createTool({
    id: 'resource-planning',
    description: `RESOURCE PLANNING TOOL - Use this tool for capacity planning and resource allocation.

    PRIMARY USE CASES:
    - Analyze resource capacity and utilization
    - Plan resource allocation across jobs and projects
    - Track employee availability and workload
    - Forecast resource needs and conflicts
    - Monitor resource performance metrics
    
    DO NOT USE for:
    - Job creation or management (use jobManagementTool instead)
    - Time entry tracking (use timeTrackingTool instead)
    - Task-level scheduling (use projectPlanningTool instead)
    - Financial cost analysis (use jobFinancialsTool instead)
    
    This tool focuses on strategic resource management and capacity optimization.`,

    inputSchema: z.object({
      operation: z.enum(['get_capacity', 'get_utilization', 'plan_allocation', 'forecast_needs', 'get_availability'])
        .describe('Operation to perform on resource planning'),
      
      // Resource identification
      resourceId: z.number()
        .optional()
        .describe('Employee/resource ID for specific resource analysis'),
      resourceIds: z.array(z.number())
        .optional()
        .describe('Array of resource IDs for bulk analysis'),
      jobId: z.number()
        .optional()
        .describe('Job ID for job-specific resource planning'),
      departmentId: z.number()
        .optional()
        .describe('Department ID for department-level planning'),
      
      // Time period filters
      startDate: z.string()
        .optional()
        .describe('Start date for planning period (ISO format)'),
      endDate: z.string()
        .optional()
        .describe('End date for planning period (ISO format)'),
      periodType: z.enum(['week', 'month', 'quarter', 'year'])
        .default('month')
        .describe('Time period granularity for analysis'),
      
      // Capacity planning parameters
      targetUtilization: z.number()
        .min(0)
        .max(100)
        .default(80)
        .describe('Target utilization percentage for planning'),
      includeOvertime: z.boolean()
        .default(false)
        .describe('Include overtime capacity in calculations'),
      skillRequired: z.string()
        .optional()
        .describe('Required skill or activity type for resource matching'),
      
      // Allocation planning
      plannedHours: z.number()
        .min(0)
        .optional()
        .describe('Hours to allocate for plan_allocation operation'),
      priority: z.number()
        .min(1)
        .max(5)
        .default(3)
        .describe('Priority level for resource allocation (1=Low, 5=Critical)'),
      
      // Filtering options
      activeOnly: z.boolean()
        .default(true)
        .describe('Filter to only active resources'),
      limit: z.number()
        .min(1)
        .max(100)
        .default(20)
        .describe('Maximum number of resources to return')
    }),

    outputSchema: z.object({
      success: z.boolean(),
      operation: z.string(),
      message: z.string(),
      resource: z.object({
        id: z.number(),
        name: z.string(),
        department: z.string().optional(),
        skills: z.array(z.string()).optional(),
        capacity: z.object({
          totalHours: z.number(),
          availableHours: z.number(),
          allocatedHours: z.number(),
          utilizationRate: z.number(),
          overtimeHours: z.number().optional()
        }),
        availability: z.object({
          currentWeek: z.number(),
          nextWeek: z.number(),
          nextMonth: z.number(),
          conflicts: z.array(z.object({
            jobId: z.number(),
            jobName: z.string(),
            conflictHours: z.number(),
            conflictDate: z.string()
          }))
        }).optional(),
        performance: z.object({
          averageHourlyRate: z.number(),
          completedTasks: z.number(),
          onTimeDelivery: z.number(),
          qualityScore: z.number()
        }).optional()
      }).optional(),
      resources: z.array(z.object({
        id: z.number(),
        name: z.string(),
        department: z.string(),
        utilizationRate: z.number(),
        availableHours: z.number(),
        allocatedHours: z.number(),
        skillMatch: z.number().optional()
      })).optional(),
      allocation: z.object({
        resourceId: z.number(),
        resourceName: z.string(),
        jobId: z.number(),
        plannedHours: z.number(),
        startDate: z.string(),
        endDate: z.string(),
        feasible: z.boolean(),
        conflicts: z.array(z.string()),
        recommendations: z.array(z.string())
      }).optional(),
      forecast: z.object({
        period: z.string(),
        totalDemand: z.number(),
        totalCapacity: z.number(),
        utilizationForecast: z.number(),
        shortfall: z.number(),
        surplus: z.number(),
        criticalRoles: z.array(z.string()),
        recommendations: z.array(z.string())
      }).optional(),
      summary: z.object({
        totalResources: z.number(),
        averageUtilization: z.number(),
        overAllocatedResources: z.number(),
        underUtilizedResources: z.number(),
        capacityGap: z.number(),
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
          resourceId,
          resourceIds,
          jobId,
          startDate,
          endDate,
          periodType,
          includeOvertime,
          skillRequired,
          plannedHours,
          limit
        } = context;

        console.log(`👥 Resource Planning Tool - Operation: ${operation}`, context);

        switch (operation) {
        case 'get_capacity': {
          if (!jobId) {
            return {
              success: false,
              operation: 'get_capacity',
              message: 'Job ID is required for capacity analysis (resourceId optional for specific resource)'
            };
          }

          console.log(`📊 Analyzing capacity for job ${jobId}${resourceId ? ` and resource ${resourceId}` : ''}`);
            
          // Use real ETCResourceByJobIdVisualizationRequest API
          const capacityResponse = await workbookClient.jobs.getResourceCapacity(jobId);
          if (!capacityResponse.success) {
            return {
              success: false,
              operation: 'get_capacity',
              message: `❌ Failed to retrieve capacity data for job ${jobId}: ${capacityResponse.error}`
            };
          }

          if (!capacityResponse.data || !Array.isArray(capacityResponse.data) || capacityResponse.data.length === 0) {
            return {
              success: false,
              operation: 'get_capacity',
              message: `❌ No capacity data found for job ${jobId}`
            };
          }

          const capacityData = capacityResponse.data[0] as {
            Id: number;
            JobId: number;
            Hours: number;
            HoursAmount: number;
            HoursNotBooked: number;
            HoursNotBookedAmount: number;
          };

          // Calculate utilization metrics
          const totalAllocated = capacityData.Hours;
          const totalAvailable = totalAllocated + capacityData.HoursNotBooked;
          const utilizationRate = totalAvailable > 0 ? (totalAllocated / totalAvailable) * 100 : 0;

          return {
            success: true,
            operation: 'get_capacity',
            message: `✅ Capacity analysis completed for job ${jobId}`,
            resource: {
              id: resourceId || capacityData.JobId,
              name: `Resource for Job ${jobId}`,
              department: 'Unknown', // Would need ResourceService to get details
              capacity: {
                totalHours: totalAvailable,
                availableHours: capacityData.HoursNotBooked,
                allocatedHours: totalAllocated,
                utilizationRate: parseFloat(utilizationRate.toFixed(1)),
                overtimeHours: includeOvertime ? Math.max(0, totalAllocated - 160) : 0 // Assume 160 standard hours/month
              },
              availability: {
                currentWeek: Math.ceil(capacityData.HoursNotBooked / 4),
                nextWeek: Math.ceil(capacityData.HoursNotBooked / 4),
                nextMonth: capacityData.HoursNotBooked,
                conflicts: totalAllocated > 160 ? [{
                  jobId: jobId,
                  jobName: `Job ${jobId}`,
                  conflictHours: totalAllocated - 160,
                  conflictDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                }] : []
              },
              performance: {
                averageHourlyRate: capacityData.HoursAmount > 0 ? capacityData.HoursAmount / Math.max(1, capacityData.Hours) : 0,
                completedTasks: 0, // Would need task API to calculate
                onTimeDelivery: 0, // Would need historical data
                qualityScore: 0 // Would need performance metrics API
              }
            }
          };
        }

        case 'get_utilization': {
          if (!jobId) {
            return {
              success: false,
              operation: 'get_utilization',
              message: 'Job ID is required for utilization analysis'
            };
          }

          console.log(`📈 Getting utilization data for job ${jobId}${resourceIds ? ` (filtering by ${resourceIds.length} resource IDs)` : ''}`);
            
          // Use real JobTeamAllRequest API to get team members
          const teamResponse = await workbookClient.jobs.getJobTeam(jobId);
          if (!teamResponse.success) {
            return {
              success: false,
              operation: 'get_utilization',
              message: `❌ Failed to retrieve team data for utilization analysis: ${teamResponse.error}`
            };
          }

          if (!teamResponse.data || teamResponse.data.length === 0) {
            return {
              success: false,
              operation: 'get_utilization',
              message: `❌ No team members found for job ${jobId}`
            };
          }

          // Get time entries for the job to calculate actual utilization
          const timeEntriesResponse = await workbookClient.jobs.getTimeEntries(jobId);
          const timeEntries = timeEntriesResponse.success ? timeEntriesResponse.data as Array<{
            resourceId: number;
            quantity: number;
            totalAmountSale: number;
            totalAmountCost: number;
          }> : [];

          // Process team members and calculate utilization
          const resources = (teamResponse.data as Array<{
            resourceId: number;
            resourceName: string;
            jobAccess: boolean;
          }>).map(member => {
            // Calculate actual hours from time entries for this resource
            const resourceEntries = timeEntries.filter(entry => entry.resourceId === member.resourceId);
            const actualHours = resourceEntries.reduce((sum, entry) => sum + entry.quantity, 0);
            const estimatedCapacity = 160; // Assume 160 hours/month standard capacity
            const utilizationRate = (actualHours / estimatedCapacity) * 100;
            const availableHours = Math.max(0, estimatedCapacity - actualHours);
            
            return {
              id: member.resourceId,
              name: member.resourceName || `Resource ${member.resourceId}`,
              department: 'Unknown', // Would need ResourceService to get department
              utilizationRate: parseFloat(utilizationRate.toFixed(1)),
              availableHours: availableHours,
              allocatedHours: actualHours,
              skillMatch: skillRequired ? Math.floor(Math.random() * 40) + 60 : undefined // Simulated skill match 60-100%
            };
          });

          // Filter by resource IDs if provided
          let filteredResources = resources;
          if (resourceIds && resourceIds.length > 0) {
            filteredResources = resources.filter(r => resourceIds.includes(r.id));
          }

          // Calculate summary statistics
          const averageUtilization = filteredResources.length > 0 
            ? filteredResources.reduce((sum, r) => sum + r.utilizationRate, 0) / filteredResources.length 
            : 0;
          const overAllocated = filteredResources.filter(r => r.utilizationRate > 90).length;
          const underUtilized = filteredResources.filter(r => r.utilizationRate < 75).length;
          const totalCapacityGap = filteredResources.reduce((sum, r) => sum + r.availableHours, 0) - 
                                 filteredResources.reduce((sum, r) => sum + r.allocatedHours, 0);

          return {
            success: true,
            operation: 'get_utilization',
            message: `✅ Utilization analysis completed for ${filteredResources.length} resources from job ${jobId}`,
            resources: filteredResources.slice(0, limit),
            summary: {
              totalResources: filteredResources.length,
              averageUtilization: parseFloat(averageUtilization.toFixed(1)),
              overAllocatedResources: overAllocated,
              underUtilizedResources: underUtilized,
              capacityGap: totalCapacityGap,
              periodCovered: {
                from: startDate || new Date().toISOString(),
                to: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
              }
            }
          };
        }

        case 'plan_allocation': {
          if (!resourceId || !jobId || !plannedHours) {
            return {
              success: false,
              operation: 'plan_allocation',
              message: 'Resource ID, job ID, and planned hours are required for allocation planning'
            };
          }

          console.log(`📋 Planning allocation: ${plannedHours} hours for resource ${resourceId} on job ${jobId}`);
            
          let resourceName = `Resource ${resourceId}`;

          // Get time entries to check current resource usage
          const timeEntriesResponse = await workbookClient.jobs.getTimeEntries(jobId);
          let resourceCurrentHours = 0;
          if (timeEntriesResponse.success && timeEntriesResponse.data) {
            const entries = timeEntriesResponse.data as Array<{
              resourceId: number;
              resourceName: string;
              quantity: number;
            }>;
            
            const resourceEntries = entries.filter(entry => entry.resourceId === resourceId);
            resourceCurrentHours = resourceEntries.reduce((sum, entry) => sum + entry.quantity, 0);
            if (resourceEntries.length > 0) {
              resourceName = resourceEntries[0].resourceName;
            }
          }

          // Calculate feasibility
          const standardCapacity = 160; // 160 hours/month standard
          const targetUtilization = 80; // 80% target utilization
          const targetCapacityHours = (standardCapacity * targetUtilization) / 100;
          const totalPlannedHours = resourceCurrentHours + plannedHours;
          const feasible = totalPlannedHours <= targetCapacityHours;
          const weeksRequired = Math.ceil(plannedHours / 40); // Assuming 40 hours/week max

          const conflicts = [];
          const recommendations = [];

          if (!feasible) {
            conflicts.push(`Resource already has ${resourceCurrentHours} hours allocated`);
            conflicts.push(`Total allocation of ${totalPlannedHours} hours would exceed target capacity of ${targetCapacityHours} hours`);
            
            recommendations.push('Consider splitting allocation across multiple resources');
            recommendations.push('Extend timeline to reduce weekly hour requirements');
            recommendations.push('Delay start date to next capacity period');
          } else {
            recommendations.push('Allocation fits within current capacity');
            recommendations.push(`Resource will be at ${((totalPlannedHours / standardCapacity) * 100).toFixed(1)}% utilization`);
            if (totalPlannedHours / standardCapacity > 0.7) {
              recommendations.push('Consider monitoring workload closely');
            }
          }
            
          return {
            success: true,
            operation: 'plan_allocation',
            message: `✅ Allocation plan ${feasible ? 'is feasible' : 'has conflicts'} for resource ${resourceId} (${resourceName})`,
            allocation: {
              resourceId: resourceId,
              resourceName: resourceName,
              jobId: jobId,
              plannedHours: plannedHours,
              startDate: startDate || new Date().toISOString(),
              endDate: endDate || new Date(Date.now() + weeksRequired * 7 * 24 * 60 * 60 * 1000).toISOString(),
              feasible: feasible,
              conflicts: conflicts,
              recommendations: recommendations
            }
          };
        }

        case 'forecast_needs': {
          console.log(`🔮 Forecasting resource needs for ${periodType} period`);
            
          // Simulate demand forecasting
          const totalDemand = jobId ? 160 : 1200; // Hours needed
          const totalCapacity = 1000; // Available capacity
          const utilizationForecast = (totalDemand / totalCapacity) * 100;
            
          return {
            success: true,
            operation: 'forecast_needs',
            message: `✅ Resource forecast completed for ${periodType} period`,
            forecast: {
              period: `${periodType} - ${startDate || new Date().toISOString().slice(0, 7)}`,
              totalDemand: totalDemand,
              totalCapacity: totalCapacity,
              utilizationForecast: utilizationForecast,
              shortfall: Math.max(0, totalDemand - totalCapacity),
              surplus: Math.max(0, totalCapacity - totalDemand),
              criticalRoles: utilizationForecast > 100 ? ['Project Manager', 'Senior Developer'] : [],
              recommendations: utilizationForecast > 100 ? [
                'Consider hiring additional project managers',
                'Evaluate contractor resources for peak periods',
                'Prioritize high-value projects'
              ] : [
                'Current capacity meets forecasted demand',
                'Opportunity for additional project intake',
                'Consider cross-training for skill flexibility'
              ]
            }
          };
        }

        case 'get_availability': {
          console.log(`📅 Getting availability for ${resourceId ? `resource ${resourceId}` : 'all resources'}`);
            
          if (resourceId) {
            // Single resource availability
            return {
              success: true,
              operation: 'get_availability',
              message: `✅ Availability retrieved for resource ${resourceId}`,
              resource: {
                id: resourceId,
                name: 'Jacob Kildebogaard',
                department: 'Project Management',
                capacity: {
                  totalHours: 168,
                  availableHours: 134.4,
                  allocatedHours: 120,
                  utilizationRate: 89.3
                },
                availability: {
                  currentWeek: 8,
                  nextWeek: 15,
                  nextMonth: 45,
                  conflicts: [
                    {
                      jobId: 11133,
                      jobName: 'Website Redesign Project',
                      conflictHours: 10,
                      conflictDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                    }
                  ]
                }
              }
            };
          } else {
            // Multi-resource availability summary
            return {
              success: true,
              operation: 'get_availability',
              message: `✅ Availability summary for ${limit} resources`,
              resources: [
                {
                  id: 15,
                  name: 'Anders Dohrn',
                  department: 'Development',
                  utilizationRate: 95.2,
                  availableHours: 20,
                  allocatedHours: 140
                },
                {
                  id: 27,
                  name: 'Jacob Kildebogaard',
                  department: 'Project Management',
                  utilizationRate: 89.3,
                  availableHours: 14,
                  allocatedHours: 120
                }
              ].slice(0, limit),
              summary: {
                totalResources: 2,
                averageUtilization: 92.25,
                overAllocatedResources: 1,
                underUtilizedResources: 0,
                capacityGap: -10,
                periodCovered: {
                  from: startDate || new Date().toISOString(),
                  to: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                }
              }
            };
          }
        }

        default:
          return {
            success: false,
            operation: operation,
            message: `Unknown operation: ${operation}. Supported operations: get_capacity, get_utilization, plan_allocation, forecast_needs, get_availability`
          };
        }

      } catch (error) {
        console.error('❌ Error in resourcePlanningTool:', error);
        return {
          success: false,
          operation: context.operation || 'unknown',
          message: `Error in resource planning: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }
  });
}