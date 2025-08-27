# Workbook Teams Agent - Technical Architecture

## 🎯 **SYSTEM ARCHITECTURE**

### **Memory Architecture** ✅ **PRODUCTION READY**
```typescript
// Environment-aware storage
const isProduction = process.env.NODE_ENV === 'production' || process.env.WEBSITE_INSTANCE_ID;

const storage = isProduction 
  ? new PostgresStore({ connectionString }) // Azure Database for PostgreSQL
  : new LibSQLStore({ url: 'file:./memory.db' }); // Local development

const memory = new Memory({
  storage,
  vector: isProduction ? new PostgresVector({ connectionString }) : new LibSQLVector({}),
  options: {
    lastMessages: 20,
    semanticRecall: { topK: 3, messageRange: { before: 2, after: 1 }},
    workingMemory: { enabled: true }
  }
});
```

### **System Flow** ✅
```
Teams User → Teams AI SDK → Mastra Agent → PostgreSQL + pgvector
     ↓             ↓            ↓              ↓
Teams State → Memory → AI Response → Adaptive Cards → File Downloads
```

### **Authentication Flow** ✅
- **Bot ↔ Teams**: User-Assigned MSI via Teams AI SDK
- **App ↔ Azure**: Same MSI for Key Vault, PostgreSQL, Application Insights

### **Key Features** ✅
- **Conversation Memory**: Persistent across restarts with PostgreSQL
- **Semantic Recall**: pgvector for intelligent context retrieval  
- **Rich UX**: Adaptive Cards with interactive buttons and proper file icons
- **CSV Exports**: Downloadable files with proper Teams integration
- **Security**: Input sanitization and prompt injection detection

---

## 🔗 **KEY RESOURCES**

### **Production Environment**
- **Health Check**: https://workbook-teams-bot.azurewebsites.net/health
- **Application Insights ID**: 9eef816b-37f1-4fad-b744-02f16fb5e82e
- **Resource Group**: workbook-teams-westeurope
- **PostgreSQL**: workbook-postgres-memory (North Europe, pgvector enabled)

### **Critical Files**
- `src/agent/workbookAgent.ts` - Mastra agent with PostgreSQL memory
- `src/teams/teamsBot.ts` - Teams integration with Adaptive Cards
- `src/teams/adaptiveCards.ts` - Rich UI components with dynamic file icons
- `src/routes/fileRoutes.ts` - PostgreSQL file storage for CSV downloads
- `src/services/keyVault.ts` - Secure secrets management

### **Azure Resources**
- **Resource Group**: workbook-teams-westeurope
- **App Service**: workbook-teams-bot
- **Key Vault**: workbook-bot-kv-3821 (8 secrets configured)
- **Application Insights**: workbook-bot-insights
- **MSI**: workbook-teams-bot-identity
- **PostgreSQL**: workbook-postgres-memory (North Europe, pgvector enabled)

---

## 🔍 **SUCCESS METRICS**

### **Fully Operational**
- ✅ Bot responds to all messages (no more "I encountered an error")
- ✅ Conversation context preserved across deployments
- ✅ All 12 CRM tools functional with unlimited results
- ✅ CSV downloads work with clickable Adaptive Cards
- ✅ PostgreSQL memory persistence in production
- ✅ Application Insights telemetry working (minor export warnings are non-blocking)
- ✅ Automated CI/CD pipeline functional

### **Performance**
- ✅ Response times typically under 5 seconds
- ✅ Agent caching prevents reinitialization overhead
- ✅ PostgreSQL connection with 15-second timeout + fallback
- ✅ Graceful error handling with user-friendly messages

---

## 🛡️ **CRITICAL LESSONS LEARNED**
1. **No emojis in server-side logging** - Breaks Azure App Service telemetry
2. **Restify async handlers** - Must use `(req, res)` not `(req, res, next)` for async functions
3. **PostgreSQL required** - Only Azure DB with full Mastra compatibility
4. **URL parsing** - Exclude punctuation from regex patterns to prevent malformed links
5. **Environment detection** - Use `WEBSITE_INSTANCE_ID` for reliable Azure App Service detection

---

**Last Updated**: 2025-08-27