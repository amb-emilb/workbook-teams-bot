/**
 * Job and Project Types for Workbook API
 * Based on comprehensive-endpoints.md documentation
 */

export interface BillableJob {
  CustomerId: number;
  CustomerName: string;
  Id: number;
  JobId: number;
  JobName: string;
  JobStatusId: number;
  JobEndDate: string;
  CompanyInitials: string;
  CurrencyCode: string;
  PriceSale: number;
  TotalExpenseSale: number;
  InvoiceDraftSale: number;
  ProjectManagerId: number;
}

export interface ClientProjectRetainerKeyFigures {
  Id: number;
  CurrencyId: number;
  ProjectRetainerJobType: number;
  JobReferenceKey: string;
  StartDate: string;
  EndDate: string;
  ResponsibleId: number;
  CompanyId: number;
  ProjectId: number;
  ClientId: number;
  ProjectIsMixedRetainer: boolean;
  // Quote figures
  MasterJobPriceQuoteOriginalHours: number;
  MasterJobPriceQuoteOriginalAmount: number;
  MasterJobPriceQuoteEstimatedHours: number;
  MasterJobPriceQuoteEstimatedHoursCost: number;
  MasterJobPriceQuoteEstimatedHoursSale: number;
  // Actual usage
  HoursBooked: number;
  HoursBookedCost: number;
  HoursBookedSale: number;
  HoursUsed: number;
  HoursUsedPreviousMonth: number;
  HoursUsedCurrentMonth: number;
  // Financial
  InvoicedExternal: number;
  InvoicedInternal: number;
  TotalExpenseCost: number;
  TotalExpenseSale: number;
  InvoicedRemaining: number;
  Overrun: number;
}

export interface Task {
  Id: number;
  JobId: number;
  PlanId: number;
  PhaseNumber?: number;
  TaskName: string;
  TaskNumber: number;
  // Additional fields populated in responses
  ResourceHoursBooked?: number;
  ResourceHoursUsed?: number;
  EstimatedHours?: number;
  CompletionPercentage?: number;
}

export interface Job {
  Id: number;
  Name: string;
  ClientId: number;
  ProjectId: number;
  ResponsibleResourceId: number;
  StatusId: number;
  StartDate: string;
  EndDate: string;
  Description?: string;
  CompanyId: number;
  DepartmentId?: number;
  TypeId?: number;
  // Financial fields
  EstimatedHours?: number;
  EstimatedAmount?: number;
  ActualHours?: number;
  ActualAmount?: number;
}

// Request parameter types
export interface MoveTaskToJobParams {
  Id: number; // Task ID
  JobId: number;
  PlanId: number;
  PhaseNumber?: number;
  MoveBetweenActive?: boolean;
  MoveToCalendarSyncJob?: boolean;
  DuplicatePhase: boolean;
}

export interface JobKeyFiguresNotificationParams {
  JobId?: number;
  JobIds?: number[];
  TaskId?: number;
  TaskIds?: number[];
  PlanId?: number;
}

// Job status enum - Comprehensive API type definition
/* eslint-disable no-unused-vars */
export enum JobStatus {
  DRAFT = 1,
  ACTIVE = 2,
  COMPLETED = 3,
  CANCELLED = 4,
  ON_HOLD = 5
}
/* eslint-enable no-unused-vars */

// Project/Retainer job type enum - Comprehensive API type definition  
/* eslint-disable no-unused-vars */
export enum ProjectRetainerJobType {
  PROJECT = 1,
  RETAINER = 2,
  MIXED = 3
}
/* eslint-enable no-unused-vars */