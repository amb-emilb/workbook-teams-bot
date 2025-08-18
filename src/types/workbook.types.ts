// Workbook API Types

// Re-export all domain-specific types
export * from './job.types.js';
export * from './billing.types.js';
export * from './analytics.types.js';

// Resource interface matches actual API response from ResourcesRequest
// Resources represent all people in Workbook (employees, clients, contacts)
export interface Resource {
  Id: number;
  Name: string;
  Email: string;
  Initials: string;
  Active: boolean;
  Address1?: string;
  City?: string;
  PostCode?: string;
  Country?: string;
  Phone1?: string;
  CellPhone?: string;
  CreatedBy?: string;
  UpdatedBy?: string;
  CreateDate?: string;
  UpdateDate?: string;
  TypeId?: number;                 // Resource type (2=Employee, 10=Contact, etc.)
  ResponsibleResourceId?: number;  // Who manages this resource
  UserAccess?: boolean;
  UserAccountType?: number;
  ResourceFolder?: string;          // Company/Department
  ProjectName?: string;
  ResourceBookable?: boolean;
  UsedAsSupplier?: boolean;
  Anonymised?: boolean;
  ParentResourceId?: number;        // For hierarchical relationships
}

// Contact represents contact persons within a client company
// Retrieved via ContactsForResourceRequest endpoint
// Based on actual API response from user-insights.md
export interface Contact {
  Id: number;
  Name: string;
  Initials: string;
  Email?: string;
  Phone1?: string;               // Optional - only present if contact has phone defined
  ParentResourceId: number;        // Links to parent company resource
  Active: boolean;
  // Permission fields
  AllowMail: boolean;
  AllowEmail: boolean;
  AllowBulkEmail: boolean;
  AllowPhone: boolean;
  AllowSendMarketing: boolean;
  AllowSms: boolean;
  ApplicationAccessRoleId?: number;
  // Audit fields
  CreateByResourceId?: number;
  CreateDate?: string;
  UpdateDate?: string;
  UpdatedByResourceId?: number;
  // User access
  UserLogin?: string;
  InterfaceLCID?: number;
  ReportLCID?: number;
  ReleaseState?: number;
  DefaultActivityType?: number;
}

// Hierarchical structure for representing client relationships
export interface HierarchicalResource {
  resource: Resource;              // The parent company/client
  contacts: Contact[];              // Contact persons within the company
  responsibleEmployee?: Resource;   // Internal employee responsible for this client
  subResources?: HierarchicalResource[]; // Nested structure for sub-companies
}

// API Request/Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// API Request Types for direct endpoint access

export interface ResourceRequest {
  Id: number;
}

export interface ResourcesRequest {
  ResourceType?: number[];          // Filter by type (2=Employee, 10=Contact)
  Active?: boolean;
  ApplicationAccessRoleId?: number;
  ResponsibleResourceId?: number[];
  CompanyIds?: number[];
  Email?: string;
  Union?: boolean;                  // Use OR logic instead of AND
  ContactName?: string;
  TeamIds?: number[];
}

export interface ContactsForResourceRequest {
  ResourceId: number;               // Get contacts for specific resource/company
  Active?: boolean;
}

export interface ContactRequest {
  Id: number;                       // Contact ID
}

export interface ResourcePatchRequest {
  Patch: {
    Id: string;
    Active?: string;                // Must be string "true"/"false" for API
    Name?: string;
    Email?: string;
    ResponsibleEmployeeId?: string;
    [key: string]: unknown;
  };
}

// Configuration Types
export interface WorkbookConfig {
  apiKey: string;
  baseUrl: string;
  username?: string;
  password?: string;
  timeout?: number;
}

// Cache Types
export interface CacheConfig {
  contactsTTL: number; // 5 minutes
  jobsTTL: number;     // 1 minute
  resourcesTTL: number; // 5 minutes
}

// Error Types
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly response?: unknown;

  constructor(message: string, statusCode: number, response?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

export interface ServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
}


// Validation Types
export interface ValidationResult {
  valid: boolean;
  sanitized: string;
  error?: string;
}

export interface ToolParameters {
  [key: string]: string | number | boolean | string[] | number[] | boolean[] | ToolParameters;
}