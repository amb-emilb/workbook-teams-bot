Connected!
2025-08-21T11:00:29  Welcome, you are now connected to log-streaming service.Starting Log Tail -n 10 of existing logs ----/appsvctmp/volatile/logs/runtime/container.log
2025-08-21T11:00:29.7118296Z     "botCredentials": {
2025-08-21T11:00:29.7118319Z       "status": "healthy",
2025-08-21T11:00:29.7118343Z       "message": "User-Assigned Managed Identity configured"
2025-08-21T11:00:29.7118363Z     },
2025-08-21T11:00:29.7118385Z     "openai": {
2025-08-21T11:00:29.7118406Z       "status": "healthy",
2025-08-21T11:00:29.7118445Z       "message": "OpenAI API key available"
2025-08-21T11:00:29.7118466Z     }
2025-08-21T11:00:29.7118487Z   }
2025-08-21T11:00:29.7118508Z }Ending Log Tail of existing logs ---Starting Live Log Stream ---
2025-08-21T11:00:34.0873834Z [dotenv@17.2.1] injecting env (0) from .env -- tip: ⚙️  suppress all logs with { quiet: true }
2025-08-21T11:00:34.0892983Z [dotenv@17.2.1] injecting env (0) from .env -- tip: 📡 observe env with Radar: https://dotenvx.com/radar
2025-08-21T11:00:34.1639424Z @opentelemetry/instrumentation-winston [
2025-08-21T11:00:34.1640207Z   'Module winston has been loaded before @opentelemetry/instrumentation-winston so it might not work, please initialize it before requiring winston'
2025-08-21T11:00:34.1640264Z ]
2025-08-21T11:00:34.1645665Z @opentelemetry/instrumentation-winston [
2025-08-21T11:00:34.1646038Z   'Module winston has been loaded before @opentelemetry/instrumentation-winston so it might not work, please initialize it before requiring winston'
2025-08-21T11:00:34.1646358Z ]
2025-08-21T11:00:34.1727463Z Error: @opentelemetry/api: Attempted duplicate registration of API: propagation
2025-08-21T11:00:34.1728402Z     at registerGlobal (/node_modules/@opentelemetry/api/build/src/internal/global-utils.js:32:21)
2025-08-21T11:00:34.1728461Z     at PropagationAPI.setGlobalPropagator (/node_modules/@opentelemetry/api/build/src/api/propagation.js:52:50)
2025-08-21T11:00:34.1728551Z     at setupPropagator (/node_modules/@azure/monitor-opentelemetry/node_modules/@opentelemetry/sdk-trace-node/build/src/NodeTracerProvider.js:45:27)
2025-08-21T11:00:34.1728586Z     at NodeTracerProvider.register (/node_modules/@azure/monitor-opentelemetry/node_modules/@opentelemetry/sdk-trace-node/build/src/NodeTracerProvider.js:76:9)
2025-08-21T11:00:34.1728618Z     at NodeSDK.start (/node_modules/@azure/monitor-opentelemetry/node_modules/@opentelemetry/sdk-node/build/src/sdk.js:243:34)
2025-08-21T11:00:34.1728646Z     at useAzureMonitor (/node_modules/@azure/monitor-opentelemetry/dist/commonjs/index.js:88:9)
2025-08-21T11:00:34.1728686Z     at useAzureMonitor (/node_modules/applicationinsights/out/src/main.js:50:49)
2025-08-21T11:00:34.1728718Z     at TelemetryClient.initialize (/node_modules/applicationinsights/out/src/shim/telemetryClient.js:58:40)
2025-08-21T11:00:34.1728751Z     at Module.start (/node_modules/applicationinsights/out/src/shim/applicationinsights.js:71:35)
2025-08-21T11:00:34.1728784Z     at initializeTelemetry (file:///home/site/wwwroot/dist/src/utils/telemetry.js:40:21) []
2025-08-21T11:00:34.1823080Z Extended metrics are no longer supported. Please reference the Azure Monitor OpenTelemetry Migration Doc for more information. If this functionality is required, please revert to Application Insights 2.X SDK. []
2025-08-21T11:00:34.1828043Z Application Insights initialized successfully
2025-08-21T11:00:34.1861218Z 11:00:34.185 [[32minfo[39m]: Initializing Teams AI server... {
2025-08-21T11:00:34.1862243Z   "service": "workbook-teams-bot",
2025-08-21T11:00:34.1862324Z   "environment": "dev"
2025-08-21T11:00:34.1862365Z }
2025-08-21T11:00:34.1870659Z 11:00:34.186 [[32minfo[39m]: Using User-Assigned Managed Identity authentication {
2025-08-21T11:00:34.1871304Z   "service": "workbook-teams-bot",
2025-08-21T11:00:34.1871366Z   "environment": "dev",
2025-08-21T11:00:34.1871403Z   "appType": "UserAssignedMSI",
2025-08-21T11:00:34.1871435Z   "appId": "1a915ea6..."
2025-08-21T11:00:34.1871464Z }
2025-08-21T11:00:34.1876448Z 11:00:34.187 [[32minfo[39m]: Initializing Teams bot with Key Vault secrets... {
2025-08-21T11:00:34.1877088Z   "service": "workbook-teams-bot",
2025-08-21T11:00:34.1877148Z   "environment": "dev"
2025-08-21T11:00:34.1877182Z }
2025-08-21T11:00:34.1884229Z Retrieving secret from Key Vault: openai-api-key
2025-08-21T11:00:34.1917371Z Workbook Teams Bot initialized
2025-08-21T11:00:34.1944319Z Ready to bridge Mastra agent to Microsoft Teams
2025-08-21T11:00:34.2121386Z (node:1139) [DEP0111] DeprecationWarning: Access to process.binding('http_parser') is deprecated.
2025-08-21T11:00:34.2122004Z (Use `node --trace-deprecation ...` to show where the warning was created)
2025-08-21T11:00:34.2125763Z (node:1139) [DEP0111] DeprecationWarning: Access to process.binding('http_parser') is deprecated.
2025-08-21T11:00:41.5941442Z Successfully retrieved secret from Key Vault: openai-api-key
2025-08-21T11:00:41.6244351Z 11:00:41.624 [[32minfo[39m]: Workbook Teams Bot Server Started {
2025-08-21T11:00:41.6244830Z   "service": "workbook-teams-bot",
2025-08-21T11:00:41.6244888Z   "environment": "dev",
2025-08-21T11:00:41.6244924Z   "port": "3978",
2025-08-21T11:00:41.6244959Z   "healthCheck": "http://localhost:3978/health",
2025-08-21T11:00:41.6244993Z   "botEndpoint": "http://localhost:3978/api/messages",
2025-08-21T11:00:41.6245051Z   "productionUrl": "https://workbook-teams-bot.azurewebsites.net"
2025-08-21T11:00:41.6245081Z }
2025-08-21T11:00:41.6246753Z 11:00:41.624 [[32minfo[39m]: ================================================== {
2025-08-21T11:00:41.6246856Z   "service": "workbook-teams-bot",
2025-08-21T11:00:41.6246890Z   "environment": "dev"
2025-08-21T11:00:41.6246923Z }
2025-08-21T11:00:43.2716718Z 11:00:43.270 [[34mdebug[39m]: Health check: Testing Key Vault connectivity... {
2025-08-21T11:00:43.2717183Z   "service": "workbook-teams-bot",
2025-08-21T11:00:43.2717214Z   "environment": "dev"
2025-08-21T11:00:43.2717229Z }
2025-08-21T11:00:43.2717246Z Retrieving secret from Key Vault: openai-api-key
2025-08-21T11:00:43.2991578Z Successfully retrieved secret from Key Vault: openai-api-key
2025-08-21T11:00:43.2999758Z 11:00:43.299 [[34mdebug[39m]: Health check completed {
2025-08-21T11:00:43.2999860Z   "service": "workbook-teams-bot",
2025-08-21T11:00:43.2999895Z   "environment": "dev",
2025-08-21T11:00:43.2999916Z   "status": "healthy",
2025-08-21T11:00:43.2999937Z   "checks": {
2025-08-21T11:00:43.2999958Z     "keyVault": {
2025-08-21T11:00:43.2999979Z       "status": "healthy",
2025-08-21T11:00:43.3000001Z       "message": "Key Vault accessible"
2025-08-21T11:00:43.3000022Z     },
2025-08-21T11:00:43.3000043Z     "botCredentials": {
2025-08-21T11:00:43.3000086Z       "status": "healthy",
2025-08-21T11:00:43.3000111Z       "message": "User-Assigned Managed Identity configured"
2025-08-21T11:00:43.3000130Z     },
2025-08-21T11:00:43.3000151Z     "openai": {
2025-08-21T11:00:43.3000174Z       "status": "healthy",
2025-08-21T11:00:43.3000197Z       "message": "OpenAI API key available"
2025-08-21T11:00:43.3000217Z     }
2025-08-21T11:00:43.3000237Z   }
2025-08-21T11:00:43.3000256Z }
2025-08-21T11:00:53.7184958Z 11:00:53.718 [[32minfo[39m]: HTTP Request {
2025-08-21T11:00:53.7185594Z   "service": "workbook-teams-bot",
2025-08-21T11:00:53.7185650Z   "environment": "dev",
2025-08-21T11:00:53.7185675Z   "method": "POST",
2025-08-21T11:00:53.7185700Z   "url": "/api/messages",
2025-08-21T11:00:53.7185725Z   "type": "http_request"
2025-08-21T11:00:53.7185747Z }
2025-08-21T11:00:53.7186775Z 11:00:53.718 [[34mdebug[39m]: Incoming Teams message {
2025-08-21T11:00:53.7186842Z   "service": "workbook-teams-bot",
2025-08-21T11:00:53.7186866Z   "environment": "dev",
2025-08-21T11:00:53.7186885Z   "hasAuthHeader": true,
2025-08-21T11:00:53.7186925Z   "activityType": "message",
2025-08-21T11:00:53.7186945Z   "source": "52.113.205.24:17621"
2025-08-21T11:00:53.7186964Z }
2025-08-21T11:00:55.5793375Z azure:identity:warning DefaultAzureCredential => Skipped createDefaultWorkloadIdentityCredential because of an error creating the credential: CredentialUnavailableError: WorkloadIdentityCredential: is unavailable. clientId is a required parameter. In DefaultAzureCredential and ManagedIdentityCredential, this can be provided as an environment variable - "AZURE_CLIENT_ID".
2025-08-21T11:00:55.5793896Z         See the troubleshooting guide for more information: https://aka.ms/azsdk/js/identity/workloadidentitycredential/troubleshoot
2025-08-21T11:00:55.5818659Z azure:core-client:warning The baseUri option for SDK Clients has been deprecated, please use endpoint instead.
2025-08-21T11:00:55.6024298Z azure:core-client:warning The baseUri option for SDK Clients has been deprecated, please use endpoint instead.
2025-08-21T11:00:55.6141583Z azure:core-client:warning The baseUri option for SDK Clients has been deprecated, please use endpoint instead.
2025-08-21T11:00:55.6149587Z azure:identity:warning DefaultAzureCredential => Skipped createDefaultBrokerCredential because of an error creating the credential: Error: Broker for WAM was requested to be enabled, but no native broker was configured. You must install the identity-broker plugin package (`npm install --save @azure/identity-broker`) and enable it by importing `useIdentityPlugin` from `@azure/identity` and calling `useIdentityPlugin(brokerPlugin)` before using `enableBroker`.
2025-08-21T11:00:55.6285043Z azure:identity:warning DefaultAzureCredential => Skipped createDefaultWorkloadIdentityCredential because of an error creating the credential: CredentialUnavailableError: WorkloadIdentityCredential: is unavailable. clientId is a required parameter. In DefaultAzureCredential and ManagedIdentityCredential, this can be provided as an environment variable - "AZURE_CLIENT_ID".
2025-08-21T11:00:55.6285554Z         See the troubleshooting guide for more information: https://aka.ms/azsdk/js/identity/workloadidentitycredential/troubleshoot
2025-08-21T11:00:55.6375996Z azure:core-client:warning The baseUri option for SDK Clients has been deprecated, please use endpoint instead.
2025-08-21T11:00:55.6376525Z azure:core-client:warning The baseUri option for SDK Clients has been deprecated, please use endpoint instead.
2025-08-21T11:00:55.6376565Z azure:core-client:warning The baseUri option for SDK Clients has been deprecated, please use endpoint instead.
2025-08-21T11:00:55.6376608Z azure:identity:warning DefaultAzureCredential => Skipped createDefaultBrokerCredential because of an error creating the credential: Error: Broker for WAM was requested to be enabled, but no native broker was configured. You must install the identity-broker plugin package (`npm install --save @azure/identity-broker`) and enable it by importing `useIdentityPlugin` from `@azure/identity` and calling `useIdentityPlugin(brokerPlugin)` before using `enableBroker`.
2025-08-21T11:00:56.3230846Z 11:00:56.320 [[34mdebug[39m]: Health check: Testing Key Vault connectivity... {
2025-08-21T11:00:56.3232145Z   "service": "workbook-teams-bot",
2025-08-21T11:00:56.3232201Z   "environment": "dev"
2025-08-21T11:00:56.3232224Z }
2025-08-21T11:00:56.3232273Z Retrieving secret from Key Vault: openai-api-key
2025-08-21T11:00:56.4218901Z Successfully retrieved secret from Key Vault: openai-api-key
2025-08-21T11:00:56.4239970Z 11:00:56.411 [[34mdebug[39m]: Health check completed {
2025-08-21T11:00:56.4240011Z   "service": "workbook-teams-bot",
2025-08-21T11:00:56.4240039Z   "environment": "dev",
2025-08-21T11:00:56.4240061Z   "status": "healthy",
2025-08-21T11:00:56.4240084Z   "checks": {
2025-08-21T11:00:56.4240106Z     "keyVault": {
2025-08-21T11:00:56.4240129Z       "status": "healthy",
2025-08-21T11:00:56.4240154Z       "message": "Key Vault accessible"
2025-08-21T11:00:56.4240175Z     },
2025-08-21T11:00:56.4240198Z     "botCredentials": {
2025-08-21T11:00:56.4240232Z       "status": "healthy",
2025-08-21T11:00:56.4240258Z       "message": "User-Assigned Managed Identity configured"
2025-08-21T11:00:56.4240280Z     },
2025-08-21T11:00:56.4240301Z     "openai": {
2025-08-21T11:00:56.4240323Z       "status": "healthy",
2025-08-21T11:00:56.4240346Z       "message": "OpenAI API key available"
2025-08-21T11:00:56.4240366Z     }
2025-08-21T11:00:56.4240389Z   }
2025-08-21T11:00:56.4241768Z }
2025-08-21T11:00:58.1686433Z 11:00:58.168 [[34mdebug[39m]: Ping {
2025-08-21T11:00:58.1686889Z   "service": "workbook-teams-bot",
2025-08-21T11:00:58.1687003Z   "environment": "dev"
2025-08-21T11:00:58.1687034Z }
2025-08-21T11:00:58.1687070Z 11:00:58.168 [[32minfo[39m]: Initializing Workbook agent for first use {
2025-08-21T11:00:58.1687094Z   "service": "workbook-teams-bot",
2025-08-21T11:00:58.1687119Z   "environment": "dev"
2025-08-21T11:00:58.1687173Z }
2025-08-21T11:00:58.1695775Z 🔐 Initializing Workbook agent with Key Vault...
2025-08-21T11:00:58.1696968Z Retrieving secret from Key Vault: openai-api-key
2025-08-21T11:00:58.2884032Z Successfully retrieved secret from Key Vault: openai-api-key
2025-08-21T11:00:59.0442784Z 🔧 Initializing all tools with Key Vault...
2025-08-21T11:00:59.0445974Z 🔐 Loading Workbook configuration from Key Vault for DEV environment
2025-08-21T11:00:59.0451324Z Retrieving secret from Key Vault: workbook-api-key-dev
2025-08-21T11:00:59.2360361Z Successfully retrieved secret from Key Vault: workbook-api-key-dev
2025-08-21T11:00:59.2363334Z Retrieving secret from Key Vault: workbook-password-dev
2025-08-21T11:00:59.2666915Z Successfully retrieved secret from Key Vault: workbook-password-dev
2025-08-21T11:00:59.2669043Z ✅ Workbook Client initialized from Key Vault for DEV environment
2025-08-21T11:00:59.6953687Z ✅ All tools initialized with Key Vault configuration
2025-08-21T11:00:59.7000672Z ✅ Workbook agent initialized with Key Vault configuration
2025-08-21T11:00:59.7001056Z 11:00:59.699 [[34mdebug[39m]: Input validated and sanitized {
2025-08-21T11:00:59.7001093Z   "service": "workbook-teams-bot",
2025-08-21T11:00:59.7001121Z   "environment": "dev"
2025-08-21T11:00:59.7001143Z }
2025-08-21T11:01:07.5277861Z 11:01:07.527 [[34mdebug[39m]: Mastra agent response received {
2025-08-21T11:01:07.5278318Z   "service": "workbook-teams-bot",
2025-08-21T11:01:07.5278364Z   "environment": "dev",
2025-08-21T11:01:07.5278388Z   "responseLength": 34,
2025-08-21T11:01:07.5278485Z   "preview": "Hello! How can I assist you today?"
2025-08-21T11:01:07.5278511Z }
2025-08-21T11:01:07.5312006Z 11:01:07.528 [[32minfo[39m]: Performance {
2025-08-21T11:01:07.5312128Z   "service": "workbook-teams-bot",
2025-08-21T11:01:07.5312167Z   "environment": "dev",
2025-08-21T11:01:07.5312192Z   "operation": "mastra_agent_execution",
2025-08-21T11:01:07.5312219Z   "duration": 9360,
2025-08-21T11:01:07.5312240Z   "messageLength": 4,
2025-08-21T11:01:07.5312263Z   "responseLength": 34,
2025-08-21T11:01:07.5312284Z   "type": "performance"
2025-08-21T11:01:07.5312336Z }
2025-08-21T11:01:07.5317270Z 11:01:07.531 [[32minfo[39m]: Ping {
2025-08-21T11:01:07.5317365Z   "service": "workbook-teams-bot",
2025-08-21T11:01:07.5317398Z   "environment": "dev",
2025-08-21T11:01:07.5317426Z   "userId": "29:1gRP1gbb_G2-t18H13dCq0oyX08HtHu0e7PniFRnMIbrVDVM9NJ6cOePkdNdpkapvmR28N82UfaFdx69GG-HDHA",
2025-08-21T11:01:07.5317449Z   "responseLength": 34,
2025-08-21T11:01:07.5317470Z   "type": "bot_message"
2025-08-21T11:01:07.5317493Z }
2025-08-21T11:01:16.4639077Z Terminated
2025-08-21T11:01:29.7120259Z 11:01:29.711 [[32minfo[39m]: HTTP Request {
2025-08-21T11:01:29.7120681Z   "service": "workbook-teams-bot",
2025-08-21T11:01:29.7120731Z   "environment": "dev",
2025-08-21T11:01:29.7120757Z   "method": "POST",
2025-08-21T11:01:29.7120784Z   "url": "/api/messages",
2025-08-21T11:01:29.7120808Z   "type": "http_request"
2025-08-21T11:01:29.7120831Z }
2025-08-21T11:01:29.7124685Z 11:01:29.712 [[34mdebug[39m]: Incoming Teams message {
2025-08-21T11:01:29.7124776Z   "service": "workbook-teams-bot",
2025-08-21T11:01:29.7124805Z   "environment": "dev",
2025-08-21T11:01:29.7124829Z   "hasAuthHeader": true,
2025-08-21T11:01:29.7124880Z   "activityType": "message",
2025-08-21T11:01:29.7124905Z   "source": "52.113.205.24:25479"
2025-08-21T11:01:29.7124928Z }
2025-08-21T11:01:29.8280735Z azure:identity:warning DefaultAzureCredential => Skipped createDefaultWorkloadIdentityCredential because of an error creating the credential: CredentialUnavailableError: WorkloadIdentityCredential: is unavailable. clientId is a required parameter. In DefaultAzureCredential and ManagedIdentityCredential, this can be provided as an environment variable - "AZURE_CLIENT_ID".
2025-08-21T11:01:29.8281546Z         See the troubleshooting guide for more information: https://aka.ms/azsdk/js/identity/workloadidentitycredential/troubleshoot
2025-08-21T11:01:29.8290198Z azure:core-client:warning The baseUri option for SDK Clients has been deprecated, please use endpoint instead.
2025-08-21T11:01:29.8345120Z azure:core-client:warning The baseUri option for SDK Clients has been deprecated, please use endpoint instead.
2025-08-21T11:01:29.8358227Z azure:core-client:warning The baseUri option for SDK Clients has been deprecated, please use endpoint instead.
2025-08-21T11:01:29.8390620Z azure:identity:warning DefaultAzureCredential => Skipped createDefaultBrokerCredential because of an error creating the credential: Error: Broker for WAM was requested to be enabled, but no native broker was configured. You must install the identity-broker plugin package (`npm install --save @azure/identity-broker`) and enable it by importing `useIdentityPlugin` from `@azure/identity` and calling `useIdentityPlugin(brokerPlugin)` before using `enableBroker`.
2025-08-21T11:01:29.8405849Z azure:identity:warning DefaultAzureCredential => Skipped createDefaultWorkloadIdentityCredential because of an error creating the credential: CredentialUnavailableError: WorkloadIdentityCredential: is unavailable. clientId is a required parameter. In DefaultAzureCredential and ManagedIdentityCredential, this can be provided as an environment variable - "AZURE_CLIENT_ID".
2025-08-21T11:01:29.8406010Z         See the troubleshooting guide for more information: https://aka.ms/azsdk/js/identity/workloadidentitycredential/troubleshoot
2025-08-21T11:01:29.8457563Z azure:core-client:warning The baseUri option for SDK Clients has been deprecated, please use endpoint instead.
2025-08-21T11:01:29.8484251Z azure:core-client:warning The baseUri option for SDK Clients has been deprecated, please use endpoint instead.
2025-08-21T11:01:29.8505981Z azure:core-client:warning The baseUri option for SDK Clients has been deprecated, please use endpoint instead.
2025-08-21T11:01:29.8520500Z azure:identity:warning DefaultAzureCredential => Skipped createDefaultBrokerCredential because of an error creating the credential: Error: Broker for WAM was requested to be enabled, but no native broker was configured. You must install the identity-broker plugin package (`npm install --save @azure/identity-broker`) and enable it by importing `useIdentityPlugin` from `@azure/identity` and calling `useIdentityPlugin(brokerPlugin)` before using `enableBroker`.
2025-08-21T11:01:30.1751205Z 11:01:30.174 [[34mdebug[39m]: Can you show me a list of top 10 Danish companies {
2025-08-21T11:01:30.1751842Z   "service": "workbook-teams-bot",
2025-08-21T11:01:30.1751899Z   "environment": "dev"
2025-08-21T11:01:30.1751954Z }
2025-08-21T11:01:30.1758469Z 11:01:30.175 [[32minfo[39m]: Initializing Workbook agent for first use {
2025-08-21T11:01:30.1758633Z   "service": "workbook-teams-bot",
2025-08-21T11:01:30.1758667Z   "environment": "dev"
2025-08-21T11:01:30.1758694Z }
2025-08-21T11:01:30.1758726Z 🔐 Initializing Workbook agent with Key Vault...
2025-08-21T11:01:30.1764781Z Retrieving secret from Key Vault: openai-api-key
2025-08-21T11:01:30.3218747Z Successfully retrieved secret from Key Vault: openai-api-key
2025-08-21T11:01:30.4929568Z 🔧 Initializing all tools with Key Vault...
2025-08-21T11:01:30.4935024Z 🔐 Loading Workbook configuration from Key Vault for DEV environment
2025-08-21T11:01:30.4940817Z Retrieving secret from Key Vault: workbook-api-key-dev
2025-08-21T11:01:30.5875024Z Successfully retrieved secret from Key Vault: workbook-api-key-dev
2025-08-21T11:01:30.5907724Z Retrieving secret from Key Vault: workbook-password-dev
2025-08-21T11:01:30.6080647Z Successfully retrieved secret from Key Vault: workbook-password-dev
2025-08-21T11:01:30.6082589Z ✅ Workbook Client initialized from Key Vault for DEV environment
2025-08-21T11:01:31.0375960Z ✅ All tools initialized with Key Vault configuration
2025-08-21T11:01:31.0384109Z ✅ Workbook agent initialized with Key Vault configuration
2025-08-21T11:01:31.0409049Z 11:01:31.040 [[34mdebug[39m]: Input validated and sanitized {
2025-08-21T11:01:31.0409267Z   "service": "workbook-teams-bot",
2025-08-21T11:01:31.0409303Z   "environment": "dev"
2025-08-21T11:01:31.0409326Z }
2025-08-21T11:01:32.5927379Z 🔍 Searching for companies: "Danish" with hierarchy
2025-08-21T11:01:32.5939651Z 🌐 API CALL: POST ResourceIdsRequest
2025-08-21T11:01:33.6322315Z 📝 Cache SET: resource:ids:all
2025-08-21T11:01:35.5256021Z 📝 Cache SET: resources:complete:all
2025-08-21T11:01:37.7746563Z 11:01:37.774 [[34mdebug[39m]: Mastra agent response received {
2025-08-21T11:01:37.7746862Z   "service": "workbook-teams-bot",
2025-08-21T11:01:37.7746902Z   "environment": "dev",
2025-08-21T11:01:37.7746924Z   "responseLength": 190,
2025-08-21T11:01:37.7746959Z   "preview": "I couldn't find any companies specifically matching \"Danish\" in the system. Would you like to specif"
2025-08-21T11:01:37.7746980Z }
2025-08-21T11:01:37.7751587Z 11:01:37.775 [[32minfo[39m]: Performance {
2025-08-21T11:01:37.7751685Z   "service": "workbook-teams-bot",
2025-08-21T11:01:37.7751715Z   "environment": "dev",
2025-08-21T11:01:37.7751739Z   "operation": "mastra_agent_execution",
2025-08-21T11:01:37.7751783Z   "duration": 7600,
2025-08-21T11:01:37.7751810Z   "messageLength": 49,
2025-08-21T11:01:37.7751834Z   "responseLength": 190,
2025-08-21T11:01:37.7751857Z   "type": "performance"
2025-08-21T11:01:37.7751880Z }
2025-08-21T11:01:37.7756253Z 11:01:37.775 [[32minfo[39m]: Can you show me a list of top 10 Danish companies {
2025-08-21T11:01:37.7756349Z   "service": "workbook-teams-bot",
2025-08-21T11:01:37.7756379Z   "environment": "dev",
2025-08-21T11:01:37.7756405Z   "userId": "29:1gRP1gbb_G2-t18H13dCq0oyX08HtHu0e7PniFRnMIbrVDVM9NJ6cOePkdNdpkapvmR28N82UfaFdx69GG-HDHA",
2025-08-21T11:01:37.7756430Z   "responseLength": 190,
2025-08-21T11:01:37.7756474Z   "type": "bot_message"
2025-08-21T11:01:37.7756503Z }
2025-08-21T11:01:42.7873997Z {"stack":"Error: BatchSpanProcessor: span export failed\n    at /node_modules/@azure/monitor-opentelemetry/node_modules/@opentelemetry/sdk-trace-base/build/src/export/BatchSpanProcessorBase.js:160:29\n    at AzureMonitorTraceExporter.export (/node_modules/@azure/monitor-opentelemetry-exporter/dist/commonjs/export/trace.js:62:13)\n    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)","message":"BatchSpanProcessor: span export failed","name":"Error"} []
2025-08-21T11:01:43.2159407Z 11:01:43.215 [[34mdebug[39m]: Health check: Testing Key Vault connectivity... {
2025-08-21T11:01:43.2159776Z   "service": "workbook-teams-bot",
2025-08-21T11:01:43.2159814Z   "environment": "dev"
2025-08-21T11:01:43.2159836Z }
2025-08-21T11:01:43.2164392Z Retrieving secret from Key Vault: openai-api-key
2025-08-21T11:01:43.3276273Z Successfully retrieved secret from Key Vault: openai-api-key
2025-08-21T11:01:43.3280735Z 11:01:43.327 [[34mdebug[39m]: Health check completed {
2025-08-21T11:01:43.3280894Z   "service": "workbook-teams-bot",
2025-08-21T11:01:43.3280933Z   "environment": "dev",
2025-08-21T11:01:43.3280960Z   "status": "healthy",
2025-08-21T11:01:43.3280982Z   "checks": {
2025-08-21T11:01:43.3281003Z     "keyVault": {
2025-08-21T11:01:43.3281023Z       "status": "healthy",
2025-08-21T11:01:43.3281047Z       "message": "Key Vault accessible"
2025-08-21T11:01:43.3281068Z     },
2025-08-21T11:01:43.3281152Z     "botCredentials": {
2025-08-21T11:01:43.3281177Z       "status": "healthy",
2025-08-21T11:01:43.3281645Z       "message": "User-Assigned Managed Identity configured"
2025-08-21T11:01:43.3281676Z     },
2025-08-21T11:01:43.3281698Z     "openai": {
2025-08-21T11:01:43.3281720Z       "status": "healthy",
2025-08-21T11:01:43.3281745Z       "message": "OpenAI API key available"
2025-08-21T11:01:43.3281768Z     }
2025-08-21T11:01:43.3281792Z   }
2025-08-21T11:01:43.3281815Z }
2025-08-21T11:01:50.8891999Z 11:01:50.888 [[32minfo[39m]: HTTP Request {
2025-08-21T11:01:50.8892389Z   "service": "workbook-teams-bot",
2025-08-21T11:01:50.8892441Z   "environment": "dev",
2025-08-21T11:01:50.8892464Z   "method": "POST",
2025-08-21T11:01:50.8892487Z   "url": "/api/messages",
2025-08-21T11:01:50.8892510Z   "type": "http_request"
2025-08-21T11:01:50.8892531Z }
2025-08-21T11:01:50.8900919Z 11:01:50.889 [[34mdebug[39m]: Incoming Teams message {
2025-08-21T11:01:50.8901082Z   "service": "workbook-teams-bot",
2025-08-21T11:01:50.8901117Z   "environment": "dev",
2025-08-21T11:01:50.8901144Z   "hasAuthHeader": true,
2025-08-21T11:01:50.8901190Z   "activityType": "message",
2025-08-21T11:01:50.8901220Z   "source": "52.113.205.24:21637"
2025-08-21T11:01:50.8901245Z }
2025-08-21T11:01:50.8923695Z azure:identity:warning DefaultAzureCredential => Skipped createDefaultWorkloadIdentityCredential because of an error creating the credential: CredentialUnavailableError: WorkloadIdentityCredential: is unavailable. clientId is a required parameter. In DefaultAzureCredential and ManagedIdentityCredential, this can be provided as an environment variable - "AZURE_CLIENT_ID".
2025-08-21T11:01:50.8923907Z         See the troubleshooting guide for more information: https://aka.ms/azsdk/js/identity/workloadidentitycredential/troubleshoot
2025-08-21T11:01:50.8934435Z azure:core-client:warning The baseUri option for SDK Clients has been deprecated, please use endpoint instead.
2025-08-21T11:01:50.8942253Z azure:core-client:warning The baseUri option for SDK Clients has been deprecated, please use endpoint instead.
2025-08-21T11:01:50.8948078Z azure:core-client:warning The baseUri option for SDK Clients has been deprecated, please use endpoint instead.
2025-08-21T11:01:50.8954110Z azure:identity:warning DefaultAzureCredential => Skipped createDefaultBrokerCredential because of an error creating the credential: Error: Broker for WAM was requested to be enabled, but no native broker was configured. You must install the identity-broker plugin package (`npm install --save @azure/identity-broker`) and enable it by importing `useIdentityPlugin` from `@azure/identity` and calling `useIdentityPlugin(brokerPlugin)` before using `enableBroker`.
2025-08-21T11:01:50.8961047Z azure:identity:warning DefaultAzureCredential => Skipped createDefaultWorkloadIdentityCredential because of an error creating the credential: CredentialUnavailableError: WorkloadIdentityCredential: is unavailable. clientId is a required parameter. In DefaultAzureCredential and ManagedIdentityCredential, this can be provided as an environment variable - "AZURE_CLIENT_ID".
2025-08-21T11:01:50.8961219Z         See the troubleshooting guide for more information: https://aka.ms/azsdk/js/identity/workloadidentitycredential/troubleshoot
2025-08-21T11:01:50.8966109Z azure:core-client:warning The baseUri option for SDK Clients has been deprecated, please use endpoint instead.
2025-08-21T11:01:50.8972591Z azure:core-client:warning The baseUri option for SDK Clients has been deprecated, please use endpoint instead.
2025-08-21T11:01:50.8978126Z azure:core-client:warning The baseUri option for SDK Clients has been deprecated, please use endpoint instead.
2025-08-21T11:01:50.8982430Z azure:identity:warning DefaultAzureCredential => Skipped createDefaultBrokerCredential because of an error creating the credential: Error: Broker for WAM was requested to be enabled, but no native broker was configured. You must install the identity-broker plugin package (`npm install --save @azure/identity-broker`) and enable it by importing `useIdentityPlugin` from `@azure/identity` and calling `useIdentityPlugin(brokerPlugin)` before using `enableBroker`.
2025-08-21T11:01:51.0587010Z 11:01:51.058 [[34mdebug[39m]: Show me all tech companies in Denmark {
2025-08-21T11:01:51.0588226Z   "service": "workbook-teams-bot",
2025-08-21T11:01:51.0588286Z   "environment": "dev"
2025-08-21T11:01:51.0588306Z }
2025-08-21T11:01:51.0608056Z 11:01:51.060 [[34mdebug[39m]: Input validated and sanitized {
2025-08-21T11:01:51.0608243Z   "service": "workbook-teams-bot",
2025-08-21T11:01:51.0608282Z   "environment": "dev"
2025-08-21T11:01:51.0608304Z }
2025-08-21T11:01:52.6491258Z 🌍 Geographic Analysis Tool - Starting analysis... {
2025-08-21T11:01:52.6491944Z   analysisType: 'distribution',
2025-08-21T11:01:52.6491987Z   countries: [ 'Denmark' ],
2025-08-21T11:01:52.6492010Z   resourceTypes: [ 2 ],
2025-08-21T11:01:52.6492035Z   active: true,
2025-08-21T11:01:52.6492058Z   includeEmployees: true,
2025-08-21T11:01:52.6492080Z   includeContacts: true,
2025-08-21T11:01:52.6492166Z   clusterRadius: 50,
2025-08-21T11:01:52.6492188Z   minClusterSize: 5,
2025-08-21T11:01:52.6492210Z   includeMap: false,
2025-08-21T11:01:52.6492233Z   includeRecommendations: true,
2025-08-21T11:01:52.6492256Z   detailLevel: 'detailed'
2025-08-21T11:01:52.6492277Z }
2025-08-21T11:01:52.6495347Z 🔍 Fetching resources for geographic analysis... { ResourceType: [ 2 ], Active: true }
2025-08-21T11:01:52.6502291Z 🌐 API CALL: GET ResourcesRequest
2025-08-21T11:01:52.8096410Z 🌐 API CALL: GET ResourceRequest[]
2025-08-21T11:01:52.8968136Z 📝 Cache SET: resources:search:eyJBY3RpdmUiOnRydWUsIlJlc291cmNlVHlwZSI6WzJdfQ==
2025-08-21T11:01:52.8986031Z ✅ Geographic analysis completed: 0 resources analyzed in 250ms
2025-08-21T11:01:54.7105081Z 11:01:54.710 [[34mdebug[39m]: Mastra agent response received {
2025-08-21T11:01:54.7105390Z   "service": "workbook-teams-bot",
2025-08-21T11:01:54.7105436Z   "environment": "dev",
2025-08-21T11:01:54.7105463Z   "responseLength": 184,
2025-08-21T11:01:54.7105494Z   "preview": "It appears that there are no active tech companies currently registered in Denmark within the system"
2025-08-21T11:01:54.7105518Z }
2025-08-21T11:01:54.7105845Z 11:01:54.710 [[32minfo[39m]: Performance {
2025-08-21T11:01:54.7105877Z   "service": "workbook-teams-bot",
2025-08-21T11:01:54.7105898Z   "environment": "dev",
2025-08-21T11:01:54.7105919Z   "operation": "mastra_agent_execution",
2025-08-21T11:01:54.7105969Z   "duration": 3652,
2025-08-21T11:01:54.7105994Z   "messageLength": 37,
2025-08-21T11:01:54.7106018Z   "responseLength": 184,
2025-08-21T11:01:54.7106042Z   "type": "performance"
2025-08-21T11:01:54.7106066Z }
2025-08-21T11:01:54.7108885Z 11:01:54.710 [[32minfo[39m]: Show me all tech companies in Denmark {
2025-08-21T11:01:54.7108968Z   "service": "workbook-teams-bot",
2025-08-21T11:01:54.7109002Z   "environment": "dev",
2025-08-21T11:01:54.7109033Z   "userId": "29:1gRP1gbb_G2-t18H13dCq0oyX08HtHu0e7PniFRnMIbrVDVM9NJ6cOePkdNdpkapvmR28N82UfaFdx69GG-HDHA",
2025-08-21T11:01:54.7109057Z   "responseLength": 184,
2025-08-21T11:01:54.7109079Z   "type": "bot_message"
2025-08-21T11:01:54.7109125Z }
2025-08-21T11:01:56.0742059Z {"stack":"Error: BatchSpanProcessor: span export failed\n    at /node_modules/@azure/monitor-opentelemetry/node_modules/@opentelemetry/sdk-trace-base/build/src/export/BatchSpanProcessorBase.js:160:29\n    at AzureMonitorTraceExporter.export (/node_modules/@azure/monitor-opentelemetry-exporter/dist/commonjs/export/trace.js:62:13)\n    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)","message":"BatchSpanProcessor: span export failed","name":"Error"} []
2025-08-21T11:02:15.3522553Z 11:02:15.347 [[32minfo[39m]: HTTP Request {
2025-08-21T11:02:15.3523344Z   "service": "workbook-teams-bot",
2025-08-21T11:02:15.3523394Z   "environment": "dev",
2025-08-21T11:02:15.3523419Z   "method": "POST",
2025-08-21T11:02:15.3523440Z   "url": "/api/messages",
2025-08-21T11:02:15.3523461Z   "type": "http_request"
2025-08-21T11:02:15.3523540Z }
2025-08-21T11:02:15.3628501Z 11:02:15.362 [[34mdebug[39m]: Incoming Teams message {
2025-08-21T11:02:15.3629115Z   "service": "workbook-teams-bot",
2025-08-21T11:02:15.3629165Z   "environment": "dev",
2025-08-21T11:02:15.3629193Z   "hasAuthHeader": true,
2025-08-21T11:02:15.3629217Z   "activityType": "message",
2025-08-21T11:02:15.3629241Z   "source": "52.113.205.24:10194"
2025-08-21T11:02:15.3629263Z }
2025-08-21T11:02:15.4424679Z azure:identity:warning DefaultAzureCredential => Skipped createDefaultWorkloadIdentityCredential because of an error creating the credential: CredentialUnavailableError: WorkloadIdentityCredential: is unavailable. clientId is a required parameter. In DefaultAzureCredential and ManagedIdentityCredential, this can be provided as an environment variable - "AZURE_CLIENT_ID".
2025-08-21T11:02:15.4425046Z         See the troubleshooting guide for more information: https://aka.ms/azsdk/js/identity/workloadidentitycredential/troubleshoot
2025-08-21T11:02:15.4425089Z azure:core-client:warning The baseUri option for SDK Clients has been deprecated, please use endpoint instead.
2025-08-21T11:02:15.4425117Z azure:core-client:warning The baseUri option for SDK Clients has been deprecated, please use endpoint instead.
2025-08-21T11:02:15.4774967Z azure:core-client:warning The baseUri option for SDK Clients has been deprecated, please use endpoint instead.
2025-08-21T11:02:15.4775300Z azure:identity:warning DefaultAzureCredential => Skipped createDefaultBrokerCredential because of an error creating the credential: Error: Broker for WAM was requested to be enabled, but no native broker was configured. You must install the identity-broker plugin package (`npm install --save @azure/identity-broker`) and enable it by importing `useIdentityPlugin` from `@azure/identity` and calling `useIdentityPlugin(brokerPlugin)` before using `enableBroker`.
2025-08-21T11:02:15.4775358Z azure:identity:warning DefaultAzureCredential => Skipped createDefaultWorkloadIdentityCredential because of an error creating the credential: CredentialUnavailableError: WorkloadIdentityCredential: is unavailable. clientId is a required parameter. In DefaultAzureCredential and ManagedIdentityCredential, this can be provided as an environment variable - "AZURE_CLIENT_ID".
2025-08-21T11:02:15.4775461Z         See the troubleshooting guide for more information: https://aka.ms/azsdk/js/identity/workloadidentitycredential/troubleshoot
2025-08-21T11:02:15.4775488Z azure:core-client:warning The baseUri option for SDK Clients has been deprecated, please use endpoint instead.
2025-08-21T11:02:15.5269660Z azure:core-client:warning The baseUri option for SDK Clients has been deprecated, please use endpoint instead.
2025-08-21T11:02:15.5269942Z azure:core-client:warning The baseUri option for SDK Clients has been deprecated, please use endpoint instead.
2025-08-21T11:02:15.5595778Z azure:identity:warning DefaultAzureCredential => Skipped createDefaultBrokerCredential because of an error creating the credential: Error: Broker for WAM was requested to be enabled, but no native broker was configured. You must install the identity-broker plugin package (`npm install --save @azure/identity-broker`) and enable it by importing `useIdentityPlugin` from `@azure/identity` and calling `useIdentityPlugin(brokerPlugin)` before using `enableBroker`.
2025-08-21T11:02:16.5848516Z 11:02:16.564 [[34mdebug[39m]: Give me a list of active employees {
2025-08-21T11:02:16.5848945Z   "service": "workbook-teams-bot",
2025-08-21T11:02:16.5848986Z   "environment": "dev"
2025-08-21T11:02:16.5849008Z }
2025-08-21T11:02:16.5849032Z 11:02:16.565 [[34mdebug[39m]: Input validated and sanitized {
2025-08-21T11:02:16.5849055Z   "service": "workbook-teams-bot",
2025-08-21T11:02:16.5849076Z   "environment": "dev"
2025-08-21T11:02:16.5849096Z }
2025-08-21T11:02:18.4834355Z 📊 Getting people statistics...
2025-08-21T11:02:18.4873522Z 💾 Cache HIT: resources:complete:all
2025-08-21T11:02:18.6271532Z 📝 Cache SET: resources:stats
2025-08-21T11:02:19.5174467Z 11:02:19.517 [[34mdebug[39m]: Mastra agent response received {
2025-08-21T11:02:19.5175261Z   "service": "workbook-teams-bot",
2025-08-21T11:02:19.5175305Z   "environment": "dev",
2025-08-21T11:02:19.5175328Z   "responseLength": 45,
2025-08-21T11:02:19.5175351Z   "preview": "The database contains 3,615 active employees."
2025-08-21T11:02:19.5175372Z }
2025-08-21T11:02:19.5224994Z 11:02:19.522 [[32minfo[39m]: Performance {
2025-08-21T11:02:19.5225473Z   "service": "workbook-teams-bot",
2025-08-21T11:02:19.5225533Z   "environment": "dev",
2025-08-21T11:02:19.5225608Z   "operation": "mastra_agent_execution",
2025-08-21T11:02:19.5225632Z   "duration": 2967,
2025-08-21T11:02:19.5225655Z   "messageLength": 34,
2025-08-21T11:02:19.5225678Z   "responseLength": 45,
2025-08-21T11:02:19.5225701Z   "type": "performance"
2025-08-21T11:02:19.5225724Z }
2025-08-21T11:02:19.5229965Z 11:02:19.522 [[32minfo[39m]: Give me a list of active employees {
2025-08-21T11:02:19.5230087Z   "service": "workbook-teams-bot",
2025-08-21T11:02:19.5230114Z   "environment": "dev",
2025-08-21T11:02:19.5230142Z   "userId": "29:1gRP1gbb_G2-t18H13dCq0oyX08HtHu0e7PniFRnMIbrVDVM9NJ6cOePkdNdpkapvmR28N82UfaFdx69GG-HDHA",
2025-08-21T11:02:19.5230201Z   "responseLength": 45,
2025-08-21T11:02:19.5230224Z   "type": "bot_message"
2025-08-21T11:02:19.5230244Z }
2025-08-21T11:02:21.6784337Z {"stack":"Error: BatchSpanProcessor: span export failed\n    at /node_modules/@azure/monitor-opentelemetry/node_modules/@opentelemetry/sdk-trace-base/build/src/export/BatchSpanProcessorBase.js:160:29\n    at AzureMonitorTraceExporter.export (/node_modules/@azure/monitor-opentelemetry-exporter/dist/commonjs/export/trace.js:62:13)\n    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)","message":"BatchSpanProcessor: span export failed","name":"Error"} []