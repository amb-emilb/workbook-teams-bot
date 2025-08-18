/**
 * Analytics and Business Intelligence Types for Workbook API
 * Based on comprehensive-endpoints.md documentation
 */

export interface CubeProjectData {
  Id: string;
  ExpenseType: number;
  LineType: string;
  ReferenceId: number;
  ReferenceNumber: string;
  JobId: number;
  JobName: string;
  JobEndDate: string;
  JobCompanyName: string;
  JobDepartmentName?: string;
  JobTypeName?: string;
  JobResponsibleName: string;
  JobDescription?: string;
  CustomerId: number;
  CustomerName: string;
  CustomerType?: string;
  ProjectName?: string;
  ActivityName?: string;
  // Quantities and rates
  Quantity: number;
  CostPerUnit: number;
  SalePerUnit: number;
  Costs: number;
  TheoreticalSale: number;
  ActualizedCost: number;
  ActualizedSale: number;
  TheoreticalGrossProfit: number;
  ActualGrossProfit: number;
  // Employee info
  EmployeeName?: string;
  EmployeeCompanyName?: string;
  TeamName?: string;
  // Dimensions
  Dimension1?: string;
  Dimension2?: string;
  Dimension3?: string;
  Dimension4?: string;
  Dimension5?: string;
  // Invoice info
  InvoiceNumber?: string;
  InvoiceType?: number;
  InvoiceTypeDescription?: string;
}

export interface ResourceProductivityReport {
  ResourceId: number;
  ResourceName: string;
  Department: string;
  Team?: string;
  Period: string;
  // Time metrics
  TotalHours: number;
  BillableHours: number;
  NonBillableHours: number;
  UtilizationRate: number; // Percentage
  // Financial metrics
  TotalRevenue: number;
  AverageHourlyRate: number;
  CostRecoveryRate: number;
  // Project breakdown
  ProjectCount: number;
  ClientCount: number;
  // Approval metrics
  ApprovedHours: number;
  PendingHours: number;
  RejectedHours: number;
}

export interface ProjectAnalyticsReport {
  JobId: number;
  JobName: string;
  ClientName: string;
  ProjectManager: string;
  // Progress metrics
  CompletionPercentage: number;
  DaysRemaining: number;
  IsOnSchedule: boolean;
  // Budget metrics
  BudgetUtilization: number;
  BudgetRemaining: number;
  ProfitMargin: number;
  IsOverBudget: boolean;
  // Resource metrics
  TeamSize: number;
  TotalHoursLogged: number;
  AverageProductivity: number;
  // Risk indicators
  RiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  RiskFactors: string[];
}

export interface ComprehensiveAnalytics {
  // Company overview
  CompanyMetrics: {
    TotalRevenue: number;
    TotalCosts: number;
    GrossProfit: number;
    ProfitMargin: number;
    ActiveProjects: number;
    ActiveEmployees: number;
    ActiveClients: number;
  };
  // Department breakdown
  DepartmentMetrics: Array<{
    DepartmentName: string;
    Revenue: number;
    Costs: number;
    Utilization: number;
    HeadCount: number;
  }>;
  // Top performers
  TopPerformers: {
    ByRevenue: ResourceProductivityReport[];
    ByUtilization: ResourceProductivityReport[];
    ByProjects: ResourceProductivityReport[];
  };
  // Project health
  ProjectHealth: {
    OnTrack: number;
    AtRisk: number;
    Delayed: number;
    Completed: number;
  };
  // Financial trends
  Trends: {
    RevenueGrowth: number; // Percentage
    CostGrowth: number; // Percentage
    UtilizationTrend: number; // Percentage change
    Period: string;
  };
}

// Request parameter types
export interface CubeProjectParams {
  ExpenseType: number;
  ReferenceNumber?: string;
  ReferenceId: number;
  JobId?: number;
  StartDate?: string;
  EndDate?: string;
  GroupBy?: string[];
}

export interface AnalyticsDateRange {
  StartDate: string;
  EndDate: string;
}

// Expense type enum - Comprehensive API type definition
/* eslint-disable no-unused-vars */
export enum ExpenseType {
  TIME = 1,
  EXPENSE = 2,
  PRODUCT = 3,
  MILESTONE = 4
}
/* eslint-enable no-unused-vars */

// Line type enum - Comprehensive API type definition
/* eslint-disable no-unused-vars */
export enum LineType {
  REVENUE = 'Revenue',
  COST = 'Cost',
  PROFIT = 'Profit'
}
/* eslint-enable no-unused-vars */