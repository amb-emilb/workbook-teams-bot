# Workbook Teams Agent - Project Overview & Best Practices

## 📋 Project Summary

The **Workbook Teams Agent** is a Microsoft Teams AI bot that provides natural language access to a Workbook CRM system. It enables users to search for companies, contacts, export data, and perform various CRM operations through conversational AI.

### Key Components
- **Teams Bot**: Microsoft Teams AI SDK integration
- **AI Agent**: Mastra AI framework with multiple specialized tools
- **Workbook API**: Integration with workbook.net CRM system
- **Azure Deployment**: App Service with Application Insights monitoring

## 🔧 Architecture & Technologies

### Core Framework Stack
- **Frontend**: Microsoft Teams Bot Framework
- **AI Framework**: Mastra AI with tool-based architecture
- **Runtime**: Node.js with TypeScript
- **Database**: LibSQL (SQLite-based) for local dev, production PostgresQL
- **API Integration**: RESTful Workbook API
- **Deployment**: Azure App Service
- **Monitoring**: Azure Application Insights

### AI Tool Ecosystem
The agent uses 12+ specialized tools for different CRM operations:
- `companySearchTool` - Company/client searches and hierarchical data
- `searchContactsTool` - Contact person searches
- `enhancedExportTool` - Data export functionality
- `portfolioAnalysisTool` - Client portfolio analysis
- `geographicAnalysisTool` - Location-based queries
- `dataQualityTool` - Data validation and cleanup
- And more specialized tools for specific use cases

## 🧪 Testing & Development

### Test Framework
```bash
# Run full comprehensive test suite (61 scenarios)
npm run test:agent

# Run specific category tests
npm run test:agent -- --category "Export"
npm run test:agent -- --category "Geographic"
npm run test:agent -- --category "Hierarchical Search"

# Run specific test scenarios
npm run test:agent -- --name "Danish"
npm run test:agent -- --testNamePattern "Copenhagen"
```

### Available Development Commands
```bash
# Development servers
npm run teams:dev        # Start Teams bot in watch mode
npm run dev             # Start general development server

# Production build & deployment
npm run build           # TypeScript compilation
npm run start          # Production server
npm run teams          # Production Teams bot

# Code quality
npm run typecheck       # TypeScript validation
npm run lint           # ESLint analysis
npm run lint:fix       # Auto-fix lint issues
```

### Test Categories & Coverage
- **Export Tests** (6 scenarios): Data export validation, file formats, relational data
- **Geographic Tests** (2 scenarios): Location-based searches, country/city filtering
- **Hierarchical Search** (4 scenarios): Company hierarchy, bulk operations, organizational mapping
- **Statistics Tests** (5 scenarios): Portfolio analysis, data quality metrics
- **Contact Tests** (9 scenarios): Contact person searches, relationship mapping
- **Company Search** (16 scenarios): Various company search patterns and filters

## 🏗️ Development Best Practices

### Code Standards
- **TypeScript**: Strict type checking enabled
- **No Emojis in Code**: Critical for Azure App Service compatibility
- **Tool-First Architecture**: Each major feature should be a separate tool
- **Comprehensive Testing**: All tools must have test coverage
- **Error Handling**: Graceful degradation and informative error messages

### Tool Development Guidelines
1. **Single Responsibility**: Each tool handles one domain (companies, contacts, exports, etc.)
2. **Clear Descriptions**: Tool descriptions guide AI agent selection
3. **Input Validation**: Use Zod schemas for type-safe inputs
4. **Output Schemas**: Define clear output structures
5. **Error Handling**: Return meaningful error messages, not exceptions
6. **Caching**: Implement appropriate caching for performance

### Testing Requirements
- **New Tools**: Must have comprehensive test scenarios
- **Tool Changes**: Must pass existing tests + new validation
- **Integration**: Cross-tool interaction testing for complex queries
- **Performance**: Bulk operations must respect Teams message limits

## 🚀 Deployment & Infrastructure

### Azure Configuration
```bash
# Application Insights ID for monitoring
Application insights ID: 9eef816b-37f1-4fad-b744-02f16fb5e82e

# Useful Azure CLI commands for monitoring
az webapp show --name <app-name> --resource-group <rg-name>
az webapp deployment list --name <app-name> --resource-group <rg-name>
az webapp config appsettings list --name <app-name> --resource-group <rg-name>

# Application Insights queries (via Azure Portal)
# - Performance monitoring: requests, dependencies, exceptions
# - Custom telemetry: tool usage, API calls, user interactions
```

### Environment Variables Required
- `OPENAI_API_KEY`: OpenAI API access
- `WORKBOOK_API_KEY_DEV`: Development Workbook API key
- `WORKBOOK_PASSWORD_DEV`: Development Workbook password
- `WORKBOOK_API_KEY_PROD`: Production Workbook API key (if different)
- `WORKBOOK_PASSWORD_PROD`: Production Workbook password (if different)
- Additional Azure/Teams bot configuration variables

### Deployment Process
1. **Code Quality**: Run `npm run lint` and `npm run typecheck`
2. **Testing**: Run `npm run test:agent` with full test suite
3. **Build**: Run `npm run build` for TypeScript compilation
4. **Deployment**: Azure App Service deployment (automated via CI/CD)
5. **Monitoring**: Check Application Insights for deployment health

## 📊 Current Project Status (Phase 4 - August 2025)

### Completed Phases ✅
- **Phase 1**: Export tool fixes (44% → 83% success rate)
- **Phase 2A**: Tool selection improvements (0% → 100% geographic success)
- **Phase 2B**: Broken tools remediation (all tools now functional)
- **Phase 3**: Tool consolidation with CSV generation - **COMPLETED**

### Current Phase 🔄
- **Phase 4**: Test Coverage Expansion
- **Status**: Adding comprehensive test scenarios for untested tools

### Success Metrics
- **Hierarchical Search**: 100% success rate (4/4) - **BREAKTHROUGH**
- **Company Search**: 86% success rate (6/7) - **MAJOR IMPROVEMENT**
- **Export Functionality**: 83% success rate (5/6 scenarios)
- **Geographic Queries**: 100% success rate
- **Tool Selection**: Zero broken tools, improved AI agent decision making
- **Performance**: Sub-30s response times + eliminated OpenAI rate limits
- **CRITICAL**: OpenAI token usage reduced 98% (300K+ → <5K per bulk operation)

## 🛡️ Critical Lessons Learned & Warnings

### 🚨 CRITICAL ISSUES TO AVOID
1. **NEVER USE EMOJIS IN CODE** - Azure App Service + emojis = silent logging failure
2. **Teams Message Limits** - Bulk responses must be summarized, not raw data dumps
3. **Tool Selection** - Vague tool descriptions lead to wrong AI agent choices
4. **Schema Validation** - Missing optional parameters cause tool execution failures
5. **Cache Management** - Long-running processes need proper cache invalidation

### Performance Considerations
- **Bulk Operations**: Use summarization for 1000+ records
- **API Rate Limits**: Implement proper throttling and retry logic
- **Memory Management**: Large datasets require streaming or pagination
- **Response Times**: Teams has ~30s timeout for bot responses

### Security & Compliance
- **API Keys**: Never log or expose in error messages
- **Data Privacy**: Respect data access controls from Workbook API
- **Input Validation**: Sanitize all user inputs before API calls
- **Error Messages**: Don't expose internal system details to users

## 📚 Additional Resources

### Documentation
- `docs/comprehensive-remediation-plan.md` - Detailed project roadmap and achievements
- `tests/comprehensive-tool-analysis.ts` - Complete test framework with all scenarios
- `src/agent/tools/` - Individual tool implementations with inline documentation

### Key Files & Locations
- **Teams Integration**: `src/teams/index.ts`, `src/teams/teamsBot.ts`
- **AI Agent**: `src/agent/` directory with tool definitions
- **Services**: `src/services/` for API integrations and business logic
- **Types**: `src/types/` for TypeScript interfaces and schemas
- **Tests**: `tests/` for comprehensive validation framework

### Monitoring & Debugging
- **Application Insights**: Real-time monitoring and performance metrics
- **Console Logging**: Structured logging for development debugging  
- **Test Framework**: Comprehensive scenario validation with detailed reporting
- **Error Tracking**: Azure Application Insights exception tracking

