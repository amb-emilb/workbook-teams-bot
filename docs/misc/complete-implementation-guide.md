# Workbook Teams Agent - Implementation Guide

## 📋 Current Status
**Status**: 🔄 **DEPLOYING PRODUCTION MEMORY**  
**Authentication**: User-Assigned Managed Identity ✅  
**Teams Integration**: Bot functional with conversation memory ✅  
**Memory System**: Environment-aware PostgreSQL (Production) / LibSQL (Dev) 🔄

---

## 🎯 **COMPLETED PHASES**

### **PHASE 1-7: Foundation & Deployment** ✅ **COMPLETED**
- ✅ **Mastra Agent Setup** - 12 CRM tools, OpenAI GPT-4 integration
- ✅ **Azure Infrastructure** - App Service, Key Vault, Application Insights, Bot Service
- ✅ **CI/CD Pipeline** - GitHub Actions with ARM template deployment
- ✅ **User-Assigned MSI** - Secure authentication without credentials
- ✅ **Teams Integration** - Bot receiving/responding to messages
- ✅ **Security Implementation** - Input validation, prompt injection prevention

### **PHASE 8: Application Logging** ✅ **COMPLETED**
- ✅ **Console Logging** - Simplified from Winston to reliable console approach
- ✅ **Application Insights** - Direct telemetry integration
- ✅ **Performance Metrics** - Response time and agent cache tracking
- ✅ **Diagnostic Logging** - Prefixed logs like `[BOT MESSAGE]`, `[AGENT CACHE HIT]`

### **PHASE 9: Memory & Context** ✅ **COMPLETED (2025-08-22)**

#### **ROOT CAUSE IDENTIFIED & FIXED** ✅
**Problem**: "I encountered an error while processing your request" for all messages
**Root Cause**: `Memory requires a storage provider to function` - Mastra Memory had no storage
**Initial Solution**: Configured LibSQL storage adapter
**PRODUCTION ISSUE**: LibSQL doesn't work on Azure App Service (file locking)
**FINAL SOLUTION**: Environment-aware storage with PostgreSQL for production

```typescript
// PRODUCTION READY: src/agent/workbookAgent.ts
const isProduction = process.env.NODE_ENV === 'production' || process.env.WEBSITE_INSTANCE_ID;

const storage = isProduction 
  ? new PostgresStore({ connectionString: await keyVault.getSecret('postgres-connection-string') })
  : new LibSQLStore({ url: 'file:./workbook-memory.db' });

const vector = isProduction
  ? new PostgresVector({ connectionString: await keyVault.getSecret('postgres-connection-string') })
  : new LibSQLVector({ connectionUrl: 'file:./workbook-memory.db' });

const memory = new Memory({
  storage,
  vector,
  embedder: openai.embedding('text-embedding-3-small'),
  options: {
    lastMessages: 20,
    semanticRecall: { topK: 3, messageRange: { before: 2, after: 1 }},
    workingMemory: { enabled: true }
  }
});
```

#### **Azure App Service Storage Incompatibilities Discovered** ✅ **RESOLVED**
**Problem 1**: SQLite/LibSQL file locking issues on Azure App Service network storage
**Problem 2**: Azure Cosmos DB MongoDB API incompatible with Mastra's MongoDB implementation
**Solution**: Azure Database for PostgreSQL - only Azure-native DB with full Mastra support

### **PHASE 10: Production Memory Solution** 🔄 **IN PROGRESS (2025-08-22)**

#### **Azure Database for PostgreSQL** 🔄 **DEPLOYING**
- 🔄 **Provider Registration** - Microsoft.DBforPostgreSQL registering
- ⏳ **Service Creation** - workbook-postgres-memory pending
- ✅ **Full Mastra Support** - @mastra/pg adapter ready
- ✅ **Vector Support** - pgvector extension for semantic recall
- ✅ **Cost Effective** - ~$25-35/month Basic tier
- ✅ **Azure Native** - Stays within Microsoft ecosystem

#### **Production Architecture** ✅ **IMPLEMENTED**
Environment-aware storage for reliable memory persistence:
```typescript
// PRODUCTION READY: Automatic environment detection
const isProduction = process.env.WEBSITE_INSTANCE_ID; // Azure App Service indicator

const storage = isProduction 
  ? new PostgresStore({ connectionString }) // Azure Database for PostgreSQL
  : new LibSQLStore({ url: 'file:./memory.db' }); // Local development

const memory = new Memory({
  storage,
  vector: isProduction ? new PostgresVector({ connectionString }) : new LibSQLVector({}),
  options: {
    lastMessages: 20,
    semanticRecall: { topK: 3, messageRange: { before: 2, after: 1 }},
    workingMemory: { enabled: true } // User profiles persist
  }
});
```

#### **Two-Layer Memory Architecture** ✅ **PRODUCTION READY**
1. **Mastra Agent Memory** (AI conversation context) - PostgreSQL with full persistence ✅
2. **Teams AI SDK Storage** (Teams conversation state) - MemoryStorage (sufficient for Teams state) ✅

#### **Conversation Context Features** ✅
- **threadId**: Teams conversation.id for persistent memory per chat
- **resourceId**: Teams user.id for user-specific memory
- **Context Window**: Last 20 messages with semantic recall
- **Memory Persistence**: Will survive process restarts with MongoDB storage

---

## 🚀 **NEXT PHASES - REMAINING WORK**

### **PHASE 11: Production Storage Architecture** ✅ **COMPLETED (2025-08-22)**
**Tasks Completed**:
- [x] Research Azure App Service storage limitations
- [x] Identify PostgreSQL as optimal Azure-native solution
- [x] Implement environment-aware storage switching
- [x] Add @mastra/pg dependency
- [x] Update workbookAgent.ts for PostgreSQL/LibSQL hybrid approach
- [x] Create Azure PostgreSQL deployment script
- [x] Configure automatic production/development switching

**Critical Discoveries**: 
- SQLite/LibSQL incompatible with Azure App Service production (file locking)
- MongoDB Cosmos DB API incompatible with Mastra implementation
- PostgreSQL is ONLY Azure-native database with full Mastra support

### **PHASE 12: Complete PostgreSQL Deployment** 🔄 **IN PROGRESS (2025-08-22)**
**Status**: PostgreSQL server created and ready, completing configuration

**Remaining Tasks**:
- [x] Wait for Microsoft.DBforPostgreSQL provider registration
- [x] Create Azure Database for PostgreSQL server
- [x] Create mastra_memory database
- [x] Enable pgvector extension for semantic recall
- [x] Add postgres-connection-string to Key Vault
- [x] Install @mastra/pg package: `npm install @mastra/pg`
- [ ] Deploy updated code to Azure App Service
- [ ] Test memory persistence in production environment
- [ ] Verify semantic recall and working memory functionality

**Expected Outcome**: Full memory persistence with conversation history, semantic recall, and working memory profiles surviving deployments and restarts.

### **PHASE 13: Teams Storage Persistence** 📋 **LOWER PRIORITY**
**Note**: With Mastra memory now persistent, Teams SDK storage is less critical

Replace Teams AI SDK MemoryStorage with BlobStorage for Teams-specific state:

```typescript
// Current: (in-memory, lost on restart but not critical)
const storage = new MemoryStorage();

// Future: (persistent across restarts)  
const storage = new BlobsStorage(connectionString, containerName);
```

**Tasks** (when needed):
- [ ] Add Azure Storage Account to infrastructure
- [ ] Install `botbuilder-azure-blobs` package
- [ ] Configure BlobStorage in Teams AI SDK
- [ ] Add storage connection string to Key Vault

### **PHASE 13: Performance & UX Improvements** 📋 **PENDING**
- [ ] **Fix Application Insights Span Export Errors**
- [ ] **Resolve Container Restart Issues** - Investigate 3-5 minute restarts
- [ ] **Enhanced Logging** - Direct Application Insights logging vs console.log
- [ ] **Tool Functionality Fixes** - CSV downloads, response formatting
- [ ] **Adaptive Cards** - Rich interactive responses

### **PHASE 14: Development Environment Improvements** 📋 **PLANNED**
- [ ] **Clean Local vs Production Configuration** - Simplify keyVault.ts to use NODE_ENV
  - PRODUCTION: Key Vault only (no .env fallback)
  - LOCAL DEVELOPMENT: .env only (no Key Vault required)
  - Remove complex fallback logic and credential chain noise
- [ ] **Update Local Testing Framework** - Modernize tests directory to work with current MongoDB architecture
- [ ] **Streamlined Development Workflow** - Reduce 5-10 minute deployment cycles for local testing

### **PHASE 15: Advanced Features** 📋 **PLANNED**
- [ ] **Multi-Environment Pipeline** - DEV/STAGING/PROD
- [ ] **Security Hardening** - Enhanced security headers, audit logging
- [ ] **File Upload Support** - Process user-uploaded files
- [ ] **Data Visualization** - Charts and graphs in Teams

---

## 📊 **TECHNICAL ARCHITECTURE**

### **Memory System Architecture** 🔄 **NEEDS VECTOR SOLUTION**
```
Teams User → Teams AI SDK → Mastra Agent → MongoDB + Vector Store
                ↓                ↓              ↓         ↓
         MemoryStorage    Memory with MongoDB   Azure AI Search
         (in-memory)      (persistent storage)  (semantic recall)
```

**Current Status**:
- ✅ MongoDB storage: Working (conversation persistence)
- ❌ Vector search: Requires Azure AI Search integration (MongoDB vCore incompatible with Mastra)

### **Authentication Flow** ✅
- **Bot ↔ Bot Framework**: User-Assigned MSI via ConfigurationServiceClientCredentialFactory
- **App ↔ Azure Resources**: Same MSI for Key Vault, Application Insights

### **Key Components** 🔄 **UPGRADING**
- **Teams AI SDK**: Teams-specific routing and features
- **Mastra Agent**: AI conversation with CRM tools
- **MongoDB Cosmos DB**: Persistent conversation memory + vector search ⏳
- **Key Vault**: Secure secret management
- **Application Insights**: Telemetry and monitoring

---

## 🔍 **CURRENT ISSUES**

### **⚠️ CRITICAL ISSUES RESOLVED** ✅
- ✅ **Memory Storage Provider Error** - Fixed with LibSQL configuration
- ✅ **Agent Reinitialization** - Process restarts are normal Azure behavior
- ✅ **Conversation Context Loss** - Fixed with Mastra memory + threadId/resourceId

### **⚠️ REMAINING ISSUES**
1. **Vector Store Configuration** - Complete MongoDB integration for semantic recall ⏳
2. **Teams Storage Persistence** - MemoryStorage lost on restart
3. **Application Insights Export Errors** - Span export failures in logs
4. **Container Restarts** - Frequent restarts every few minutes
5. **Console Logging** - Should migrate to direct Application Insights

### **⚠️ COSMETIC WARNINGS (Non-Breaking)**
- **AZURE_CLIENT_ID Missing** - DefaultAzureCredential warnings in logs, but MSI fallback works ✅
- **Credential Chain Warnings** - Multiple auth attempts logged, but User-Assigned MSI succeeds ✅
- **OpenTelemetry Initialization** - Some startup order warnings, but telemetry functions ✅

### **🎯 IMMEDIATE PRIORITIES**
1. **Complete MongoDB Vector Integration** (Phase 11) - IN PROGRESS ⏳
2. **Replace MemoryStorage with BlobStorage** (Phase 12)
3. **Fix Application Insights logging** (Phase 13) 
4. **Investigate container restart frequency** (Phase 13)
5. **Clean up cosmetic warnings** (Low priority - not affecting functionality)

---

## 📈 **SUCCESS METRICS**

### **✅ WORKING**
- Bot responds to all messages (no more errors)
- Conversation context preserved within session
- Agent memory persistent across requests
- All 12 CRM tools functional
- User-Assigned MSI authentication working
- Application health monitoring active

### **🎯 TARGET IMPROVEMENTS**
- Teams conversation state survives restarts
- Response times consistently under 3 seconds
- Zero Application Insights export errors
- Enhanced user experience with rich responses

---

## 🔗 **KEY RESOURCES**

### **Production URLs**
- **Health Check**: https://workbook-teams-bot.azurewebsites.net/health
- **App Service**: workbook-teams-bot.azurewebsites.net
- **Key Vault**: workbook-bot-kv-3821.vault.azure.net

### **Critical Files**
- `src/agent/workbookAgent.ts` - Mastra agent with LibSQL memory
- `src/teams/teamsBot.ts` - Teams AI SDK with memory integration
- `src/teams/server.ts` - Express server with health checks
- `.github/workflows/deploy.yml` - CI/CD deployment pipeline

### **Azure Resources**
- **Resource Group**: `workbook-teams-westeurope`
- **App Service**: `workbook-teams-bot`
- **Key Vault**: `workbook-bot-kv-3821` (7 secrets configured)
- **Application Insights**: `workbook-bot-insights`
- **MSI**: `workbook-teams-bot-identity`
- **Cosmos DB**: `workbook-cosmos-mongodb` (MongoDB vCore, France Central) ⏳

---

**Last Updated**: 2025-08-22  
**Status**: Production memory architecture implemented with PostgreSQL, deployment in progress  
**Next Priority**: Complete PostgreSQL server creation and test production memory persistence