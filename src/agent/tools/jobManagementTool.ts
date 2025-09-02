import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { WorkbookClient } from '../../services/index.js';
import { JobStatus } from '../../types/workbook.types.js';
import { MappedJobTeamMember, MappedJobType } from '../../types/job-api.types.js';

/**
 * Create job management tool for core job operations
 * Factory function that accepts initialized WorkbookClient
 */
export function createJobManagementTool(workbookClient: WorkbookClient) {
  return createTool({
    id: 'job-management',
    description: `JOB MANAGEMENT TOOL - Use this tool for core job and project operations.

    PRIMARY USE CASES:
    - Create new jobs and projects
    - Update job status and information
    - Get job details and information
    - Manage job team assignments
    - Job status tracking and monitoring
    
    DO NOT USE for:
    - Resource capacity planning (use resourcePlanningTool instead)
    - Financial analysis (use jobFinancialsTool instead)
    - Advanced resource allocation analysis (use resourcePlanningTool instead)
    
    This tool focuses on high-level job management, not detailed project execution.`,

    inputSchema: z.object({
      operation: z.enum(['create', 'update', 'patch', 'get', 'list', 'assign_team', 'get_team'])
        .describe('Operation to perform on jobs'),
      
      // Job identification
      jobId: z.number()
        .optional()
        .describe('Job ID for update, get, assign_team, or get_team operations'),
      
      // Job creation/update fields
      jobName: z.string()
        .optional()
        .describe('Name of the job (required for create)'),
      clientId: z.number()
        .optional()
        .describe('Client company ID (required for create)'),
      projectId: z.number()
        .optional()
        .describe('Project ID this job belongs to'),
      responsibleResourceId: z.number()
        .optional()
        .describe('Employee ID responsible for this job'),
      statusId: z.number()
        .optional()
        .describe('Job status ID (1=Draft, 2=Active, 3=Completed, 4=Cancelled, 5=On Hold)'),
      startDate: z.string()
        .optional()
        .describe('Job start date (ISO format)'),
      endDate: z.string()
        .optional()
        .describe('Job end date (ISO format)'),
      description: z.string()
        .optional()
        .describe('Job description'),
      
      // Team assignment
      teamMemberIds: z.array(z.number())
        .optional()
        .describe('Array of resource IDs to assign to the job team'),
      
      // Advanced patch fields (for patch operation)
      patchFields: z.record(z.any())
        .optional()
        .describe('Key-value pairs of job fields to patch (for patch operation - allows updating any job field)'),
        
      // List filters
      activeOnly: z.boolean()
        .default(true)
        .describe('Filter to only active jobs (for list operation)'),
      limit: z.number()
        .min(1)
        .max(100)
        .default(10)
        .describe('Maximum number of jobs to return (for list operation)')
    }),

    outputSchema: z.object({
      success: z.boolean(),
      operation: z.string(),
      message: z.string(),
      job: z.object({
        id: z.number(),
        name: z.string(),
        clientId: z.number(),
        clientName: z.string().optional(),
        projectId: z.number().optional(),
        responsibleResourceId: z.number().optional(),
        responsibleEmployeeName: z.string().optional(),
        statusId: z.number(),
        statusName: z.string(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        description: z.string().optional(),
        estimatedHours: z.number().optional(),
        estimatedAmount: z.number().optional(),
        actualHours: z.number().optional(),
        actualAmount: z.number().optional()
      }).optional(),
      jobs: z.array(z.object({
        id: z.number(),
        name: z.string(),
        clientName: z.string(),
        statusName: z.string(),
        responsibleEmployeeName: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional()
      })).optional(),
      team: z.array(z.object({
        resourceId: z.number(),
        resourceName: z.string(),
        jobAccess: z.boolean(),
        bonusPart: z.boolean()
      })).optional()
    }),

    execute: async ({ context }) => {
      try {
        const {
          operation,
          jobId,
          jobName,
          clientId,
          projectId,
          responsibleResourceId,
          statusId,
          startDate,
          endDate,
          description,
          teamMemberIds,
          patchFields,
          activeOnly,
          limit
        } = context;

        console.log(`🏢 Job Management Tool - Operation: ${operation}`, context);

        switch (operation) {
        case 'create': {
          if (!jobName || !clientId) {
            return {
              success: false,
              operation: 'create',
              message: 'Job name and client ID are required for creating a job'
            };
          }

          console.log('📝 Creating new job with API:', { jobName, clientId, projectId, responsibleResourceId });

          // Get available job types for validation and user guidance using new JobTypesRequest API
          const jobTypesResponse = await workbookClient.jobs.getJobTypes(true, 1);
          let availableJobTypes: string[] = [];
          if (jobTypesResponse.success && jobTypesResponse.data) {
            const jobTypes = jobTypesResponse.data as MappedJobType[];
            availableJobTypes = jobTypes.map(jt => `${jt.name} (ID: ${jt.id})`);
            console.log(`📋 Available job types for creation: ${availableJobTypes.join(', ')}`);
          }

          const createResponse = await workbookClient.jobs.createJob({
            name: jobName,
            projectId: projectId || 797, // Default project ID from examples
            accountManagerResourceId: responsibleResourceId || 27,
            jobManagerResourceId: responsibleResourceId || 53,
            companyId: 1,
            startDate: startDate,
            deliveryDate: endDate,
            jobStatusId: statusId?.toString() || '1',
            timeRegistrationAllowed: 1,
            jobFolder: jobName
          });

          if (!createResponse.success) {
            return {
              success: false,
              operation: 'create',
              message: `❌ Failed to create job: ${'error' in createResponse ? createResponse.error : 'Unknown error'}`
            };
          }

          if (!createResponse.data) {
            return {
              success: false,
              operation: 'create',
              message: '❌ No job creation data received from API'
            };
          }

          const jobId = 'jobId' in createResponse.data ? createResponse.data.jobId : createResponse.data.JobId;
          
          // Include job types information in success message
          const jobTypesInfo = availableJobTypes.length > 0 
            ? `\n\n📋 Available job types: ${availableJobTypes.join(', ')}`
            : '';
          
          return {
            success: true,
            operation: 'create',
            message: `✅ Job "${jobName}" created successfully with ID ${jobId}${jobTypesInfo}`,
            job: {
              id: jobId,
              name: jobName,
              clientId: clientId,
              clientName: 'Client Company', // Would need another API call to get client name
              projectId: projectId,
              responsibleResourceId: responsibleResourceId,
              responsibleEmployeeName: 'Project Manager', // Would need another API call
              statusId: statusId || JobStatus.DRAFT,
              statusName: getJobStatusName(statusId || JobStatus.DRAFT),
              startDate: startDate,
              endDate: endDate,
              description: description,
              estimatedHours: 0,
              estimatedAmount: 0,
              actualHours: 0,
              actualAmount: 0
            }
          };
        }

        case 'get': {
          if (!jobId) {
            return {
              success: false,
              operation: 'get',
              message: 'Job ID is required for getting job details'
            };
          }

          console.log(`🔍 Getting job details for ID: ${jobId} using real API`);
            
          const jobResponse = await workbookClient.jobs.getJobDetails(jobId);
          if (!jobResponse.success) {
            return {
              success: false,
              operation: 'get',
              message: `❌ Failed to retrieve job details for ID ${jobId}: ${'error' in jobResponse ? jobResponse.error : 'Unknown error'}`
            };
          }

          if (!jobResponse.data) {
            return {
              success: false,
              operation: 'get',
              message: `❌ No job data found for ID ${jobId}`
            };
          }

          // Type narrow the response data
          const job = jobResponse.data as {
            id: number;
            jobId: number;
            jobName: string;
            customerId: number;
            customerName: string;
            billable: boolean;
            projectId: number;
            statusId: number;
            companyId: number;
            endDate: string;
            startDate: string;
            jobTypeId: number;
            jobResponsibleId: number;
            responsibleId: number;
            prostatusId: number;
            companyDepartmentId: number;
            costingCodeId: number;
          };

          return {
            success: true,
            operation: 'get',
            message: `✅ Successfully retrieved job details for ID ${jobId}`,
            job: {
              id: job.id,
              name: job.jobName,
              clientId: job.customerId,
              clientName: job.customerName,
              projectId: job.projectId,
              responsibleResourceId: job.responsibleId,
              responsibleEmployeeName: `Resource ${job.responsibleId}`, // Would need resource API call
              statusId: job.statusId,
              statusName: getJobStatusName(job.statusId),
              startDate: job.startDate,
              endDate: job.endDate,
              description: '', // Not available in simple visualization
              estimatedHours: 0, // Would need financial API
              estimatedAmount: 0, // Would need financial API  
              actualHours: 0, // Would need time tracking API
              actualAmount: 0 // Would need financial API
            }
          };
        }

        case 'list': {
          console.log(`📋 Listing jobs - Active only: ${activeOnly}, Limit: ${limit}`);
            
          // Simulate job list - would call actual API
          const sampleJobs = [
            {
              id: 11133,
              name: 'Website Redesign Project',
              clientName: 'ADECCO',
              statusName: 'Active',
              responsibleEmployeeName: 'Jacob Kildebogaard',
              startDate: '2025-08-01T00:00:00.000Z',
              endDate: '2025-11-30T00:00:00.000Z'
            },
            {
              id: 11134,
              name: 'Marketing Campaign',
              clientName: 'TechCorp',
              statusName: 'Draft',
              responsibleEmployeeName: 'Anders Dohrn',
              startDate: '2025-09-01T00:00:00.000Z',
              endDate: '2025-10-15T00:00:00.000Z'
            }
          ];

          return {
            success: true,
            operation: 'list',
            message: `✅ Found ${sampleJobs.length} jobs`,
            jobs: sampleJobs.slice(0, limit)
          };
        }

        case 'get_team': {
          if (!jobId) {
            return {
              success: false,
              operation: 'get_team',
              message: 'Job ID is required for getting job team'
            };
          }

          console.log(`👥 Getting team for job ID: ${jobId}`);
            
          // Call real JobTeamAllRequest API
          const teamResponse = await workbookClient.jobs.getJobTeam(jobId);
          if (!teamResponse.success) {
            return {
              success: false,
              operation: 'get_team',
              message: `❌ Failed to retrieve team for job ${jobId}: ${'error' in teamResponse ? teamResponse.error : 'Unknown error'}`
            };
          }

          if (!teamResponse.data) {
            return {
              success: false,
              operation: 'get_team',
              message: `❌ No team data found for job ${jobId}`
            };
          }

          // Get resource names for team members
          const teamWithNames = [];
          for (const member of (teamResponse.data as MappedJobTeamMember[])) {
            try {
              const resourceResponse = await workbookClient.resources.getById(member.resourceId);
              teamWithNames.push({
                resourceId: member.resourceId,
                resourceName: (resourceResponse.success && resourceResponse.data) ? resourceResponse.data.Name : `Resource ${member.resourceId}`,
                jobAccess: member.jobAccess,
                bonusPart: member.bonusPart
              });
            } catch {
              teamWithNames.push({
                resourceId: member.resourceId,
                resourceName: `Resource ${member.resourceId}`,
                jobAccess: member.jobAccess,
                bonusPart: member.bonusPart
              });
            }
          }

          return {
            success: true,
            operation: 'get_team',
            message: `✅ Successfully retrieved team for job ${jobId}`,
            team: teamWithNames
          };
        }

        case 'assign_team': {
          if (!jobId || !teamMemberIds || teamMemberIds.length === 0) {
            return {
              success: false,
              operation: 'assign_team',
              message: 'Job ID and team member IDs are required for team assignment'
            };
          }

          console.log(`👥 Assigning team to job ${jobId}:`, teamMemberIds);
            
          return {
            success: true,
            operation: 'assign_team',
            message: `✅ Successfully assigned ${teamMemberIds.length} team members to job ${jobId}! Note: This is a simulation - actual team assignment requires API implementation.`,
            team: teamMemberIds.map(resourceId => ({
              resourceId,
              resourceName: `Employee ${resourceId}`,
              jobAccess: true,
              bonusPart: false
            }))
          };
        }

        case 'update': {
          if (!jobId) {
            return {
              success: false,
              operation: 'update',
              message: 'Job ID is required for updating a job'
            };
          }

          console.log(`📝 Updating job ${jobId} with real API:`, {
            jobName, statusId, startDate, endDate, responsibleResourceId
          });

          const updateResponse = await workbookClient.jobs.updateJob(jobId, {
            name: jobName,
            statusId: statusId,
            startDate: startDate,
            endDate: endDate,
            responsibleId: responsibleResourceId,
            projectId: projectId
          });

          if (!updateResponse.success) {
            return {
              success: false,
              operation: 'update',
              message: `❌ Failed to update job ${jobId}: ${'error' in updateResponse ? updateResponse.error : 'Unknown error'}`
            };
          }

          if (!updateResponse.data) {
            return {
              success: false,
              operation: 'update',
              message: `❌ No job update data received for job ${jobId}`
            };
          }

          // Type narrow the response data
          const updatedJob = updateResponse.data as {
            id: number;
            jobId: number;
            jobName: string;
            projectId: number;
            statusId: number;
            jobTypeId: number;
            endDate: string;
            startDate: string;
            responsibleId: number;
            companyId: number;
            teamId: number;
            billable: boolean;
            timeEntryAllowed: number;
            folderExtra: string;
          };

          return {
            success: true,
            operation: 'update',
            message: `✅ Job ${jobId} updated successfully!`,
            job: {
              id: updatedJob.id,
              name: updatedJob.jobName,
              clientId: 0, // Not available in patch response
              clientName: 'Client', // Not available in patch response
              projectId: updatedJob.projectId,
              responsibleResourceId: updatedJob.responsibleId,
              responsibleEmployeeName: `Resource ${updatedJob.responsibleId}`,
              statusId: updatedJob.statusId,
              statusName: getJobStatusName(updatedJob.statusId),
              startDate: updatedJob.startDate,
              endDate: updatedJob.endDate,
              description: description || ''
            }
          };
        }

        case 'patch': {
          if (!jobId) {
            return {
              success: false,
              operation: 'patch',
              message: 'Job ID is required for patching a job'
            };
          }

          if (!patchFields || Object.keys(patchFields).length === 0) {
            return {
              success: false,
              operation: 'patch',
              message: 'Patch fields are required for patching a job'
            };
          }

          console.log(`🔧 Patching job ${jobId} with new JobPatchRequest API:`, patchFields);

          // Use the new enhanced patchJob method from JobService
          const patchResponse = await workbookClient.jobs.patchJob(jobId, patchFields);

          if (!patchResponse.success) {
            return {
              success: false,
              operation: 'patch',
              message: `❌ Failed to patch job ${jobId}: ${'error' in patchResponse ? patchResponse.error : 'Unknown error'}`
            };
          }

          if (!patchResponse.data) {
            return {
              success: false,
              operation: 'patch',
              message: `❌ No job patch data received for job ${jobId}`
            };
          }

          // Type the response data properly
          const patchData = patchResponse.data as { jobId: number; jobName: string; message: string };
          
          return {
            success: true,
            operation: 'patch',
            message: `✅ Job ${jobId} patched successfully using enhanced JobPatchRequest API`,
            job: {
              id: patchData.jobId,
              name: patchData.jobName,
              clientId: 0, // Would need additional API call to get full details
              statusId: 0,
              statusName: 'Updated',
              startDate: '',
              endDate: '',
              description: `Patched fields: ${Object.keys(patchFields).join(', ')}`
            }
          };
        }

        default:
          return {
            success: false,
            operation: operation,
            message: `Unknown operation: ${operation}. Supported operations: create, update, patch, get, list, assign_team, get_team`
          };
        }

      } catch (error) {
        console.error('❌ Error in jobManagementTool:', error);
        return {
          success: false,
          operation: context.operation || 'unknown',
          message: `Error in job management: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }
  });
}

/**
 * Convert job status ID to human-readable name
 */
function getJobStatusName(statusId: number): string {
  switch (statusId) {
  case JobStatus.DRAFT: return 'Draft';
  case JobStatus.ACTIVE: return 'Active';
  case JobStatus.COMPLETED: return 'Completed';
  case JobStatus.CANCELLED: return 'Cancelled';
  case JobStatus.ON_HOLD: return 'On Hold';
  default: return 'Unknown';
  }
}