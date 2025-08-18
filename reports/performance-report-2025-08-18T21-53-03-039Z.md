# Performance Monitoring Report
Generated: 8/18/2025, 11:53:03 PM

## System Health Overview
- Status: WARNING
- Uptime: 3m 9s
- Memory Usage: 56.31 MB

## API Performance
- Recent Calls: 0
- Average Response Time: 0ms
- Cache Hit Ratio: 0.0%
- Error Rate: 0.0%

## Active Alerts (1)
1. **MEDIUM**: Cache hit ratio is below optimal level
   - Metric: cacheHitRatio
   - Current: 0, Threshold: 0.7

## Optimization Recommendations
### 1. Improve Cache Hit Ratio (MEDIUM)
- **Category**: cache
- **Description**: Current cache hit ratio is suboptimal. Consider extending cache TTL for stable data.
- **Expected Impact**: 20-30% reduction in API calls
- **Implementation**: Adjust cache TTL settings in cache.ts configuration

## Key Insights
1. Cache performance needs attention - hit ratio below 70%
2. API response times are excellent (< 1s average)
