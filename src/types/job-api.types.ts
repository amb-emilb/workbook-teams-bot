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

// New endpoints from job-endpoints-2.md

// TagsRequest response
export interface Tag {
  Id: number;
  TagId: number;
  TagName: string;
  Active: boolean;
  CreateDate: string;
  UpdateResourceId: number;
  UpdateDate: string;
  Color: string;
  Internal: boolean;
}

// InvoicesRequest response
export interface Invoice {
  Id: number;
  Number: string;
  TypeId: number;
  Date: string;
  JobId: number;
  ResponsibleResourceId: number;
  Title: string;
  Headline: string;
  DebtorId: number;
  DebtorLabel: string;
  DebtorAttention: string;
  VATPercent: number;
  LanguageId: number;
  PrintDate: string;
  PrintResourceId: number;
  DebtorCompanyNumber: string;
  ShowPhases: number;
  ShowPhasePrice: boolean;
  ShowPhaseNumber: boolean;
  ShowLines: number;
  ShowLinePrice: boolean;
  ShowLineHours: boolean;
  ShowLineHoursPrice: boolean;
  ShowDividingLines: boolean;
  DoIndentLines: boolean;
  ShowDecimals: boolean;
  ShowCurrency: boolean;
  ShowVATPercent: boolean;
  AmountNet: number;
  AmountVat: number;
  AmountTot: number;
  JournalNumber: number;
  PayTermId: number;
  DueDate: string;
  CreditNoteCloseJob: boolean;
  MainInvoice: boolean;
  AmountNetCurrency: number;
  AmountVatCurrency: number;
  AmountTotalCurrency: number;
  PostDate: string;
  AmountNetVatAttract: number;
  AmountNetVatAttractCurrency: number;
  PayModeId: number;
  PayModeIdentificationNo: string;
  PayModeCheckDigit: number;
  PayModeIdentificationLine: string;
  PayModeAccountNo: number;
  PayModeDebtorAnnotation: string;
  CompanyName: string;
  UpdateResId: number;
  UpdateDate: string;
  UpdateType: number;
  eTransferDate: string;
  UseActGrouping: boolean;
  Status: number;
  PartialInvoiceExpPostIsApproved: boolean;
  ArpVatId: number;
  DeliveryArpAccId: number;
  DeliveryDebtorAttention: string;
  ReverseCharge: boolean;
  PayTermText: string;
  ReportLayoutId: number;
  CurrencyId: number;
  CurrencyRate: number;
  CurrencyDate: string;
  DoNotCapitalize: boolean;
  SalesDate: string;
  NumberNumeric: number;
  SubInvoice: boolean;
  EliminatePartInvoice: boolean;
  ReportWatermarkId: number;
  PaymentStatusForSystemsWithoutFinance: number;
  ShowPartInvoiceExpenseDetails: boolean;
  IncludeVouchers: number;
  Internal: boolean;
  TimeOfSupplyOnLines: boolean;
}

// InvoicePaymentStatusRequest response
export interface InvoicePaymentStatus {
  Id: number;
  CompanyId: number;
  JobId: number;
  PaymentStatusId: number;
  PaymentStatusText: string;
  PaymentStatus: string;
  Amount: number;
  IsoCode: string;
  LatestPaidDate: string;
}

// ExpenditureSummaryHoursAndCostRequest response
export interface ExpenditureSummary {
  Id: number;
  JobId: number;
  RowType: number;
  GroupNumber: number;
  GroupName: string;
  SortOrder: number;
  CurrencyId: number;
  CurrencyCode: string;
  ActivityId?: number;
  Description: string;
  QuotedPrice?: number;
  ActualHours?: number;
  ActualCosts?: number;
  ActualPrice?: number;
  Billed?: number;
  UnBilled?: number;
}

// Mapped versions for camelCase compatibility
export interface MappedTag {
  id: number;
  tagId: number;
  tagName: string;
  active: boolean;
  createDate: string;
  updateResourceId: number;
  updateDate: string;
  color: string;
  internal: boolean;
}

export interface MappedInvoice {
  id: number;
  number: string;
  typeId: number;
  date: string;
  jobId: number;
  responsibleResourceId: number;
  title: string;
  headline: string;
  debtorId: number;
  debtorLabel: string;
  amountNet: number;
  amountVat: number;
  amountTot: number;
  dueDate: string;
  paymentStatus: number;
  currencyId: number;
  companyName: string;
}

export interface MappedInvoicePaymentStatus {
  id: number;
  companyId: number;
  jobId: number;
  paymentStatusId: number;
  paymentStatusText: string;
  paymentStatus: string;
  amount: number;
  isoCode: string;
  latestPaidDate: string;
}

export interface MappedExpenditureSummary {
  id: number;
  jobId: number;
  rowType: number;
  groupNumber: number;
  groupName: string;
  sortOrder: number;
  currencyId: number;
  currencyCode: string;
  activityId?: number;
  description: string;
  quotedPrice?: number;
  actualHours?: number;
  actualCosts?: number;
  actualPrice?: number;
  billed?: number;
  unBilled?: number;
}

// New endpoints from job-endpoints-3.md

// ExpenditureSummaryDepartmentProfitSplitVisualizationRequest response
export interface DepartmentProfitSplit {
  Id: number;
  RecordType: number; // 1 = department data, 2 = total
  DepartmentType?: string; // "Owner" or "Delivery"
  DepartmentName?: string; // "SEO", "AdWords", "Search & Social", "Total"
  DepartmentId?: number;
  CurrencyId: number;
  CurrencyCode: string;
  PriceQuoteShare?: number;
  PriceQuoteSharePercentage?: number;
  TaskAmount?: number;
  TaskPercentage?: number;
  TimeShare?: number;
  TimePercentage?: number;
  InvoiceShare?: number;
  InvoicePercentage?: number;
}

// JobTypesRequest response
export interface JobType {
  Id: number;
  Name: string; // "AdHoc", "Annonce", "Klippekort", etc.
  Active: boolean;
  RetainerJob: boolean;
  UpdateDate?: string;
  UpdatePriceQuote: boolean;
}

// TimeEntryTaskResourceSumVisualizationRequest response
export interface TimeEntryTaskResourceSum {
  Id: number;
  ResourceId: number;
  TaskId: number;
  HoursTimeRegistration: number;
  Done: boolean;
  HasTimeRegistration: boolean;
}

// CapacityVisualizationMultiRequest response
export interface CapacityVisualization {
  ReferenceId: number;
  Id: number;
  ResourceId: number;
  DayDate: string;
  Capacity: number;
  CapacityCurrent: number;
  HoursBooked: number;
  HoursBookedCurrent: number;
  TotalHoursBooked: number;
  TotalHoursBookedCurrent: number;
  TotalApprovedHoursBooked: number;
  TotalApprovedHoursBookedCurrent: number;
  HoursNormal: number;
  BookingLevel: number; // 3 = available, other values indicate booking status
  DayType: number; // 1 = normal day
  HoursHoliday: number;
}

// JobPatchRequest payload interface
export interface JobPatchPayload {
  Patch: Record<string, unknown>; // Dynamic patch object for any job field
}

// DepartmentsRequest response
export interface Department {
  Id: number;
  CompanyId: number;
  Name: string;
  Active: boolean;
}

export interface MappedDepartment {
  id: number;
  companyId: number;
  name: string;
  active: boolean;
}

// Mapped versions for camelCase compatibility
export interface MappedDepartmentProfitSplit {
  id: number;
  recordType: number;
  departmentType?: string;
  departmentName?: string;
  departmentId?: number;
  currencyId: number;
  currencyCode: string;
  priceQuoteShare?: number;
  priceQuoteSharePercentage?: number;
  taskAmount?: number;
  taskPercentage?: number;
  timeShare?: number;
  timePercentage?: number;
  invoiceShare?: number;
  invoicePercentage?: number;
}

export interface MappedJobType {
  id: number;
  name: string;
  active: boolean;
  retainerJob: boolean;
  updateDate?: string;
  updatePriceQuote: boolean;
}

export interface MappedTimeEntryTaskResourceSum {
  id: number;
  resourceId: number;
  taskId: number;
  hoursTimeRegistration: number;
  done: boolean;
  hasTimeRegistration: boolean;
}

export interface MappedCapacityVisualization {
  referenceId: number;
  id: number;
  resourceId: number;
  dayDate: string;
  capacity: number;
  capacityCurrent: number;
  hoursBooked: number;
  hoursBookedCurrent: number;
  totalHoursBooked: number;
  totalHoursBookedCurrent: number;
  totalApprovedHoursBooked: number;
  totalApprovedHoursBookedCurrent: number;
  hoursNormal: number;
  bookingLevel: number;
  dayType: number;
  hoursHoliday: number;
}