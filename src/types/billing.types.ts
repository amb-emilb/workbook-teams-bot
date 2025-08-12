/**
 * Billing and Invoice Types for Workbook API
 * Based on comprehensive-endpoints.md documentation
 */

export interface Invoice {
  Id: number;
  InvoiceNumber: string;
  InvoiceDate: string;
  DueDate: string;
  CustomerId: number;
  CustomerName: string;
  JobId?: number;
  JobName?: string;
  CurrencyCode: string;
  // Financial amounts
  SubTotal: number;
  VatAmount: number;
  TotalAmount: number;
  PaidAmount: number;
  BalanceDue: number;
  // Status
  Status: InvoiceStatus;
  IsSent: boolean;
  IsPaid: boolean;
  // Additional info
  InvoiceType: number;
  InvoiceTypeDescription: string;
  PaymentTerms?: string;
  Notes?: string;
  // Line items would be separate
  LineItems?: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  Id: number;
  InvoiceId: number;
  Description: string;
  Quantity: number;
  UnitPrice: number;
  TotalPrice: number;
  VatRate: number;
  VatAmount: number;
  AccountNumber?: string;
  JobId?: number;
  TaskId?: number;
}

export interface ConsolidatedInvoiceJob {
  JobId: number;
  JobName: string;
  CustomerId: number;
  CustomerName: string;
  UnbilledAmount: number;
  LastInvoiceDate?: string;
  ProjectManagerId: number;
  ProjectManagerName?: string;
  CanConsolidate: boolean;
}

export interface BillingStatus {
  JobId: number;
  JobName: string;
  TotalBillable: number;
  TotalInvoiced: number;
  TotalPending: number;
  LastInvoiceNumber?: string;
  LastInvoiceDate?: string;
  NextBillingDate?: string;
}

// Request parameter types
export interface InvoiceRequestParams {
  Id?: number; // Invoice ID
  JobId?: number; // Alternative - get invoices for job
  CustomerId?: number; // Get all invoices for customer
  StartDate?: string;
  EndDate?: string;
  Status?: InvoiceStatus;
}

export interface ConsolidatedInvoiceJobsParams {
  CustomerId?: number;
  MinUnbilledAmount?: number;
  IncludeCompleted?: boolean;
}

// Invoice status enum
export enum InvoiceStatus {
  DRAFT = 1,
  SENT = 2,
  PAID = 3,
  OVERDUE = 4,
  CANCELLED = 5,
  PARTIALLY_PAID = 6
}

// Invoice type enum
export enum InvoiceType {
  STANDARD = 1,
  CREDIT_NOTE = 2,
  PRO_FORMA = 3,
  CONSOLIDATED = 4
}