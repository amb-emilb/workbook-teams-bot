/**
 * Tool Result Types
 * TypeScript interfaces derived from tool outputSchemas to replace 'any' types in tests
 */

// Import base types
import { Resource, Contact } from './workbook.types.js';

// Hierarchical Search Tool Result Types
export interface HierarchicalCompany {
  id: number;
  name: string;
  responsibleEmployee?: string;
  contactCount: number;
  contacts?: Array<{
    name: string;
    email?: string;
    phone?: string;
  }>;
}

export interface HierarchicalSearchResult {
  companies: HierarchicalCompany[];
  totalFound: number;
  message: string;
}

// Advanced Filter Tool Result Types  
export interface FilteredResource extends Resource {
  // Extends base Resource with any additional filtering metadata
}

export interface AdvancedFilterResult {
  resources: FilteredResource[];
  totalFound: number;
  appliedFilters: {
    resourceType?: number[];
    active?: boolean;
    emailDomain?: string;
    company?: string;
    responsibleEmployee?: string;
    hasEmail?: boolean;
    contactCountRange?: {
      min?: number;
      max?: number;
    };
  };
  message: string;
}

// Enhanced Export Tool Result Types
export interface ExportResult {
  success: boolean;
  format: 'csv' | 'json' | 'text';
  fileName: string;
  filePath: string;
  recordCount: number;
  fileSize: number;
  message: string;
}

// Export context interfaces for enhanced export tool
export interface ExportContext {
  resourceTypes?: number[];
  includeResponsibleEmployee?: boolean;
  includeCompanyMapping?: boolean;
  activeOnly?: boolean;
  exportType?: string;
  country?: string;
  format?: string;
}

export interface EnrichedResource extends Resource {
  ResponsibleEmployee?: string;
  CompanyName?: string;
  ContactType?: string;
  [key: string]: unknown;
}

// Geographic Analysis Tool Result Types
export interface GeographicDistribution {
  country: string;
  city?: string;
  count: number;
  percentage: number;
}

export interface GeographicAnalysisResult {
  totalResources: number;
  distributions: {
    byCountry: GeographicDistribution[];
    byCity: GeographicDistribution[];
  };
  insights: {
    topCountries: string[];
    topCities: string[];
    concentrationMetrics: {
      diversity: number;
      concentration: number;
    };
  };
  message: string;
}

// Performance Monitoring Tool Result Types
export interface PerformanceMetrics {
  currentStats: {
    totalApiCalls: number;
    averageResponseTime: number;
    cacheHitRate: number;
    errorRate: number;
  };
  toolMetrics: Array<{
    toolId: string;
    executionCount: number;
    averageDuration: number;
    successRate: number;
    lastExecuted: string;
  }>;
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    memoryUsage: number;
    cpuUsage?: number;
  };
}

export interface PerformanceMonitoringResult {
  action: string;
  timestamp: string;
  metrics?: PerformanceMetrics;
  recommendations?: string[];
  reportData?: unknown; // For complex report data
  message: string;
}

// Search Tool Result Types
export interface SearchContactResult {
  contacts: Contact[];
  totalFound: number;
  searchQuery: string;
  executionTime: number;
  message: string;
}

// Company Search Tool Result Types
export interface CompanySearchResult {
  companies: Resource[];
  totalFound: number;
  searchQuery: {
    companyName?: string;
    includeHierarchy: boolean;
  };
  hierarchyData?: HierarchicalSearchResult;
  executionTime: number;
  message: string;
}

// Data Quality Tool Result Types
export interface DataQualityIssue {
  type: 'missing_email' | 'invalid_phone' | 'missing_contact' | 'duplicate_record' | 'outdated_info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  resourceId: number;
  resourceName: string;
  description: string;
  suggestion: string;
}

export interface DataQualityResult {
  summary: {
    totalRecords: number;
    issuesFound: number;
    qualityScore: number; // 0-100
  };
  issuesByType: Record<string, number>;
  issuesBySeverity: Record<string, number>;
  issues: DataQualityIssue[];
  recommendations: string[];
  message: string;
}

// Portfolio Analysis Tool Result Types
export interface PortfolioMetrics {
  totalClients: number;
  totalRevenue: number;
  averageProjectValue: number;
  topClients: Array<{
    clientName: string;
    revenue: number;
    projectCount: number;
  }>;
  riskAnalysis: {
    highRiskClients: number;
    concentrationRisk: number;
  };
}

export interface PortfolioAnalysisResult {
  metrics: PortfolioMetrics;
  insights: string[];
  recommendations: string[];
  message: string;
}

// Relationship Mapping Tool Result Types
export interface RelationshipMap {
  companies: Array<{
    id: number;
    name: string;
    contacts: Contact[];
    responsibleEmployee?: Resource;
    relationships: Array<{
      type: 'parent' | 'subsidiary' | 'partner' | 'vendor';
      relatedCompanyId: number;
      relatedCompanyName: string;
    }>;
  }>;
  networkMetrics: {
    totalNodes: number;
    totalConnections: number;
    averageConnections: number;
    networkDensity: number;
  };
}

export interface RelationshipMappingResult {
  relationshipMap: RelationshipMap;
  insights: string[];
  message: string;
}

// Bulk Operations Tool Result Types
export interface BulkOperationResult {
  operation: string;
  totalRecords: number;
  successCount: number;
  errorCount: number;
  skippedCount: number;
  results: Array<{
    resourceId: number;
    status: 'success' | 'error' | 'skipped';
    message?: string;
  }>;
  executionTime: number;
  message: string;
}

// Universal Search Tool Result Types
export interface UniversalSearchResult {
  query: string;
  results: {
    resources: Resource[];
    contacts: Contact[];
    projects?: unknown[]; // Would need Job interface if available
  };
  totalFound: number;
  searchTime: number;
  suggestions?: string[];
  message: string;
}

// Generic Tool Execution Result for testHelpers
export interface ToolExecutionResult {
  success: boolean;
  data?: unknown;
  error?: string;
  executionTime?: number;
  message?: string;
}