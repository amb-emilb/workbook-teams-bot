import { BaseService } from '../base/baseService.js';
import { cacheManager } from '../base/cache.js';
import { 
  Resource,
  Contact,
  HierarchicalResource, 
  ServiceResponse, 
  WorkbookConfig 
} from '../../types/workbook.types.js';
import { ResourceTypes } from '../../constants/resourceTypes.js';

/**
 * ResourceService - Manages all people data (employees, clients, contacts)
 * Note: In Workbook, "Resources" contain all the people information we need
 */
export class ResourceService extends BaseService {
  constructor(config: WorkbookConfig) {
    super(config);
  }

  /**
   * Search resources with optional parameters and caching
   * Uses two-step pattern: ResourcesRequest (filter) + ResourceRequest[] (complete data)
   */
  async search(params?: Record<string, unknown>): Promise<ServiceResponse<Resource[]>> {
    const cacheKey = this.generateCacheKey('resources:search', params);
    
    // Check cache first
    const cached = cacheManager.get<Resource[]>(cacheKey);
    if (cached) {
      this.logApiCall('ResourcesRequest', 'GET', true);
      return {
        success: true,
        data: cached,
        cached: true
      };
    }

    // If no search parameters, fall back to complete dataset
    if (!params || Object.keys(params).length === 0) {
      return this.getAllResourcesComplete();
    }

    // Step 1: Get filtered resource IDs using ResourcesRequest
    this.logApiCall('ResourcesRequest', 'GET');
    const idsResponse = await this.get<Resource[]>('ResourcesRequest', params);
    
    if (!idsResponse.success || !idsResponse.data) {
      return {
        success: false,
        error: idsResponse.error || 'Failed to get filtered resource IDs'
      };
    }

    // Extract IDs from the filtered results
    const filteredIds = idsResponse.data.map(resource => resource.Id);
    
    if (filteredIds.length === 0) {
      return {
        success: true,
        data: [],
        cached: false
      };
    }

    // Step 2: Get complete resource data using ResourceRequest[] bulk operation
    this.logApiCall('ResourceRequest[]', 'GET');
    const completeDataResponse = await this.getBulkByIds(filteredIds);
    
    // Cache successful responses
    if (completeDataResponse.success && completeDataResponse.data) {
      cacheManager.setResources(cacheKey, completeDataResponse.data);
    }
    
    return completeDataResponse;
  }

  /**
   * Get all resources (alias for search with no params)
   * Falls back to getAllResourcesComplete() to get all resource types
   */
  async getAll(): Promise<ServiceResponse<Resource[]>> {
    return this.search();
  }

  /**
   * Get multiple resources by IDs using ResourceRequest[] bulk operation
   */
  async getBulkByIds(ids: number[]): Promise<ServiceResponse<Resource[]>> {
    const idObjects = ids.map(id => ({ Id: id }));
    return this.getBatch<Resource>('ResourceRequest', idObjects);
  }

  /**
   * Get all available resource IDs from ResourceIdsRequest
   * @param includeInactive - Whether to include inactive resources (default: true for complete dataset)
   */
  async getAllResourceIds(includeInactive: boolean = true): Promise<ServiceResponse<number[]>> {
    const cacheKey = includeInactive ? 'resource:ids:all' : 'resource:ids:active';
    
    // Check cache first
    const cached = cacheManager.get<number[]>(cacheKey);
    if (cached) {
      return {
        success: true,
        data: cached,
        cached: true
      };
    }

    // Use the correct payload structure from browser network tab
    // Set HideInactive and Active based on includeInactive parameter
    const payload = {
      Filter: '',
      IsUnion: 'true',
      ExternalKeys: '',
      HideInactive: !includeInactive, // false = include inactive, true = hide inactive
      InternalCustomers: false,
      Active: includeInactive ? null : true, // null = all, true = active only
      CustomerResponsibleResourceId: null,
      DefaultAddContacts: false,
      Favorite: null,
      HideInternalCustomers: false,
      MyClients: null,
      ResourceType: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      ResponsibleResourceId: null,
      Union: 'true'
    };

    this.logApiCall('ResourceIdsRequest', 'POST');
    const response = await this.post<number[]>('ResourceIdsRequest', payload);
    
    // Cache successful responses for 5 minutes
    if (response.success && response.data) {
      cacheManager.set(cacheKey, response.data, 300);
    }
    
    return response;
  }

  /**
   * Get all resources using ResourceIdsRequest + ResourceRequest[] bulk pattern
   * This gets the complete dataset including all clients, employees, etc.
   */
  async getAllResourcesComplete(): Promise<ServiceResponse<Resource[]>> {
    const cacheKey = 'resources:complete:all';
    
    // Check cache first
    const cached = cacheManager.get<Resource[]>(cacheKey);
    if (cached) {
      return {
        success: true,
        data: cached,
        cached: true
      };
    }

    // Get all available resource IDs
    const idsResponse = await this.getAllResourceIds();
    if (!idsResponse.success || !idsResponse.data) {
      console.log('[RESOURCE DEBUG] getAllResourceIds failed:', idsResponse.error);
      return {
        success: false,
        error: idsResponse.error || 'Failed to get resource IDs'
      };
    }

    console.log(`[RESOURCE DEBUG] Retrieved ${idsResponse.data.length} resource IDs`);

    // Batch fetch all resources by ID
    const resourcesResponse = await this.getBulkByIds(idsResponse.data);
    
    if (!resourcesResponse.success) {
      console.log('[RESOURCE DEBUG] getBulkByIds failed:', resourcesResponse.error);
      return resourcesResponse;
    }
    
    console.log(`[RESOURCE DEBUG] Successfully retrieved ${resourcesResponse.data?.length || 0} complete resources`);
    
    // Cache successful responses for 5 minutes
    if (resourcesResponse.success && resourcesResponse.data) {
      cacheManager.set(cacheKey, resourcesResponse.data, 300);
    }
    
    return resourcesResponse;
  }

  /**
   * Find companies by scanning known company IDs
   * This is a fallback when ResourcesRequest has permission issues
   */
  private async findCompaniesFallback(): Promise<ServiceResponse<Resource[]>> {
    const companies: Resource[] = [];
    
    // Test a range of resource IDs to find companies
    const testIds = [3811];
    
    for (const id of testIds) {
      const response = await this.getById(id);
      if (response.success && response.data && (
        response.data.TypeId === ResourceTypes.COMPANY || 
        response.data.TypeId === ResourceTypes.CLIENT || 
        response.data.TypeId === ResourceTypes.PROSPECT
      )) {
        companies.push(response.data);
      }
    }
    
    return {
      success: true,
      data: companies,
      cached: false
    };
  }

  /**
   * Get a single resource by ID with caching
   */
  async getById(id: number): Promise<ServiceResponse<Resource>> {
    const cacheKey = this.generateCacheKey('resource:single', { Id: id });
    
    // Check cache first
    const cached = cacheManager.get<Resource>(cacheKey);
    if (cached) {
      this.logApiCall('ResourceRequest', 'GET', true);
      return {
        success: true,
        data: cached,
        cached: true
      };
    }

    // Make API call using batch operation (ResourceRequest[] pattern)
    this.logApiCall('ResourceRequest[]', 'GET');
    const response = await this.getBatchById<Resource>('ResourceRequest', id);
    
    // Cache successful responses
    if (response.success && response.data) {
      cacheManager.setResources(cacheKey, response.data);
    }
    
    return response;
  }

  /**
   * Search resources by email domain
   */
  async searchByEmailDomain(domain: string): Promise<ServiceResponse<Resource[]>> {
    const allResourcesResponse = await this.getAll();
    
    if (!allResourcesResponse.success || !allResourcesResponse.data) {
      return allResourcesResponse;
    }

    // Filter resources by email domain
    const filtered = allResourcesResponse.data.filter(resource => 
      resource.Email && resource.Email.toLowerCase().includes(domain.toLowerCase())
    );

    return {
      success: true,
      data: filtered,
      cached: allResourcesResponse.cached
    };
  }

  /**
   * Search resources by company/folder name
   */
  async searchByCompany(companyName: string): Promise<ServiceResponse<Resource[]>> {
    const allResourcesResponse = await this.getAll();
    
    if (!allResourcesResponse.success || !allResourcesResponse.data) {
      return allResourcesResponse;
    }

    // Filter resources by ResourceFolder (company) name
    const filtered = allResourcesResponse.data.filter(resource => 
      resource.ResourceFolder && resource.ResourceFolder.toLowerCase().includes(companyName.toLowerCase())
    );

    return {
      success: true,
      data: filtered,
      cached: allResourcesResponse.cached
    };
  }

  /**
   * Search resources by name or initials
   */
  async searchByName(query: string): Promise<ServiceResponse<Resource[]>> {
    const allResourcesResponse = await this.getAll();
    
    if (!allResourcesResponse.success || !allResourcesResponse.data) {
      return allResourcesResponse;
    }

    const lowerQuery = query.toLowerCase();
    
    // Filter resources by name, initials, or email
    const filtered = allResourcesResponse.data.filter(resource => 
      resource.Name.toLowerCase().includes(lowerQuery) ||
      resource.Initials.toLowerCase().includes(lowerQuery) ||
      (resource.Email && resource.Email.toLowerCase().includes(lowerQuery))
    );

    return {
      success: true,
      data: filtered,
      cached: allResourcesResponse.cached
    };
  }

  /**
   * Get active resources only
   */
  async getActive(): Promise<ServiceResponse<Resource[]>> {
    const allResourcesResponse = await this.getAll();
    
    if (!allResourcesResponse.success || !allResourcesResponse.data) {
      return allResourcesResponse;
    }

    // Filter active resources
    const active = allResourcesResponse.data.filter(resource => resource.Active);

    return {
      success: true,
      data: active,
      cached: allResourcesResponse.cached
    };
  }

  /**
   * Get resources by type
   */
  async getByType(typeId: number): Promise<ServiceResponse<Resource[]>> {
    const allResourcesResponse = await this.getAll();
    
    if (!allResourcesResponse.success || !allResourcesResponse.data) {
      return allResourcesResponse;
    }

    // Filter resources by TypeId
    const filtered = allResourcesResponse.data.filter(resource => 
      resource.TypeId === typeId
    );

    return {
      success: true,
      data: filtered,
      cached: allResourcesResponse.cached
    };
  }

  /**
   * Find company resource by name (TypeId 1, 3, or 6 only) - returns first match
   * This allows agents to use natural language like "ADECCO" instead of ID 3811
   */
  async findCompanyByName(companyName: string): Promise<ServiceResponse<Resource | null>> {
    // Get complete resource dataset using ResourceIdsRequest + ResourceRequest[]
    const allResourcesResponse = await this.getAllResourcesComplete();
    
    if (!allResourcesResponse.success || !allResourcesResponse.data) {
      return {
        success: false,
        error: allResourcesResponse.error || 'Failed to fetch complete resource dataset'
      };
    }

    const lowerQuery = companyName.toLowerCase();
    
    // Search only company resources (TypeId 1=Company, 3=Client, 6=Prospect) by Name or ResourceFolder
    // Exclude TypeId 2 (Employees) which are NOT companies
    const company = allResourcesResponse.data.find(resource => 
      (resource.TypeId === ResourceTypes.COMPANY || 
       resource.TypeId === ResourceTypes.CLIENT || 
       resource.TypeId === ResourceTypes.PROSPECT) &&
      (resource.Name.toLowerCase().includes(lowerQuery) || 
       (resource.ResourceFolder && resource.ResourceFolder.toLowerCase().includes(lowerQuery)))
    );

    return {
      success: true,
      data: company || null,
      cached: allResourcesResponse.cached
    };
  }

  /**
   * Find multiple companies by name pattern (TypeId 1, 3, or 6 only) - returns all matches
   * Use this for queries like "companies containing ACME" or partial name searches
   */
  async findCompaniesByName(namePattern: string): Promise<ServiceResponse<Resource[]>> {
    // Get complete resource dataset using ResourceIdsRequest + ResourceRequest[]
    const allResourcesResponse = await this.getAllResourcesComplete();
    
    if (!allResourcesResponse.success || !allResourcesResponse.data) {
      return {
        success: false,
        error: allResourcesResponse.error || 'Failed to fetch complete resource dataset'
      };
    }

    const lowerQuery = namePattern.toLowerCase();
    
    // Search only company resources (TypeId 1=Company, 3=Client, 6=Prospect) by Name or ResourceFolder - return ALL matches
    // Exclude TypeId 2 (Employees) which are NOT companies
    const companies = allResourcesResponse.data.filter(resource => 
      (resource.TypeId === ResourceTypes.COMPANY || 
       resource.TypeId === ResourceTypes.CLIENT || 
       resource.TypeId === ResourceTypes.PROSPECT) &&
      (resource.Name.toLowerCase().includes(lowerQuery) || 
       (resource.ResourceFolder && resource.ResourceFolder.toLowerCase().includes(lowerQuery)))
    );

    return {
      success: true,
      data: companies,
      cached: allResourcesResponse.cached
    };
  }

  /**
   * Find companies that start with a specific prefix (TypeId 1, 3, or 6 only)
   * Use this for queries like "companies starting with A"
   */
  async findCompaniesStartingWith(prefix: string): Promise<ServiceResponse<Resource[]>> {
    // Get complete resource dataset using ResourceIdsRequest + ResourceRequest[]
    const allResourcesResponse = await this.getAllResourcesComplete();
    
    if (!allResourcesResponse.success || !allResourcesResponse.data) {
      return {
        success: false,
        error: allResourcesResponse.error || 'Failed to fetch complete resource dataset'
      };
    }

    const lowerPrefix = prefix.toLowerCase();
    
    // Search only company resources (TypeId 1=Company, 3=Client, 6=Prospect) that START with the prefix
    // Exclude TypeId 2 (Employees) which are NOT companies
    const companies = allResourcesResponse.data.filter(resource => 
      (resource.TypeId === ResourceTypes.COMPANY || 
       resource.TypeId === ResourceTypes.CLIENT || 
       resource.TypeId === ResourceTypes.PROSPECT) &&
      resource.Name.toLowerCase().startsWith(lowerPrefix)
    );

    return {
      success: true,
      data: companies,
      cached: allResourcesResponse.cached
    };
  }

  /**
   * Get hierarchical structure by company name (natural language input)
   * This allows agents to use "ADECCO" instead of ID 3811
   */
  async getHierarchicalStructureByName(companyName: string): Promise<ServiceResponse<HierarchicalResource | null>> {
    // First find the company by name
    const companyResponse = await this.findCompanyByName(companyName);
    
    if (!companyResponse.success) {
      return {
        success: false,
        error: companyResponse.error || 'Failed to find company'
      };
    }

    if (!companyResponse.data) {
      return {
        success: true,
        data: null,
        cached: false
      };
    }

    // Get hierarchical structure for the found company
    const hierarchyResponse = await this.getHierarchicalStructure(companyResponse.data.Id);
    
    if (!hierarchyResponse.success || !hierarchyResponse.data) {
      return {
        success: false,
        error: hierarchyResponse.error || 'Failed to build hierarchy'
      };
    }

    // Return the first (and should be only) hierarchical structure
    return {
      success: true,
      data: hierarchyResponse.data[0] || null,
      cached: false
    };
  }

  /**
   * Update a resource using the PATCH-via-POST pattern
   */
  async update(id: string, updates: Partial<Resource>): Promise<ServiceResponse<unknown>> {
    this.logApiCall('ResourcePatchRequest', 'PATCH');
    
    // Build patch data
    const patchData: Record<string, unknown> = { Id: id };
    
    // Convert boolean fields to strings (Workbook API requirement)
    if (updates.Active !== undefined) {
      patchData.Active = updates.Active.toString();
    }
    
    // Add other fields as strings
    if (updates.Name !== undefined) {
      patchData.Name = updates.Name;
    }
    if (updates.Email !== undefined) {
      patchData.Email = updates.Email;
    }
    if (updates.Initials !== undefined) {
      patchData.Initials = updates.Initials;
    }
    if (updates.Phone1 !== undefined) {
      patchData.Phone1 = updates.Phone1;
    }
    if (updates.ResponsibleResourceId !== undefined) {
      patchData.ResponsibleResourceId = updates.ResponsibleResourceId.toString();
    }

    const response = await this.patch('ResourcePatchRequest', patchData);
    
    // Clear relevant cache entries on successful update
    if (response.success) {
      this.clearCacheForResource(parseInt(id));
    }
    
    return response;
  }

  /**
   * Mark a resource as inactive
   */
  async markInactive(id: string): Promise<ServiceResponse<unknown>> {
    return this.update(id, { Active: false });
  }

  /**
   * Mark a resource as active
   */
  async markActive(id: string): Promise<ServiceResponse<unknown>> {
    return this.update(id, { Active: true });
  }

  /**
   * Get resource statistics (people stats)
   */
  async getStats(): Promise<ServiceResponse<{ 
    total: number; 
    active: number; 
    inactive: number;
    withEmail: number;
    withCompany: number;
    byResourceType: Record<number, number>;
    inactiveByResourceType: Record<number, number>;
    departments: string[];
  }>> {
    const cacheKey = 'resources:stats';
    
    // Check cache first
    const cached = cacheManager.get<{ 
      total: number; 
      active: number; 
      inactive: number;
      withEmail: number;
      withCompany: number;
      byResourceType: Record<number, number>;
      inactiveByResourceType: Record<number, number>;
      departments: string[];
    }>(cacheKey);
    if (cached) {
      return {
        success: true,
        data: cached,
        cached: true
      };
    }

    // Use getAllResourcesComplete to ensure we get all resource types
    const allResourcesResponse = await this.getAllResourcesComplete();
    
    if (!allResourcesResponse.success || !allResourcesResponse.data) {
      console.log('[STATS DEBUG] getAllResourcesComplete failed:', allResourcesResponse.error);
      return {
        success: false,
        error: `Failed to fetch resources for statistics: ${allResourcesResponse.error}`
      };
    }

    const resources = allResourcesResponse.data;
    console.log(`[STATS DEBUG] Retrieved ${resources.length} total resources`);
    
    // Calculate stats
    const byResourceType: Record<number, number> = {};
    const inactiveByResourceType: Record<number, number> = {};
    const departments: Set<string> = new Set();
    
    resources.forEach(resource => {
      const typeId = resource.TypeId || 0;
      
      // Count active resources by type
      if (resource.Active) {
        byResourceType[typeId] = (byResourceType[typeId] || 0) + 1;
      } else {
        // Count inactive resources by type
        inactiveByResourceType[typeId] = (inactiveByResourceType[typeId] || 0) + 1;
      }
      
      // Collect unique departments/folders
      if (resource.ResourceFolder) {
        departments.add(resource.ResourceFolder);
      }
    });
    
    console.log('[STATS DEBUG] Active resource breakdown by TypeId:', byResourceType);
    console.log('[STATS DEBUG] Inactive resource breakdown by TypeId:', inactiveByResourceType);
    
    const stats = {
      total: resources.length,
      active: resources.filter(r => r.Active).length,
      inactive: resources.filter(r => !r.Active).length,
      withEmail: resources.filter(r => r.Email && r.Email.trim() !== '').length,
      withCompany: resources.filter(r => r.ResourceFolder && r.ResourceFolder.trim() !== '').length,
      byResourceType,
      inactiveByResourceType,
      departments: Array.from(departments).sort()
    };

    // Cache stats for shorter time (1 minute since it's derived data)
    cacheManager.set(cacheKey, stats, 60);

    return {
      success: true,
      data: stats,
      cached: false
    };
  }

  /**
   * Clear cache for a specific resource
   */
  private clearCacheForResource(resourceId: number): void {
    cacheManager.del(`resource:single:${Buffer.from(JSON.stringify({Id: resourceId})).toString('base64')}`);
    cacheManager.del(`contacts:forResource:${Buffer.from(JSON.stringify({ResourceId: resourceId})).toString('base64')}`);
    cacheManager.del('resources:all');
    cacheManager.del('resources:stats');
    cacheManager.delStartWith('resources:search');
  }

  /**
   * Get contacts for a specific resource/company
   * Uses ContactsForResourceRequest endpoint
   */
  async getContactsForResource(resourceId: number, active?: boolean): Promise<ServiceResponse<Contact[]>> {
    const cacheKey = this.generateCacheKey('contacts:forResource', { ResourceId: resourceId, Active: active });
    
    // Check cache first
    const cached = cacheManager.get<Contact[]>(cacheKey);
    if (cached) {
      this.logApiCall('ContactsForResourceRequest', 'GET', true);
      return {
        success: true,
        data: cached,
        cached: true
      };
    }

    // Make API call using pure GET with query parameters
    this.logApiCall('ContactsForResourceRequest', 'GET');
    const queryParams: Record<string, string | number | boolean> = { ResourceId: resourceId };
    if (active !== undefined) {
      queryParams.Active = active;
    }
    const response = await this.pureGet<Contact[]>('ContactsForResourceRequest', queryParams);
    
    // Cache successful responses
    if (response.success && response.data) {
      cacheManager.set(cacheKey, response.data, 300); // 5 minutes
    }
    
    return response;
  }

  /**
   * Get a single contact by ID
   * Uses ContactRequest endpoint
   */
  async getContact(contactId: number): Promise<ServiceResponse<Contact>> {
    const cacheKey = this.generateCacheKey('contact:single', { Id: contactId });
    
    // Check cache first
    const cached = cacheManager.get<Contact>(cacheKey);
    if (cached) {
      this.logApiCall('ContactRequest', 'GET', true);
      return {
        success: true,
        data: cached,
        cached: true
      };
    }

    // Make API call
    this.logApiCall('ContactRequest', 'GET');
    const response = await this.get<Contact>('ContactRequest', { Id: contactId });
    
    // Cache successful responses
    if (response.success && response.data) {
      cacheManager.set(cacheKey, response.data, 300); // 5 minutes
    }
    
    return response;
  }

  /**
   * Get hierarchical structure of resources with their contacts
   * Combines ResourcesRequest with ContactsForResourceRequest to build relationships
   */
  async getHierarchicalStructure(resourceId?: number): Promise<ServiceResponse<HierarchicalResource[]>> {
    try {
      // Get resources (either specific one or all)
      let resources: Resource[];
      
      if (resourceId) {
        const resourceResponse = await this.getById(resourceId);
        if (!resourceResponse.success || !resourceResponse.data) {
          return {
            success: false,
            error: resourceResponse.error || 'Failed to fetch resource'
          };
        }
        resources = [resourceResponse.data];
      } else {
        const resourcesResponse = await this.getAll();
        if (!resourcesResponse.success || !resourcesResponse.data) {
          return {
            success: false,
            error: resourcesResponse.error || 'Failed to fetch resources'
          };
        }
        resources = resourcesResponse.data;
      }

      // Build hierarchical structure
      const hierarchicalResources: HierarchicalResource[] = [];
      
      // Group resources by type (based on user-insights.md)
      const companies = resources.filter(r => r.TypeId === 1 || r.TypeId === 3 || r.TypeId === 6); // All company types: Company, Clients, Prospects
      // const _employees = resources.filter(r => r.TypeId === 2);  // Internal employees - TODO: Use for employee hierarchy
      
      // Process each company
      for (const company of companies) {
        // Get contacts for this company
        const contactsResponse = await this.getContactsForResource(company.Id);
        const contacts = contactsResponse.success ? (contactsResponse.data || []) : [];
        
        // Get responsible employee by ID if it exists
        let responsibleEmployee: Resource | undefined;
        if (company.ResponsibleResourceId) {
          const employeeResponse = await this.getById(company.ResponsibleResourceId);
          responsibleEmployee = employeeResponse.success ? employeeResponse.data : undefined;
        }
        
        // Build hierarchical structure
        const hierarchical: HierarchicalResource = {
          resource: company,
          contacts: contacts,
          responsibleEmployee: responsibleEmployee,
          subResources: [] // Could be populated if there are sub-companies
        };
        
        hierarchicalResources.push(hierarchical);
      }
      
      return {
        success: true,
        data: hierarchicalResources,
        cached: false // This is computed data, not directly cached
      };
      
    } catch (error) {
      console.error('❌ Error building hierarchical structure:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to build hierarchical structure'
      };
    }
  }

  /**
   * Clear all resource cache
   */
  clearCache(): void {
    cacheManager.delStartWith('resource');
    cacheManager.delStartWith('contact');
    console.log('Resource and contact cache cleared');
  }
}