import { BaseService } from '../base/baseService.js';
import { WorkbookConfig, ServiceResponse } from '../../types/workbook.types.js';
import { cacheManager } from '../base/cache.js';
import { JobTeamMember, TaskResourcePrice, TaskResponse, Activity, TaskInsertResponse, ExpenditureEntry, PriceList, JobCreateResponse, JobPatchResponse, JobSimpleVisualization } from '../../types/job-api.types.js';

/**
 * JobService - Job management API operations
 * Based on job-endpoints.md API documentation
 */
export class JobService extends BaseService {
  constructor(config: WorkbookConfig) {
    super(config);
  }

  /**
   * Get job team members
   * API: JobTeamAllRequest[]
   */
  async getJobTeam(jobId: number): Promise<ServiceResponse<unknown[]>> {
    const cacheKey = `job-team-${jobId}`;
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      return { success: true, data: cached as unknown[], cached: true };
    }

    try {
      const response = await this.post<JobTeamMember[]>('JobTeamAllRequest[]', [{ Id: jobId }]);
      
      if (!response.success) {
        return response;
      }

      if (!response.data) {
        return { success: false, error: 'No job team data received' };
      }

      const data = response.data.map((member: JobTeamMember) => ({
        jobId: member.JobId,
        resourceId: member.ResourceId,
        resourceName: '', // Need to fetch from ResourceService
        bonusPart: member.BonusPart,
        jobAccess: member.JobAccess,
        id: member.Id,
        portalAccessType: member.PortalAccessType
      }));

      cacheManager.set(cacheKey, data, 300); // 5 minute cache
      return { success: true, data, cached: false };
    } catch (error) {
      console.error('Error fetching job team:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get task resource pricing
   * API: TasksResourcePriceRequest
   */
  async getTaskResourcePrices(taskIds: number[]) {
    const cacheKey = `task-prices-${taskIds.join('-')}`;
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      return { success: true as const, data: cached, cached: true };
    }

    try {
      const response = await this.post<TaskResourcePrice[]>('TasksResourcePriceRequest', { Ids: taskIds });
      
      if (!response.success) {
        return response;
      }

      if (!response.data) {
        return { success: false, error: 'No task resource price data received' };
      }

      const data = response.data.map((task: TaskResourcePrice) => ({
        id: task.Id,
        taskId: task.TaskId,
        hours: task.Hours,
        cost: task.Cost,
        sale: task.Sale,
        hoursTimeRegistration: task.HoursTimeRegistration,
        currency: task.IsoCode
      }));

      cacheManager.set(cacheKey, data, 300); // 5 minute cache
      return { success: true, data, cached: false };
    } catch (error) {
      console.error('Error fetching task resource prices:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get task details
   * API: TaskRequest[]
   */
  async getTask(taskId: number) {
    const cacheKey = `task-${taskId}`;
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      return { success: true, data: cached, cached: true };
    }

    try {
      const response = await this.post<TaskResponse[]>('TaskRequest[]', [{ Id: taskId }]);
      
      if (!response.success) {
        return response;
      }

      if (!response.data || response.data.length === 0) {
        return { success: false, error: 'Task not found' };
      }

      const task = response.data[0];
      const data = {
        id: task.Id,
        planId: task.PlanId,
        phaseNumber: task.PhaseNumber,
        taskNumber: task.TaskNumber,
        taskName: task.TaskName,
        activityId: task.ActivityId,
        startDate: task.StartDate,
        workDays: task.WorkDays,
        endDate: task.EndDate,
        taskStatus: task.TaskStatus,
        bookingStatus: task.BookingStatus,
        milestone: task.Milestone,
        priorityId: task.PriorityId,
        supplementaryTextRequested: task.SupplementaryTextRequested,
        taskColourId: task.TaskColourId,
        showPublic: task.ShowPublic,
        createDate: task.CreateDate,
        createEmployeeId: task.CreateEmployeeId,
        updateEmployeeId: task.UpdateEmployeeId,
        updateDate: task.UpdateDate,
        temporaryId: task.TemporaryId,
        allowTimeRegistration: task.AllowTimeRegistration,
        allowUseOffDay: task.AllowUseOffDay,
        fromExternal: task.FromExternal,
        bookingLevel: task.BookingLevel,
        billable: task.Billable
      };

      cacheManager.set(cacheKey, data, 300); // 5 minute cache
      return { success: true, data, cached: false };
    } catch (error) {
      console.error('Error fetching task:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get activities for job
   * API: ActivityVisualizationsRequest
   */
  async getActivities(jobId?: number, active = true) {
    const cacheKey = `activities-${jobId || 'all'}-${active}`;
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      return { success: true as const, data: cached, cached: true };
    }

    try {
      const params: Record<string, string> = { Active: active.toString() };
      if (jobId) {
        params.JobId = jobId.toString();
      }

      const response = await this.pureGet<Activity[]>('ActivityVisualizationsRequest', params);
      
      if (!response.success) {
        return response;
      }

      if (!response.data) {
        return { success: false, error: 'No activities data received' };
      }

      const data = response.data.map((activity: Activity) => ({
        id: activity.Id,
        activityText: activity.ActivityText
      }));

      cacheManager.set(cacheKey, data, 900); // 15 minute cache (activities don't change often)
      return { success: true, data, cached: false };
    } catch (error) {
      console.error('Error fetching activities:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Insert new task
   * API: TaskInsertPositionRequest
   */
  async insertTask(taskData: {
    planId: number;
    taskName: string;
    phaseNumber?: number;
    activityId?: number;
    startDate?: string;
    workDays?: number;
    priorityId?: number;
    afterTaskNumber?: number;
    placeLast?: boolean;
  }) {
    try {
      const payload = {
        PlanId: taskData.planId,
        TaskName: taskData.taskName,
        PhaseNumber: taskData.phaseNumber || 1,
        ActivityId: taskData.activityId || 1120,
        StartDate: taskData.startDate || new Date().toISOString(),
        WorkDays: taskData.workDays || 5,
        PriorityId: taskData.priorityId || 2,
        PlaceLast: taskData.placeLast || false,
        ...(taskData.afterTaskNumber && { AfterTaskNumber: taskData.afterTaskNumber })
      };

      const response = await this.request<TaskInsertResponse>(
        'TaskInsertPositionRequest',
        'PUT',
        payload
      );
      
      if (!response.success) {
        return response;
      }

      if (!response.data) {
        return { success: false, error: 'No task insertion data received' };
      }

      return {
        success: true,
        data: {
          id: response.data.Id,
          planId: response.data.PlanId,
          phaseNumber: response.data.PhaseNumber,
          taskNumber: response.data.TaskNumber,
          taskName: response.data.TaskName,
          activityId: response.data.ActivityId,
          startDate: response.data.StartDate,
          workDays: response.data.WorkDays,
          endDate: response.data.EndDate,
          taskStatus: response.data.TaskStatus,
          bookingStatus: response.data.BookingStatus,
          milestone: response.data.Milestone,
          priorityId: response.data.PriorityId,
          allowTimeRegistration: response.data.AllowTimeRegistration,
          billable: response.data.Billable,
          createDate: response.data.CreateDate,
          updateDate: response.data.UpdateDate
        }
      };
    } catch (error) {
      console.error('Error inserting task:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get time entries for job
   * API: ExpenditureOpenEntriesRequest
   */
  async getTimeEntries(jobId: number) {
    const cacheKey = `time-entries-${jobId}`;
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      return { success: true as const, data: cached, cached: true };
    }

    try {
      const response = await this.pureGet<ExpenditureEntry[]>('ExpenditureOpenEntriesRequest', { JobId: jobId.toString() });
      
      if (!response.success) {
        return response;
      }

      if (!response.data) {
        return { success: false, error: 'No time entries data received' };
      }

      const data = response.data.map((entry: ExpenditureEntry) => ({
        id: entry.Id,
        icon: entry.Icon,
        companyId: entry.CompanyId,
        jobId: entry.Jobid,
        expenseType: entry.ExpenseType,
        expenseDescription: entry.ExpenseDescription,
        expenseDate: entry.Expensedate,
        resourceId: entry.ResourceId,
        resourceName: entry.ResourceName,
        approvalStatus: entry.ApprovalStatus,
        approvalStatusText: entry.ApprovalStatusText,
        quantity: entry.Quantity,
        currencyId: entry.CurrencyId,
        currencyName: entry.CurrencyName,
        totalAmountSale: entry.TotalAmountSale,
        totalAmountCost: entry.TotalAmountCost,
        totalAmountSaleDisplayCurrency: entry.TotalAmountSaleDisplayCurrency,
        totalAmountCostDisplayCurrency: entry.TotalAmountCostDisplayCurrency
      }));

      cacheManager.set(cacheKey, data, 60); // 1 minute cache (time entries change frequently)
      return { success: true, data, cached: false };
    } catch (error) {
      console.error('Error fetching time entries:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get price lists for jobs
   * API: PriceListsJobRequest
   */
  async getPriceLists() {
    const cacheKey = 'price-lists';
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      return { success: true as const, data: cached, cached: true };
    }

    try {
      const response = await this.pureGet<PriceList[]>('PriceListsJobRequest', {});
      
      if (!response.success) {
        return response;
      }

      if (!response.data) {
        return { success: false, error: 'No price lists data received' };
      }

      const data = response.data.map((priceList: PriceList) => ({
        id: priceList.Id,
        name: priceList.Name,
        currencyId: priceList.CurrencyId,
        currencyIsoCode: priceList.CurrencyIsoCode,
        blocked: priceList.Blocked,
        priceListDescription: priceList.PriceListDescription,
        enableActivityAccess: priceList.EnableActivityAccess
      }));

      cacheManager.set(cacheKey, data, 3600); // 1 hour cache (price lists don't change often)
      return { success: true, data, cached: false };
    } catch (error) {
      console.error('Error fetching price lists:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Create new job
   * API: JobCreateRequest
   */
  async createJob(jobData: {
    name: string;
    projectId: number;
    accountManagerResourceId?: number;
    jobManagerResourceId?: number;
    companyId?: number;
    startDate?: string;
    deliveryDate?: string;
    jobStatusId?: string;
    priceListId?: number;
    teamId?: number;
    chargeable?: boolean;
    timeRegistrationAllowed?: number;
    jobFolder?: string;
    mandatoryDimensions?: Record<string, string>;
  }) {
    try {
      const payload = {
        Name: jobData.name,
        ProjectId: jobData.projectId,
        AccountManagerResourceId: jobData.accountManagerResourceId || 27,
        JobManagerResourceId: jobData.jobManagerResourceId || 53,
        CompanyId: jobData.companyId || 1,
        StartDate: jobData.startDate || new Date().toISOString(),
        DeliveryDate: jobData.deliveryDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
        JobStatusId: jobData.jobStatusId || '1',
        PriceListId: jobData.priceListId || 1,
        TeamId: jobData.teamId || 1,
        Chargeable: jobData.chargeable !== false,
        TimeRegistrationAllowed: jobData.timeRegistrationAllowed || 1,
        JobFolder: jobData.jobFolder || jobData.name,
        ContactResourceId: null,
        CostingCodeId: null,
        DebtorId: null,
        FolderIds: [],
        JobId: null,
        MandatoryDimensions: jobData.mandatoryDimensions || { 1: '1', 14: '6' }
      };

      const response = await this.request<JobCreateResponse>(
        'JobCreateRequest',
        'PUT',
        payload
      );
      
      if (!response.success) {
        return response;
      }

      if (!response.data) {
        return { success: false, error: 'No job creation data received' };
      }

      // Clear cache since we created a new job
      cacheManager.delStartWith('job-');

      return {
        success: true,
        data: {
          jobId: response.data.JobId,
          message: `Job "${jobData.name}" created successfully with ID ${response.data.JobId}`
        }
      };
    } catch (error) {
      console.error('Error creating job:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Update existing job
   * API: JobPatchRequest
   */
  async updateJob(jobId: number, updates: {
    name?: string;
    statusId?: number;
    startDate?: string;
    endDate?: string;
    responsibleId?: number;
    projectId?: number;
    billable?: boolean;
  }) {
    try {
      const payload = {
        Patch: {
          Id: jobId,
          ...(updates.name && { JobName: updates.name }),
          ...(updates.statusId && { StatusId: updates.statusId }),
          ...(updates.startDate && { StartDate: updates.startDate }),
          ...(updates.endDate && { EndDate: updates.endDate }),
          ...(updates.responsibleId && { ResponsibleId: updates.responsibleId }),
          ...(updates.projectId && { ProjectId: updates.projectId }),
          ...(updates.billable !== undefined && { Billable: updates.billable })
        }
      };

      const response = await this.patch<JobPatchResponse>('JobPatchRequest', payload);
      
      if (!response.success) {
        return response;
      }

      if (!response.data) {
        return { success: false, error: 'No job update data received' };
      }

      // Clear related cache
      cacheManager.delStartWith('job-');

      return {
        success: true,
        data: {
          id: response.data.Id,
          jobId: response.data.JobID,
          jobName: response.data.JobName,
          projectId: response.data.ProjectId,
          statusId: response.data.StatusId,
          jobTypeId: response.data.JobTypeId,
          endDate: response.data.EndDate,
          startDate: response.data.StartDate,
          responsibleId: response.data.ResponsibleId,
          companyId: response.data.CompanyId,
          teamId: response.data.TeamId,
          billable: response.data.Billable,
          timeEntryAllowed: response.data.TimeEntryAllowed,
          folderExtra: response.data.FolderExtra
        }
      };
    } catch (error) {
      console.error('Error updating job:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get resource capacity by job ID
   * API: ETCResourceByJobIdVisualizationRequest[]
   */
  async getResourceCapacity(jobId: number) {
    const cacheKey = `resource-capacity-${jobId}`;
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      return { success: true as const, data: cached, cached: true };
    }

    try {
      const response = await this.post<{
        Id: number;
        JobId: number;
        Hours: number;
        HoursAmount: number;
        HoursNotBooked: number;
        HoursNotBookedAmount: number;
      }[]>('ETCResourceByJobIdVisualizationRequest[]', [{ Id: jobId }]);
      
      if (!response.success) {
        return response;
      }

      if (!response.data) {
        return { success: false, error: 'No resource capacity data received' };
      }

      cacheManager.set(cacheKey, response.data, 300); // 5 minute cache
      return { success: true, data: response.data, cached: false };
    } catch (error) {
      console.error('Error fetching resource capacity:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get job details (simple visualization)
   * API: JobSimpleVisualizationRequest[]
   */
  async getJobDetails(jobId: number) {
    const cacheKey = `job-details-${jobId}`;
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      return { success: true as const, data: cached, cached: true };
    }

    try {
      const response = await this.post<JobSimpleVisualization[]>('JobSimpleVisualizationRequest[]', [{ Id: jobId }]);
      
      if (!response.success) {
        return response;
      }

      if (!response.data || response.data.length === 0) {
        return { success: false, error: 'Job not found' };
      }

      const job = response.data[0];
      const data = {
        id: job.Id,
        jobId: job.JobId,
        jobName: job.JobName,
        customerId: job.CustomerId,
        customerName: job.CustomerName,
        billable: job.Billable,
        projectId: job.ProjectId,
        statusId: job.StatusId,
        companyId: job.CompanyId,
        endDate: job.EndDate,
        startDate: job.StartDate,
        jobTypeId: job.JobTypeId,
        jobResponsibleId: job.JobRessAnsvarID,
        responsibleId: job.ResponsibleId,
        prostatusId: job.ProstatusId,
        companyDepartmentId: job.CompanyDepartmentId,
        costingCodeId: job.CostingCodeId
      };

      cacheManager.set(cacheKey, data, 300); // 5 minute cache
      return { success: true, data, cached: false };
    } catch (error) {
      console.error('Error fetching job details:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}