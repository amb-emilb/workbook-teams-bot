/**
 * Job API Types - Based on actual API responses from job-endpoints.md
 */

// JobTeamAllRequest response
export interface JobTeamMember {
  JobId: number;
  ResourceId: number;
  BonusPart: boolean;
  Id: number;
  JobAccess: boolean;
  PortalAccessType: number;
}

// TasksResourcePriceRequest response
export interface TaskResourcePrice {
  Id: number;
  TaskId: number;
  Hours: number;
  Cost: number;
  Sale: number;
  HoursTimeRegistration: number;
  IsoCode: string;
}

// TaskRequest response
export interface TaskResponse {
  Id: number;
  PlanId: number;
  PhaseNumber: number;
  TaskNumber: number;
  TaskName: string;
  ActivityId: number;
  StartDate: string;
  WorkDays: number;
  EndDate: string;
  TaskStatus: number;
  BookingStatus: number;
  Milestone: boolean;
  PriorityId: number;
  SupplementaryTextRequested: boolean;
  TaskColourId: number;
  ShowPublic: boolean;
  CreateDate: string;
  CreateEmployeeId: number;
  UpdateEmployeeId: number;
  UpdateDate: string;
  TemporaryId: number;
  AllowTimeRegistration: boolean;
  AllowUseOffDay: boolean;
  FromExternal: boolean;
  BookingLevel: number;
  Billable: boolean;
}

// ActivityVisualizationsRequest response
export interface Activity {
  Id: number;
  ActivityText: string;
}

// TaskInsertPositionRequest response (same as TaskResponse)
export interface TaskInsertResponse extends TaskResponse {}

// ExpenditureOpenEntriesRequest response
export interface ExpenditureEntry {
  Id: number;
  Icon: string;
  CompanyId: number;
  Jobid: number;
  ExpenseType: number;
  ExpenseDescription: string;
  Expensedate: string;
  ResourceId: number;
  ResourceName: string;
  ApprovalStatus: number;
  ApprovalStatusText: string;
  Quantity: number;
  CurrencyId: number;
  CurrencyName: string;
  TotalAmountSale: number;
  TotalAmountCost: number;
  TotalAmountSaleDisplayCurrency: number;
  TotalAmountCostDisplayCurrency: number;
}

// PriceListsJobRequest response
export interface PriceList {
  CurrencyIsoCode: string;
  Id: number;
  Name: string;
  CurrencyId: number;
  Blocked: boolean;
  PriceListDescription?: string;
  EnableActivityAccess: boolean;
}

// Mapped task data returned by JobService (camelCase)
export interface MappedTaskData {
  id: number;
  planId: number;
  phaseNumber: number;
  taskNumber: number;
  taskName: string;
  activityId: number;
  startDate: string;
  workDays: number;
  endDate: string;
  taskStatus: number;
  bookingStatus: number;
  milestone: boolean;
  priorityId: number;
  supplementaryTextRequested: boolean;
  taskColourId: number;
  showPublic: boolean;
  createDate: string;
  createEmployeeId: number;
  updateEmployeeId: number;
  updateDate: string;
  temporaryId: number;
  allowTimeRegistration: boolean;
  allowUseOffDay: boolean;
  fromExternal: boolean;
  bookingLevel: number;
  billable: boolean;
}

// Mapped activity data returned by JobService (camelCase)
export interface MappedActivity {
  id: number;
  activityText: string;
}

// Mapped job team member data returned by JobService (camelCase)
export interface MappedJobTeamMember {
  jobId: number;
  resourceId: number;
  resourceName: string;
  bonusPart: boolean;
  jobAccess: boolean;
  id: number;
  portalAccessType: number;
}

// Mapped time entry data returned by JobService (camelCase)
export interface MappedTimeEntry {
  id: number;
  icon: string;
  companyId: number;
  jobId: number;
  expenseType: number;
  expenseDescription: string;
  expenseDate: string;
  resourceId: number;
  resourceName: string;
  approvalStatus: number;
  approvalStatusText: string;
  quantity: number;
  currencyId: number;
  currencyName: string;
  totalAmountSale: number;
  totalAmountCost: number;
  totalAmountSaleDisplayCurrency: number;
  totalAmountCostDisplayCurrency: number;
}

// JobCreateRequest response
export interface JobCreateResponse {
  JobId: number;
}

// JobPatchRequest response
export interface JobPatchResponse {
  JobID: number;
  Id: number;
  JobName: string;
  ProjectId: number;
  StatusId: number;
  JobTypeId: number;
  LeveringsDato: string;
  EndDate: string;
  ResponsibleId: number;
  CompanyId: number;
  TeamId: number;
  Public: boolean;
  CreateDate: string;
  Billable: boolean;
  CompletePhase: number;
  JobTaskActive: boolean;
  JobTaskUseAllDays: boolean;
  JobResponsibleId: number;
  TimeEntryAllowed: number;
  FolderExtra: string;
  FolderArchived: boolean;
  ProductId: number;
  StartDate: string;
  AdminOnly: boolean;
  JournalNumber: number;
  TemplateJob: boolean;
  SupplementaryTextRequested: boolean;
  CompanyDepartmentId: number;
  ExpAccMtd: number;
  CreateEmployeeId: number;
  PostMethodTime: number;
  PostMethodMat: number;
  PostMethodExt: number;
  IsMediaJob: boolean;
  FlexTimeRegDisabled: boolean;
  Dim1: number;
  PostSpecId: number;
  VoucherRegistrationAllowed: boolean;
  MaterialRegAllowed: boolean;
  RetainerJob: boolean;
}

// JobSimpleVisualizationRequest response
export interface JobSimpleVisualization {
  Id: number;
  JobId: number;
  JobName: string;
  CustomerId: number;
  CustomerName: string;
  Billable: boolean;
  ProjectId: number;
  StatusId: number;
  CompanyId: number;
  EndDate: string;
  StartDate: string;
  JobTypeId: number;
  JobRessAnsvarID: number;
  ResponsibleId: number;
  ProstatusId: number;
  CompanyDepartmentId: number;
  CostingCodeId: number;
}

// Mapped job data returned by JobService (camelCase)
export interface MappedJobData {
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
}