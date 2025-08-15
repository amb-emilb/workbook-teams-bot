import { WorkbookClient } from '../../services/workbookClient.js';

/**
 * Initialize all tools with Key Vault configuration
 * This replaces the synchronous module-level initialization pattern
 */

let toolsInitialized = false;
let workbookClient: WorkbookClient;
let allTools: Record<string, any> = {};

/**
 * Initialize WorkbookClient and all tools with Key Vault
 */
async function initializeTools() {
  if (toolsInitialized) {
    return allTools;
  }

  console.log('🔧 Initializing all tools with Key Vault...');
  
  // Initialize WorkbookClient from Key Vault
  workbookClient = await WorkbookClient.fromKeyVault();
  
  // Import and initialize all tools
  const [
    { createSearchContactsTool, createGetContactStatsTool },
    { createHierarchicalSearchTool },
    { createCompanySearchTool },
    { createAdvancedFilterTool },
    { createDataQualityTool },
    { createUniversalSearchTool },
    { createPortfolioAnalysisTool },
    { createBulkOperationsTool },
    { createRelationshipMappingTool },
    { createEnhancedExportTool },
    { createGeographicAnalysisTool },
    { createPerformanceMonitoringTool }
  ] = await Promise.all([
    import('./searchTool.js'),
    import('./hierarchicalSearchTool.js'),
    import('./companySearchTool.js'),
    import('./advancedFilterTool.js'),
    import('./dataQualityTool.js'),
    import('./universalSearchTool.js'),
    import('./portfolioAnalysisTool.js'),
    import('./bulkOperationsTool.js'),
    import('./relationshipMappingTool.js'),
    import('./enhancedExportTool.js'),
    import('./geographicAnalysisTool.js'),
    import('./performanceMonitoringTool.js')
  ]);

  // Initialize all tools with the shared WorkbookClient
  allTools = {
    // Core search tools
    universalSearchTool: createUniversalSearchTool(workbookClient),
    searchContactsTool: createSearchContactsTool(workbookClient),
    companySearchTool: createCompanySearchTool(workbookClient),
    hierarchicalSearchTool: createHierarchicalSearchTool(workbookClient),
    
    // Advanced tools
    advancedFilterTool: createAdvancedFilterTool(workbookClient),
    dataQualityTool: createDataQualityTool(workbookClient),
    portfolioAnalysisTool: createPortfolioAnalysisTool(workbookClient),
    relationshipMappingTool: createRelationshipMappingTool(workbookClient),
    bulkOperationsTool: createBulkOperationsTool(workbookClient),
    
    // Enhanced tools
    enhancedExportTool: createEnhancedExportTool(workbookClient),
    geographicAnalysisTool: createGeographicAnalysisTool(workbookClient),
    performanceMonitoringTool: createPerformanceMonitoringTool(workbookClient),
    
    // Statistics
    getContactStatsTool: createGetContactStatsTool(workbookClient)
  };

  toolsInitialized = true;
  console.log('✅ All tools initialized with Key Vault configuration');
  
  return allTools;
}

/**
 * Get all initialized tools
 */
export async function getAllTools() {
  return await initializeTools();
}

/**
 * Get the shared WorkbookClient instance
 */
export function getWorkbookClient() {
  if (!workbookClient) {
    throw new Error('Tools not initialized. Call getAllTools() first.');
  }
  return workbookClient;
}