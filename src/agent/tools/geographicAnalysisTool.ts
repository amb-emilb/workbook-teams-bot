import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { WorkbookClient, Resource, ToolParameters } from '../../services/index.js';



/**
 * Create geographic Analysis Tool for location-based filtering and insights
 * Factory function that accepts initialized WorkbookClient
 */
export function createGeographicAnalysisTool(workbookClient: WorkbookClient) {
  return createTool({
    id: 'geographic-analysis',
    description: `🗺️ LOCATION-BASED QUERIES - for geographic searches, filtering, and analysis.

  Use this tool for ALL location-based queries:
  ✅ "List companies in Copenhagen"
  ✅ "Find Danish clients" 
  ✅ "Show clients in Denmark"
  ✅ "Companies in Århus"
  ✅ "All resources in Copenhagen area"
  ✅ "Clients by city/country"
  
  Also for geographic analysis:
  ✅ "Analyze geographic distribution of our clients"
  ✅ "What locations have the highest resource concentration?"
  ✅ "Show geographic coverage gaps and opportunities"
  ✅ "Geographic clustering patterns and recommendations"
  
  Handles both simple location filtering AND complex geographic analysis.
  companySearchTool cannot filter by location - use this tool instead.
  
  IMPORTANT: Danish city data uses Danish names (e.g., "København" for Copenhagen, "Århus" for Aarhus).
  When searching for specific cities, use both English and Danish variations:
  - Copenhagen: also search for "København", "Kbh"
  - Aarhus: also search for "Århus"  
  - Other major Danish cities use local Danish spellings
  
  Provides comprehensive geographic intelligence for business optimization.`,
  
    inputSchema: z.object({
      analysisType: z.enum([
        'distribution', 
        'clustering', 
        'coverage', 
        'territory', 
        'travel-optimization',
        'regional-performance'
      ])
        .default('distribution')
        .describe('Type of geographic analysis to perform'),
    
      // Geographic scope
      countries: z.array(z.string())
        .optional()
        .describe('Limit analysis to specific countries'),
      cities: z.array(z.string())
        .optional()
        .describe('Limit analysis to specific cities. IMPORTANT: Include both English and Danish names (e.g., for Copenhagen use ["Copenhagen", "København", "Kbh"])'),
      regions: z.array(z.string())
        .optional()
        .describe('Custom regions to analyze'),
    
      // Resource filtering
      resourceTypes: z.array(z.number())
        .optional()
        .describe('Filter by resource types (2=Employee, 10=Contact)'),
      active: z.boolean()
        .default(true)
        .describe('Include only active resources'),
      includeEmployees: z.boolean()
        .default(true)
        .describe('Include employees in analysis'),
      includeContacts: z.boolean()
        .default(true)
        .describe('Include contacts in analysis'),
    
      // Analysis parameters
      clusterRadius: z.number()
        .min(1)
        .max(500)
        .default(50)
        .describe('Clustering radius in kilometers (for clustering analysis)'),
      minClusterSize: z.number()
        .min(2)
        .max(50)
        .default(5)
        .describe('Minimum size for location clusters'),
    
      // Output options
      includeMap: z.boolean()
        .default(false)
        .describe('Include ASCII map visualization (basic)'),
      includeRecommendations: z.boolean()
        .default(true)
        .describe('Include strategic recommendations'),
      detailLevel: z.enum(['summary', 'detailed', 'comprehensive'])
        .default('detailed')
        .describe('Level of detail in analysis output'),
    
      // Territory optimization
      territoryCount: z.number()
        .min(2)
        .max(20)
        .optional()
        .describe('Number of territories to suggest (for territory analysis)')
    }),
  
    outputSchema: z.object({
      success: z.boolean(),
      analysisType: z.string(),
      totalResources: z.number(),
      analysisDate: z.string(),
    
      // Geographic distribution
      locationDistribution: z.object({
        countries: z.array(z.object({
          name: z.string(),
          count: z.number(),
          percentage: z.number(),
          cities: z.array(z.object({
            name: z.string(),
            count: z.number()
          }))
        })),
        topCities: z.array(z.object({
          name: z.string(),
          country: z.string(),
          count: z.number(),
          percentage: z.number()
        }))
      }),
    
      // Clustering analysis
      clusters: z.array(z.object({
        id: z.string(),
        centerLocation: z.string(),
        size: z.number(),
        radius: z.number(),
        density: z.number(),
        members: z.array(z.object({
          id: z.number(),
          name: z.string(),
          location: z.string()
        }))
      })).optional(),
    
      // Coverage analysis
      coverage: z.object({
        coveredLocations: z.number(),
        uncoveredRegions: z.array(z.string()),
        coverageGaps: z.array(z.object({
          region: z.string(),
          importance: z.enum(['high', 'medium', 'low']),
          reason: z.string()
        })),
        recommendedExpansions: z.array(z.string())
      }).optional(),
    
      // Performance metrics
      metrics: z.object({
        averageDistance: z.number().optional(),
        travelOptimizationScore: z.number().optional(),
        regionalBalance: z.number(),
        concentrationIndex: z.number()
      }),
    
      // Recommendations
      recommendations: z.array(z.object({
        type: z.enum(['territory', 'travel', 'coverage', 'efficiency']),
        priority: z.enum(['high', 'medium', 'low']),
        title: z.string(),
        description: z.string(),
        impact: z.string()
      })).optional(),
    
      // Visualizations
      mapVisualization: z.string().optional(),
      insights: z.array(z.string()),
      executionTime: z.string()
    }),
  
    execute: async ({ context }) => {
      const startTime = Date.now();
      console.log('� Geographic Analysis Tool - Starting analysis...', context);
    
      try {
        // Context is already validated by the tool framework, no need for manual validation
        // Just use the context directly
      
        const {
          analysisType,
          countries,
          cities,
          resourceTypes,
          active,
          includeEmployees,
          includeContacts,
          clusterRadius,
          minClusterSize,
          includeMap,
          includeRecommendations,
          territoryCount
        } = context;

        // Build search parameters
        const searchParams: ToolParameters = {};
        if (resourceTypes) {searchParams.ResourceType = resourceTypes;}
        if (active !== undefined) {searchParams.Active = active;}

        // Get data from WorkbookClient
        console.log('� Fetching resources for geographic analysis...', searchParams);
        const response = await workbookClient.resources.search(searchParams);
      
        if (!response.success || !response.data) {
          throw new Error('Failed to fetch resource data');
        }

        let resources = response.data;
      
        // Filter by resource type preferences
        if (!includeEmployees) {
          resources = resources.filter(r => r.TypeId !== 2);
        }
        if (!includeContacts) {
          resources = resources.filter(r => r.TypeId !== 10);
        }
      
        // Filter by geographic scope using country codes
        if (countries && countries.length > 0) {
          resources = resources.filter(r => 
            r.Country && countries.some((country: string) => {
              // Map country names to codes for filtering
              const countryCode = getCountryCode(country);
              return countryCode ? r.Country === countryCode : 
                     r.Country!.toLowerCase().includes(country.toLowerCase());
            })
          );
        }
      
        if (cities && cities.length > 0) {
          // Automatically expand city names to include Danish variations
          const expandedCities = expandCityNames(cities);
          console.log(`City search expanded: ${cities.join(', ')} → ${expandedCities.join(', ')}`);
          
          resources = resources.filter(r => 
            r.City && expandedCities.some((city: string) => 
            r.City!.toLowerCase().includes(city.toLowerCase())
            )
          );
        }

        // Generate location distribution analysis
        const locationDistribution = generateLocationDistribution(resources);
      
        // Generate analysis based on type
        let clusters, coverage, recommendations;
        let metrics = {
          regionalBalance: 0,
          concentrationIndex: 0
        };
      
        switch (analysisType) {
        case 'clustering':
          clusters = generateClusterAnalysis(resources, clusterRadius, minClusterSize);
          break;
          
        case 'coverage':
          coverage = generateCoverageAnalysis(resources);
          break;
          
        case 'territory':
          coverage = generateTerritoryAnalysis(resources, territoryCount);
          break;
        }
      
        // Calculate performance metrics
        metrics = calculateGeographicMetrics(resources, locationDistribution);
      
        // Generate recommendations if requested
        if (includeRecommendations) {
          recommendations = generateRecommendations(
            analysisType, 
            resources, 
            locationDistribution, 
            clusters, 
            coverage, 
            metrics
          );
        }
      
        // Generate insights
        const insights = generateInsights(
          resources, 
          locationDistribution, 
          clusters, 
          coverage, 
          metrics
        );
      
        // Generate map visualization if requested
        let mapVisualization;
        if (includeMap) {
          mapVisualization = generateSimpleMapVisualization(locationDistribution);
        }

        const executionTime = `${Date.now() - startTime}ms`;
      
        console.log(`✅ Geographic analysis completed: ${resources.length} resources analyzed in ${executionTime}`);

        return {
          success: true,
          analysisType,
          totalResources: resources.length,
          analysisDate: new Date().toISOString(),
          locationDistribution,
          clusters,
          coverage,
          metrics,
          recommendations,
          mapVisualization,
          insights,
          executionTime
        };

      } catch (error) {
        console.error('❌ Geographic Analysis Tool error:', error);
        return {
          success: false,
          analysisType: context.analysisType,
          totalResources: 0,
          analysisDate: new Date().toISOString(),
          locationDistribution: {
            countries: [],
            topCities: []
          },
          metrics: {
            regionalBalance: 0,
            concentrationIndex: 0
          },
          insights: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`],
          executionTime: `${Date.now() - startTime}ms`
        };
      }
    }
  });
}

// Helper functions
function generateLocationDistribution(resources: Resource[]) {
  // Country distribution
  const countryMap = new Map<string, { count: number, cities: Map<string, number> }>();
  
  resources.forEach(resource => {
    const country = resource.Country || 'Unknown';
    const city = resource.City || 'Unknown';
    
    if (!countryMap.has(country)) {
      countryMap.set(country, { count: 0, cities: new Map() });
    }
    
    const countryData = countryMap.get(country)!;
    countryData.count++;
    countryData.cities.set(city, (countryData.cities.get(city) || 0) + 1);
  });
  
  // Convert to arrays and sort
  const countries = Array.from(countryMap.entries())
    .map(([name, data]) => ({
      name,
      count: data.count,
      percentage: (data.count / resources.length) * 100,
      cities: Array.from(data.cities.entries())
        .map(([cityName, count]) => ({ name: cityName, count }))
        .sort((a, b) => b.count - a.count)
    }))
    .sort((a, b) => b.count - a.count);
  
  // Top cities across all countries
  const cityMap = new Map<string, { country: string, count: number }>();
  resources.forEach(resource => {
    const city = resource.City || 'Unknown';
    const country = resource.Country || 'Unknown';
    const key = `${city}, ${country}`;
    
    cityMap.set(key, {
      country,
      count: (cityMap.get(key)?.count || 0) + 1
    });
  });
  
  const topCities = Array.from(cityMap.entries())
    .map(([location, data]) => ({
      name: location.split(', ')[0],
      country: data.country,
      count: data.count,
      percentage: (data.count / resources.length) * 100
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  return { countries, topCities };
}

function generateClusterAnalysis(resources: Resource[], radius: number, minSize: number) {
  // Simple clustering based on city/country combinations
  const locationGroups = new Map<string, Resource[]>();
  
  resources.forEach(resource => {
    const location = `${resource.City || 'Unknown'}, ${resource.Country || 'Unknown'}`;
    if (!locationGroups.has(location)) {
      locationGroups.set(location, []);
    }
    locationGroups.get(location)!.push(resource);
  });
  
  // Create clusters from location groups that meet minimum size
  const clusters = Array.from(locationGroups.entries())
    .filter(([, members]) => members.length >= minSize)
    .map(([location, members], index) => ({
      id: `cluster-${index + 1}`,
      centerLocation: location,
      size: members.length,
      radius,
      density: members.length / Math.PI / Math.pow(radius, 2),
      members: members.map(m => ({
        id: m.Id,
        name: m.Name || 'Unknown',
        location: `${m.City || 'Unknown'}, ${m.Country || 'Unknown'}`
      }))
    }))
    .sort((a, b) => b.size - a.size);
  
  return clusters;
}

function generateCoverageAnalysis(resources: Resource[]) {
  const coveredCountries = new Set(resources.filter(r => r.Country).map(r => r.Country));
  const coveredCities = new Set(resources.filter(r => r.City).map(r => r.City));
  
  // Identify potential gaps (simplified analysis)
  const majorCountries = ['Denmark', 'Norway', 'Sweden', 'Germany', 'United Kingdom'];
  const uncoveredRegions = majorCountries.filter(country => !coveredCountries.has(country));
  
  const coverageGaps = uncoveredRegions.map(region => ({
    region,
    importance: 'medium' as const,
    reason: 'Major market without representation'
  }));
  
  // Recommend expansions based on adjacent markets
  const recommendedExpansions = coverageGaps.slice(0, 3).map(gap => gap.region);
  
  return {
    coveredLocations: coveredCities.size,
    uncoveredRegions,
    coverageGaps,
    recommendedExpansions
  };
}

function generateTerritoryAnalysis(resources: Resource[], territoryCount?: number) {
  const targetTerritories = territoryCount || Math.min(5, Math.ceil(resources.length / 20));
  
  // Simple territory analysis based on resource distribution
  const locationCounts = new Map<string, number>();
  resources.forEach(resource => {
    const location = resource.Country || 'Unknown';
    locationCounts.set(location, (locationCounts.get(location) || 0) + 1);
  });
  
  const territories = Array.from(locationCounts.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, targetTerritories)
    .map(([region]) => region);
  
  return {
    coveredLocations: locationCounts.size,
    uncoveredRegions: [],
    coverageGaps: [],
    recommendedExpansions: territories.slice(0, 3)
  };
}

interface LocationDistribution {
  countries: Array<{ name: string; count: number; percentage: number; cities: Array<{ name: string; count: number }> }>;
  topCities: Array<{ name: string; country: string; count: number; percentage: number }>;
}

function calculateGeographicMetrics(resources: Resource[], distribution: LocationDistribution) {
  // Calculate concentration index (Herfindahl-Hirschman Index)
  const totalResources = resources.length;
  const concentrationIndex = distribution.countries
    .reduce((sum: number, country) => {
      const marketShare = country.count / totalResources;
      return sum + Math.pow(marketShare, 2);
    }, 0) * 10000; // Scale to 0-10000
  
  // Regional balance (measure of distribution evenness)
  const expectedShare = 1 / distribution.countries.length;
  const regionalBalance = 1 - distribution.countries
    .reduce((sum: number, country) => {
      const actualShare = country.count / totalResources;
      return sum + Math.pow(actualShare - expectedShare, 2);
    }, 0) / Math.pow(expectedShare, 2);
  
  return {
    regionalBalance: Math.max(0, Math.min(1, regionalBalance)),
    concentrationIndex: Math.round(concentrationIndex)
  };
}

interface ClusterInfo {
  id: string;
  centerLocation: string;
  size: number;
  radius: number;
  density: number;
  members: Array<{ id: number; name: string; location: string }>;
}

interface CoverageInfo {
  coveredLocations: number;
  uncoveredRegions: string[];
  coverageGaps: Array<{ region: string; importance: 'high' | 'medium' | 'low'; reason: string }>;
  recommendedExpansions: string[];
}

interface MetricsInfo {
  regionalBalance: number;
  concentrationIndex: number;
}

function generateRecommendations(
  analysisType: string,
  resources: Resource[],
  distribution: LocationDistribution,
  clusters?: ClusterInfo[],
  coverage?: CoverageInfo,
  metrics?: MetricsInfo
) {
  const recommendations = [];
  
  // Territory recommendations
  if (metrics?.concentrationIndex && metrics.concentrationIndex > 2500) {
    recommendations.push({
      type: 'territory' as const,
      priority: 'high' as const,
      title: 'Address Geographic Concentration',
      description: 'Resources are highly concentrated in few locations. Consider diversification.',
      impact: 'Improved risk distribution and market coverage'
    });
  }
  
  // Coverage recommendations
  if (coverage?.uncoveredRegions && coverage.uncoveredRegions.length > 0) {
    recommendations.push({
      type: 'coverage' as const,
      priority: 'medium' as const,
      title: 'Expand to Uncovered Markets',
      description: `Consider expansion to: ${coverage.uncoveredRegions.slice(0, 3).join(', ')}`,
      impact: 'Increased market reach and competitive positioning'
    });
  }
  
  // Clustering efficiency
  if (clusters && clusters.length > 0) {
    const largestCluster = clusters[0];
    if (largestCluster.size > resources.length * 0.3) {
      recommendations.push({
        type: 'efficiency' as const,
        priority: 'medium' as const,
        title: 'Optimize Large Cluster Operations',
        description: `${largestCluster.centerLocation} has ${largestCluster.size} resources. Consider operational optimization.`,
        impact: 'Improved operational efficiency and resource utilization'
      });
    }
  }
  
  // Travel optimization
  if (distribution.topCities.length > 5) {
    recommendations.push({
      type: 'travel' as const,
      priority: 'low' as const,
      title: 'Optimize Travel Routes',
      description: 'Multiple city presence allows for efficient travel planning and route optimization.',
      impact: 'Reduced travel costs and improved time efficiency'
    });
  }
  
  return recommendations;
}

function generateInsights(
  resources: Resource[],
  distribution: LocationDistribution,
  clusters?: ClusterInfo[],
  coverage?: CoverageInfo,
  metrics?: MetricsInfo
) {
  const insights = [];
  
  // Distribution insights
  const topCountry = distribution.countries[0];
  if (topCountry) {
    insights.push(
      `${topCountry.name} has the highest concentration with ${topCountry.count} resources (${topCountry.percentage.toFixed(1)}%)`
    );
  }
  
  const topCity = distribution.topCities[0];
  if (topCity) {
    insights.push(
      `${topCity.name} is the most represented city with ${topCity.count} resources`
    );
  }
  
  // Clustering insights
  if (clusters && clusters.length > 0) {
    insights.push(
      `Found ${clusters.length} significant location clusters with multiple resources`
    );
    
    const largestCluster = clusters[0];
    insights.push(
      `Largest cluster is in ${largestCluster.centerLocation} with ${largestCluster.size} resources`
    );
  }
  
  // Coverage insights
  if (coverage) {
    insights.push(
      `Geographic coverage spans ${coverage.coveredLocations} distinct locations`
    );
    
    if (coverage.uncoveredRegions.length > 0) {
      insights.push(
        `Potential expansion opportunities in ${coverage.uncoveredRegions.length} uncovered regions`
      );
    }
  }
  
  // Metrics insights
  if (metrics) {
    if (metrics.concentrationIndex > 2500) {
      insights.push('High geographic concentration detected - consider diversification');
    } else if (metrics.concentrationIndex < 1000) {
      insights.push('Well-distributed geographic presence across regions');
    }
    
    if (metrics.regionalBalance > 0.8) {
      insights.push('Excellent regional balance in resource distribution');
    } else if (metrics.regionalBalance < 0.5) {
      insights.push('Regional distribution imbalance detected');
    }
  }
  
  return insights;
}

function generateSimpleMapVisualization(distribution: LocationDistribution): string {
  let map = '📍 Geographic Distribution Map\n\n';
  
  // Simple text-based visualization
  const maxCount = Math.max(...distribution.countries.map((c) => c.count));
  
  distribution.countries.slice(0, 10).forEach((country) => {
    const barLength = Math.ceil((country.count / maxCount) * 20);
    const bar = '█'.repeat(barLength) + '░'.repeat(20 - barLength);
    
    map += `${country.name.padEnd(15)} ${bar} ${country.count} (${country.percentage.toFixed(1)}%)\n`;
  });
  
  map += '\n📊 Top Cities:\n';
  distribution.topCities.slice(0, 5).forEach((city, index: number) => {
    map += `${index + 1}. ${city.name}, ${city.country}: ${city.count} resources\n`;
  });
  
  return map;
}

/**
 * Map common country names to their ISO2 codes
 * Based on Workbook API's Country field format
 */
function getCountryCode(countryName: string): string | null {
  const countryMap: Record<string, string> = {
    // Nordic countries
    'denmark': 'DK',
    'danmark': 'DK',
    'danish': 'DK',
    'norway': 'NO',
    'norge': 'NO',
    'norwegian': 'NO',
    'sweden': 'SE', 
    'sverige': 'SE',
    'swedish': 'SE',
    'finland': 'FI',
    'suomi': 'FI',
    'finnish': 'FI',
    'iceland': 'IS',
    'ísland': 'IS',
    'icelandic': 'IS',
    
    // Major European countries
    'germany': 'DE',
    'deutschland': 'DE',
    'german': 'DE',
    'united kingdom': 'GB',
    'uk': 'GB',
    'britain': 'GB',
    'british': 'GB',
    'england': 'GB',
    'france': 'FR',
    'french': 'FR',
    'netherlands': 'NL',
    'holland': 'NL',
    'dutch': 'NL',
    'belgium': 'BE',
    'belgian': 'BE',
    'spain': 'ES',
    'spanish': 'ES',
    'italy': 'IT',
    'italian': 'IT',
    'austria': 'AT',
    'austrian': 'AT',
    'switzerland': 'CH',
    'swiss': 'CH',
    
    // Others
    'czech republic': 'CZ',
    'czech': 'CZ',
    'poland': 'PL',
    'polish': 'PL',
    'usa': 'US',
    'united states': 'US',
    'america': 'US',
    'american': 'US',
    'canada': 'CA',
    'canadian': 'CA'
  };
  
  const normalized = countryName.toLowerCase().trim();
  return countryMap[normalized] || null;
}

/**
 * Automatically expand city names to include Danish/English variations
 * This ensures consistent results regardless of which language the user uses
 */
function expandCityNames(cities: string[]): string[] {
  const expandedCities = [...cities]; // Start with original cities
  
  cities.forEach(city => {
    const normalized = city.toLowerCase().trim();
    
    // Copenhagen variations
    if (normalized === 'copenhagen') {
      expandedCities.push('københavn', 'kbh', 'københavn k', 'københavn s', 'københavn n', 'københavn ø', 'københavn v');
    } else if (normalized === 'københavn' || normalized === 'kbh') {
      expandedCities.push('copenhagen', 'københavn k', 'københavn s', 'københavn n', 'københavn ø', 'københavn v');
    }
    
    // Aarhus variations  
    else if (normalized === 'aarhus') {
      expandedCities.push('århus');
    } else if (normalized === 'århus') {
      expandedCities.push('aarhus');
    }
    
    // Aalborg variations
    else if (normalized === 'aalborg') {
      expandedCities.push('ålborg');
    } else if (normalized === 'ålborg') {
      expandedCities.push('aalborg');
    }
    
    // Other common variations can be added here as needed
  });
  
  // Remove duplicates and return
  return [...new Set(expandedCities)];
}