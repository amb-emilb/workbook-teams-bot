Connected!
2025-08-20T10:29:47  Welcome, you are now connected to log-streaming service.Starting Log Tail -n 10 of existing logs ----/appsvctmp/volatile/logs/runtime/container.log
2025-08-20T10:29:43.7338636Z Wed Aug 20 10:29:43 UTC 2025 running .net core
2025-08-20T10:29:44.5697011Z Startup : 10.29.44.556388
2025-08-20T10:29:44.6031810Z Configure Services : 10.29.44.602982
2025-08-20T10:29:44.8018301Z Configure : 10.29.44.801640
2025-08-20T10:29:45.1828497Z Setting Up Routes : 10.29.45.182660
2025-08-20T10:29:45.9457625Z Exiting Configure : 10.29.45.945604
2025-08-20T10:29:46.0641774Z Hosting environment: Production
2025-08-20T10:29:46.0642463Z Content root path: /opt/Kudu
2025-08-20T10:29:46.0643484Z Now listening on: http://0.0.0.0:8181
2025-08-20T10:29:46.0643609Z Application started. Press Ctrl+C to shut down.Ending Log Tail of existing logs ---Starting Live Log Stream ---
2025-08-20T10:30:04.4844351Z    _____
2025-08-20T10:30:04.4846301Z   /  _  \ __________ _________   ____
2025-08-20T10:30:04.4846384Z  /  /_\  \\___   /  |  \_  __ \_/ __ \
2025-08-20T10:30:04.4846418Z /    |    \/    /|  |  /|  | \/\  ___/
2025-08-20T10:30:04.4846488Z \____|__  /_____ \____/ |__|    \___  >
2025-08-20T10:30:04.4846526Z         \/      \/                  \/
2025-08-20T10:30:04.4846555Z A P P   S E R V I C E   O N   L I N U X
2025-08-20T10:30:04.4846589Z
2025-08-20T10:30:04.4846627Z Documentation: http://aka.ms/webapp-linux
2025-08-20T10:30:04.4846657Z NodeJS quickstart: https://aka.ms/node-qs
2025-08-20T10:30:04.4846685Z NodeJS Version : v20.19.3
2025-08-20T10:30:04.4846745Z Note: Any data outside '/home' is not persisted
2025-08-20T10:30:04.4846772Z
2025-08-20T10:30:05.4334492Z Starting OpenBSD Secure Shell server: sshd.
2025-08-20T10:30:05.4668032Z WEBSITES_INCLUDE_CLOUD_CERTS is not set to true.
2025-08-20T10:30:05.5123792Z Updating certificates in /etc/ssl/certs...
2025-08-20T10:30:11.1012674Z rehash: warning: skipping ca-certificates.crt,it does not contain exactly one certificate or CRL
2025-08-20T10:30:11.1188617Z 4 added, 0 removed; done.
2025-08-20T10:30:11.1210340Z Running hooks in /etc/ca-certificates/update.d...
2025-08-20T10:30:11.1261936Z done.
2025-08-20T10:30:11.1433798Z CA certificates copied and updated successfully.
2025-08-20T10:30:12.1947835Z Starting periodic command scheduler: cron.
2025-08-20T10:30:12.5172260Z Found build manifest file at '/home/site/wwwroot/oryx-manifest.toml'. Deserializing it...
2025-08-20T10:30:12.5232508Z Could not find operation ID in manifest. Generating an operation id...
2025-08-20T10:30:12.5232800Z Build Operation ID: 4faa2d8c-3960-4bd8-9fe9-a9ccb6859f89
2025-08-20T10:30:13.1414206Z Environment Variables for Application Insight's IPA Codeless Configuration exists..
2025-08-20T10:30:13.1450545Z Writing output script to '/opt/startup/startup.sh'
2025-08-20T10:30:13.3589221Z Running #!/bin/sh
2025-08-20T10:30:13.3589939Z
2025-08-20T10:30:13.3590056Z # Enter the source directory to make sure the script runs where the user expects
2025-08-20T10:30:13.3590106Z cd "/home/site/wwwroot"
2025-08-20T10:30:13.3590136Z
2025-08-20T10:30:13.3590167Z export NODE_PATH=/usr/local/lib/node_modules:$NODE_PATH
2025-08-20T10:30:13.3590198Z if [ -z "$PORT" ]; then
2025-08-20T10:30:13.3590225Z 		export PORT=8080
2025-08-20T10:30:13.3590265Z fi
2025-08-20T10:30:13.3590293Z
2025-08-20T10:30:13.3590322Z echo Found tar.gz based node_modules.
2025-08-20T10:30:13.3590354Z extractionCommand="tar -xzf node_modules.tar.gz -C /node_modules"
2025-08-20T10:30:13.3590384Z echo "Removing existing modules directory from root..."
2025-08-20T10:30:13.3590413Z rm -fr /node_modules
2025-08-20T10:30:13.3590440Z mkdir -p /node_modules
2025-08-20T10:30:13.3590477Z echo Extracting modules...
2025-08-20T10:30:13.3590508Z $extractionCommand
2025-08-20T10:30:13.3590556Z export NODE_PATH="/node_modules":$NODE_PATH
2025-08-20T10:30:13.3590586Z export PATH=/node_modules/.bin:$PATH
2025-08-20T10:30:13.3590614Z if [ -d node_modules ]; then
2025-08-20T10:30:13.3590644Z     mv -f node_modules _del_node_modules || true
2025-08-20T10:30:13.3590679Z fi
2025-08-20T10:30:13.3590707Z
2025-08-20T10:30:13.3590736Z if [ -d /node_modules ]; then
2025-08-20T10:30:13.3590765Z     ln -sfn /node_modules ./node_modules
2025-08-20T10:30:13.3590792Z fi
2025-08-20T10:30:13.3590818Z
2025-08-20T10:30:13.3590845Z echo "Done."
2025-08-20T10:30:13.3637899Z PATH="$PATH:/home/site/wwwroot" npm start
2025-08-20T10:30:13.3651313Z Found tar.gz based node_modules.
2025-08-20T10:30:13.3651663Z Removing existing modules directory from root...
2025-08-20T10:30:13.3872022Z Extracting modules...
2025-08-20T10:30:30.4544456Z Done.
2025-08-20T10:30:36.3870289Z npm info using npm@10.9.2
2025-08-20T10:30:36.3874367Z npm info using node@v20.19.3
2025-08-20T10:30:36.5124074Z
2025-08-20T10:30:36.5124568Z > workbook-teams-agent@1.0.0 start
2025-08-20T10:30:36.5124657Z > node dist/src/teams/index.js
2025-08-20T10:30:36.5124692Z
2025-08-20T10:30:50.6318462Z [dotenv@17.2.1] injecting env (0) from .env -- tip: ⚙️  suppress all logs with { quiet: true }
2025-08-20T10:30:53.2873331Z [dotenv@17.2.1] injecting env (0) from .env -- tip: 📡 version env with Radar: https://dotenvx.com/radar
2025-08-20T10:30:53.3489217Z Error: @opentelemetry/api: Attempted duplicate registration of API: propagation
2025-08-20T10:30:53.3489665Z     at registerGlobal (/node_modules/@opentelemetry/api/build/src/internal/global-utils.js:32:21)
2025-08-20T10:30:53.3489728Z     at PropagationAPI.setGlobalPropagator (/node_modules/@opentelemetry/api/build/src/api/propagation.js:52:50)
2025-08-20T10:30:53.3489785Z     at setupPropagator (/node_modules/@azure/monitor-opentelemetry/node_modules/@opentelemetry/sdk-trace-node/build/src/NodeTracerProvider.js:45:27)
2025-08-20T10:30:53.3489886Z     at NodeTracerProvider.register (/node_modules/@azure/monitor-opentelemetry/node_modules/@opentelemetry/sdk-trace-node/build/src/NodeTracerProvider.js:76:9)
2025-08-20T10:30:53.3489931Z     at NodeSDK.start (/node_modules/@azure/monitor-opentelemetry/node_modules/@opentelemetry/sdk-node/build/src/sdk.js:243:34)
2025-08-20T10:30:53.3489968Z     at useAzureMonitor (/node_modules/@azure/monitor-opentelemetry/dist/commonjs/index.js:88:9)
2025-08-20T10:30:53.3490001Z     at useAzureMonitor (/node_modules/applicationinsights/out/src/main.js:50:49)
2025-08-20T10:30:53.3490037Z     at TelemetryClient.initialize (/node_modules/applicationinsights/out/src/shim/telemetryClient.js:58:40)
2025-08-20T10:30:53.3490093Z     at Module.start (/node_modules/applicationinsights/out/src/shim/applicationinsights.js:71:35)
2025-08-20T10:30:53.3490133Z     at initializeTelemetry (file:///home/site/wwwroot/dist/src/utils/telemetry.js:33:21) []
2025-08-20T10:30:53.3565215Z Extended metrics are no longer supported. Please reference the Azure Monitor OpenTelemetry Migration Doc for more information. If this functionality is required, please revert to Application Insights 2.X SDK. []
2025-08-20T10:30:53.3603131Z Failed to initialize Application Insights: TypeError: Cannot read properties of undefined (reading 'context')
2025-08-20T10:30:53.3603341Z     at initializeTelemetry (file:///home/site/wwwroot/dist/src/utils/telemetry.js:37:25)
2025-08-20T10:30:53.3603388Z     at file:///home/site/wwwroot/dist/src/teams/server.js:14:1
2025-08-20T10:30:53.3603729Z     at ModuleJob.run (node:internal/modules/esm/module_job:263:25)
2025-08-20T10:30:53.3603778Z     at async ModuleLoader.import (node:internal/modules/esm/loader:540:24)
2025-08-20T10:30:53.3603814Z     at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:117:5)
2025-08-20T10:30:53.3610011Z Initializing server with Key Vault secrets...
2025-08-20T10:30:53.3614133Z Retrieving secret from Key Vault: microsoft-app-id
2025-08-20T10:30:53.3636244Z Retrieving secret from Key Vault: microsoft-app-password
2025-08-20T10:30:53.3642718Z Workbook Teams Bot initialized
2025-08-20T10:30:53.3645155Z Ready to bridge Mastra agent to Microsoft Teams
2025-08-20T10:30:53.3844894Z (node:1141) [DEP0111] DeprecationWarning: Access to process.binding('http_parser') is deprecated.
2025-08-20T10:30:53.3845597Z (Use `node --trace-deprecation ...` to show where the warning was created)
2025-08-20T10:30:53.3848986Z (node:1141) [DEP0111] DeprecationWarning: Access to process.binding('http_parser') is deprecated.
2025-08-20T10:30:59.0979206Z Successfully retrieved secret from Key Vault: microsoft-app-password
2025-08-20T10:30:59.1588011Z Successfully retrieved secret from Key Vault: microsoft-app-id
2025-08-20T10:30:59.1631192Z 🔐 Initializing Teams bot with Key Vault secrets...
2025-08-20T10:30:59.1655206Z Retrieving secret from Key Vault: openai-api-key
2025-08-20T10:30:59.1967514Z Successfully retrieved secret from Key Vault: openai-api-key
2025-08-20T10:30:59.2250287Z Workbook Teams Bot Server Started
2025-08-20T10:30:59.2252279Z ==================================================
2025-08-20T10:30:59.2252815Z Server listening on port: 3978
2025-08-20T10:30:59.2273953Z Health check: http://localhost:3978/health
2025-08-20T10:30:59.2276473Z Bot endpoint: http://localhost:3978/api/messages
2025-08-20T10:30:59.2285114Z Production URL: https://workbook-teams-bot.azurewebsites.net
2025-08-20T10:30:59.2285230Z ==================================================
2025-08-20T10:30:59.2285372Z Environment: dev
2025-08-20T10:30:59.2285410Z Credentials: Loaded from Azure Key Vault
2025-08-20T10:30:59.2285442Z ==================================================
2025-08-20T10:31:12.5015227Z Health check: Testing Key Vault connectivity...
2025-08-20T10:31:12.5016138Z Retrieving secret from Key Vault: openai-api-key
2025-08-20T10:31:12.5370032Z Successfully retrieved secret from Key Vault: openai-api-key
2025-08-20T10:31:12.5372328Z Retrieving secret from Key Vault: microsoft-app-id
2025-08-20T10:31:12.5380079Z Retrieving secret from Key Vault: microsoft-app-password
2025-08-20T10:31:12.5689713Z Successfully retrieved secret from Key Vault: microsoft-app-id
2025-08-20T10:31:12.5775560Z Successfully retrieved secret from Key Vault: microsoft-app-password
2025-08-20T10:31:12.5792233Z Health check completed: healthy
2025-08-20T10:31:24.6926052Z Incoming request to /api/messages: {
2025-08-20T10:31:24.6926693Z   hasAuthHeader: true,
2025-08-20T10:31:24.6926731Z   activityType: 'message',
2025-08-20T10:31:24.6926751Z   source: '52.113.205.24:23814'
2025-08-20T10:31:24.6926770Z }
2025-08-20T10:31:25.5919838Z Bot Framework Adapter Error: ServerError: invalid_client: Error(s): 7000215 - Timestamp: 2025-08-20 10:31:25Z - Description: AADSTS7000215: Invalid client secret provided. Ensure the secret being sent in the request is the client secret value, not the client secret ID, for a secret added to app 'f076c31d-88e0-4d99-9b3f-e91016e1972c'. Trace ID: 1e688726-fccc-419d-9739-1c1c121d4500 Correlation ID: 8c3a783b-49fc-44a8-96f2-79f954da3db7 Timestamp: 2025-08-20 10:31:25Z - Correlation ID: 8c3a783b-49fc-44a8-96f2-79f954da3db7 - Trace ID: 1e688726-fccc-419d-9739-1c1c121d4500
2025-08-20T10:31:25.5920346Z     at ResponseHandler.validateTokenResponse (/node_modules/@azure/msal-node/lib/msal-node.cjs:6729:33)
2025-08-20T10:31:25.5920393Z     at ClientCredentialClient.executeTokenRequest (/node_modules/@azure/msal-node/lib/msal-node.cjs:11320:25)
2025-08-20T10:31:25.5920420Z     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-08-20T10:31:25.5920454Z     at async ConfidentialClientApplication.acquireTokenByClientCredential (/node_modules/@azure/msal-node/lib/msal-node.cjs:11665:20) {
2025-08-20T10:31:25.5920515Z   errorCode: 'invalid_client',
2025-08-20T10:31:25.5920568Z   errorMessage: "Error(s): 7000215 - Timestamp: 2025-08-20 10:31:25Z - Description: AADSTS7000215: Invalid client secret provided. Ensure the secret being sent in the request is the client secret value, not the client secret ID, for a secret added to app 'f076c31d-88e0-4d99-9b3f-e91016e1972c'. Trace ID: 1e688726-fccc-419d-9739-1c1c121d4500 Correlation ID: 8c3a783b-49fc-44a8-96f2-79f954da3db7 Timestamp: 2025-08-20 10:31:25Z - Correlation ID: 8c3a783b-49fc-44a8-96f2-79f954da3db7 - Trace ID: 1e688726-fccc-419d-9739-1c1c121d4500",
2025-08-20T10:31:25.5920595Z   subError: '',
2025-08-20T10:31:25.5920618Z   errorNo: 7000215,
2025-08-20T10:31:25.5920638Z   status: 401,
2025-08-20T10:31:25.5920661Z   correlationId: '8c3a783b-49fc-44a8-96f2-79f954da3db7'
2025-08-20T10:31:25.5920684Z }
2025-08-20T10:31:25.5925915Z Exception (telemetry disabled): ServerError: invalid_client: Error(s): 7000215 - Timestamp: 2025-08-20 10:31:25Z - Description: AADSTS7000215: Invalid client secret provided. Ensure the secret being sent in the request is the client secret value, not the client secret ID, for a secret added to app 'f076c31d-88e0-4d99-9b3f-e91016e1972c'. Trace ID: 1e688726-fccc-419d-9739-1c1c121d4500 Correlation ID: 8c3a783b-49fc-44a8-96f2-79f954da3db7 Timestamp: 2025-08-20 10:31:25Z - Correlation ID: 8c3a783b-49fc-44a8-96f2-79f954da3db7 - Trace ID: 1e688726-fccc-419d-9739-1c1c121d4500
2025-08-20T10:31:25.5926007Z     at ResponseHandler.validateTokenResponse (/node_modules/@azure/msal-node/lib/msal-node.cjs:6729:33)
2025-08-20T10:31:25.5926040Z     at ClientCredentialClient.executeTokenRequest (/node_modules/@azure/msal-node/lib/msal-node.cjs:11320:25)
2025-08-20T10:31:25.5926067Z     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-08-20T10:31:25.5926094Z     at async ConfidentialClientApplication.acquireTokenByClientCredential (/node_modules/@azure/msal-node/lib/msal-node.cjs:11665:20) {
2025-08-20T10:31:25.5926121Z   errorCode: 'invalid_client',
2025-08-20T10:31:25.5926181Z   errorMessage: "Error(s): 7000215 - Timestamp: 2025-08-20 10:31:25Z - Description: AADSTS7000215: Invalid client secret provided. Ensure the secret being sent in the request is the client secret value, not the client secret ID, for a secret added to app 'f076c31d-88e0-4d99-9b3f-e91016e1972c'. Trace ID: 1e688726-fccc-419d-9739-1c1c121d4500 Correlation ID: 8c3a783b-49fc-44a8-96f2-79f954da3db7 Timestamp: 2025-08-20 10:31:25Z - Correlation ID: 8c3a783b-49fc-44a8-96f2-79f954da3db7 - Trace ID: 1e688726-fccc-419d-9739-1c1c121d4500",
2025-08-20T10:31:25.5926206Z   subError: '',
2025-08-20T10:31:25.5926229Z   errorNo: 7000215,
2025-08-20T10:31:25.5926252Z   status: 401,
2025-08-20T10:31:25.5926275Z   correlationId: '8c3a783b-49fc-44a8-96f2-79f954da3db7'
2025-08-20T10:31:25.5926293Z }
2025-08-20T10:31:26.0883486Z Error processing bot message: Error: BotFrameworkAdapter.processActivity(): 500 ERROR
2025-08-20T10:31:26.0883946Z  ServerError: invalid_client: Error(s): 7000215 - Timestamp: 2025-08-20 10:31:26Z - Description: AADSTS7000215: Invalid client secret provided. Ensure the secret being sent in the request is the client secret value, not the client secret ID, for a secret added to app 'f076c31d-88e0-4d99-9b3f-e91016e1972c'. Trace ID: 50359545-9a92-4518-b85e-243a2d563200 Correlation ID: 43afdce0-ebac-4a5e-aedb-2902e9a324ab Timestamp: 2025-08-20 10:31:26Z - Correlation ID: 43afdce0-ebac-4a5e-aedb-2902e9a324ab - Trace ID: 50359545-9a92-4518-b85e-243a2d563200
2025-08-20T10:31:26.0883983Z     at ResponseHandler.validateTokenResponse (/node_modules/@azure/msal-node/lib/msal-node.cjs:6729:33)
2025-08-20T10:31:26.0884075Z     at ClientCredentialClient.executeTokenRequest (/node_modules/@azure/msal-node/lib/msal-node.cjs:11320:25)
2025-08-20T10:31:26.0884098Z     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-08-20T10:31:26.0884123Z     at async ConfidentialClientApplication.acquireTokenByClientCredential (/node_modules/@azure/msal-node/lib/msal-node.cjs:11665:20)
2025-08-20T10:31:26.0884147Z     at BotFrameworkAdapter.<anonymous> (/node_modules/botbuilder/lib/botFrameworkAdapter.js:764:27)
2025-08-20T10:31:26.0884170Z     at Generator.throw (<anonymous>)
2025-08-20T10:31:26.0884192Z     at rejected (/node_modules/botbuilder/lib/botFrameworkAdapter.js:36:65)
2025-08-20T10:31:26.0884218Z     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-08-20T10:31:26.8299004Z Incoming request to /api/messages: {
2025-08-20T10:31:26.8299366Z   hasAuthHeader: true,
2025-08-20T10:31:26.8299408Z   activityType: 'message',
2025-08-20T10:31:26.8299434Z   source: '52.113.205.24:23814'
2025-08-20T10:31:26.8299461Z }
2025-08-20T10:31:27.4614823Z Bot Framework Adapter Error: ServerError: invalid_client: Error(s): 7000215 - Timestamp: 2025-08-20 10:31:27Z - Description: AADSTS7000215: Invalid client secret provided. Ensure the secret being sent in the request is the client secret value, not the client secret ID, for a secret added to app 'f076c31d-88e0-4d99-9b3f-e91016e1972c'. Trace ID: a273c8ce-f4cc-4344-9d24-456560de2e00 Correlation ID: fd5da5ea-340a-452c-8e32-7fe834ab9223 Timestamp: 2025-08-20 10:31:27Z - Correlation ID: fd5da5ea-340a-452c-8e32-7fe834ab9223 - Trace ID: a273c8ce-f4cc-4344-9d24-456560de2e00
2025-08-20T10:31:27.4615808Z     at ResponseHandler.validateTokenResponse (/node_modules/@azure/msal-node/lib/msal-node.cjs:6729:33)
2025-08-20T10:31:27.4615850Z     at ClientCredentialClient.executeTokenRequest (/node_modules/@azure/msal-node/lib/msal-node.cjs:11320:25)
2025-08-20T10:31:27.4615875Z     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-08-20T10:31:27.4616026Z     at async ConfidentialClientApplication.acquireTokenByClientCredential (/node_modules/@azure/msal-node/lib/msal-node.cjs:11665:20) {
2025-08-20T10:31:27.4616065Z   errorCode: 'invalid_client',
2025-08-20T10:31:27.4616125Z   errorMessage: "Error(s): 7000215 - Timestamp: 2025-08-20 10:31:27Z - Description: AADSTS7000215: Invalid client secret provided. Ensure the secret being sent in the request is the client secret value, not the client secret ID, for a secret added to app 'f076c31d-88e0-4d99-9b3f-e91016e1972c'. Trace ID: a273c8ce-f4cc-4344-9d24-456560de2e00 Correlation ID: fd5da5ea-340a-452c-8e32-7fe834ab9223 Timestamp: 2025-08-20 10:31:27Z - Correlation ID: fd5da5ea-340a-452c-8e32-7fe834ab9223 - Trace ID: a273c8ce-f4cc-4344-9d24-456560de2e00",
2025-08-20T10:31:27.4616147Z   subError: '',
2025-08-20T10:31:27.4616166Z   errorNo: 7000215,
2025-08-20T10:31:27.4616184Z   status: 401,
2025-08-20T10:31:27.4616204Z   correlationId: 'fd5da5ea-340a-452c-8e32-7fe834ab9223'
2025-08-20T10:31:27.4616223Z }
2025-08-20T10:31:27.4620824Z Exception (telemetry disabled): ServerError: invalid_client: Error(s): 7000215 - Timestamp: 2025-08-20 10:31:27Z - Description: AADSTS7000215: Invalid client secret provided. Ensure the secret being sent in the request is the client secret value, not the client secret ID, for a secret added to app 'f076c31d-88e0-4d99-9b3f-e91016e1972c'. Trace ID: a273c8ce-f4cc-4344-9d24-456560de2e00 Correlation ID: fd5da5ea-340a-452c-8e32-7fe834ab9223 Timestamp: 2025-08-20 10:31:27Z - Correlation ID: fd5da5ea-340a-452c-8e32-7fe834ab9223 - Trace ID: a273c8ce-f4cc-4344-9d24-456560de2e00
2025-08-20T10:31:27.4620918Z     at ResponseHandler.validateTokenResponse (/node_modules/@azure/msal-node/lib/msal-node.cjs:6729:33)
2025-08-20T10:31:27.4620968Z     at ClientCredentialClient.executeTokenRequest (/node_modules/@azure/msal-node/lib/msal-node.cjs:11320:25)
2025-08-20T10:31:27.4620998Z     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-08-20T10:31:27.4621029Z     at async ConfidentialClientApplication.acquireTokenByClientCredential (/node_modules/@azure/msal-node/lib/msal-node.cjs:11665:20) {
2025-08-20T10:31:27.4621056Z   errorCode: 'invalid_client',
2025-08-20T10:31:27.4621102Z   errorMessage: "Error(s): 7000215 - Timestamp: 2025-08-20 10:31:27Z - Description: AADSTS7000215: Invalid client secret provided. Ensure the secret being sent in the request is the client secret value, not the client secret ID, for a secret added to app 'f076c31d-88e0-4d99-9b3f-e91016e1972c'. Trace ID: a273c8ce-f4cc-4344-9d24-456560de2e00 Correlation ID: fd5da5ea-340a-452c-8e32-7fe834ab9223 Timestamp: 2025-08-20 10:31:27Z - Correlation ID: fd5da5ea-340a-452c-8e32-7fe834ab9223 - Trace ID: a273c8ce-f4cc-4344-9d24-456560de2e00",
2025-08-20T10:31:27.4621127Z   subError: '',
2025-08-20T10:31:27.4621150Z   errorNo: 7000215,
2025-08-20T10:31:27.4621174Z   status: 401,
2025-08-20T10:31:27.4621209Z   correlationId: 'fd5da5ea-340a-452c-8e32-7fe834ab9223'
2025-08-20T10:31:27.4621231Z }
2025-08-20T10:31:27.9088417Z Error processing bot message: Error: BotFrameworkAdapter.processActivity(): 500 ERROR
2025-08-20T10:31:27.9089220Z  ServerError: invalid_client: Error(s): 7000215 - Timestamp: 2025-08-20 10:31:27Z - Description: AADSTS7000215: Invalid client secret provided. Ensure the secret being sent in the request is the client secret value, not the client secret ID, for a secret added to app 'f076c31d-88e0-4d99-9b3f-e91016e1972c'. Trace ID: 20f7f742-470c-4bee-952f-c31123321200 Correlation ID: 49bd59c6-9083-499b-ad04-b50a7e57660c Timestamp: 2025-08-20 10:31:27Z - Correlation ID: 49bd59c6-9083-499b-ad04-b50a7e57660c - Trace ID: 20f7f742-470c-4bee-952f-c31123321200
2025-08-20T10:31:27.9089268Z     at ResponseHandler.validateTokenResponse (/node_modules/@azure/msal-node/lib/msal-node.cjs:6729:33)
2025-08-20T10:31:27.9089303Z     at ClientCredentialClient.executeTokenRequest (/node_modules/@azure/msal-node/lib/msal-node.cjs:11320:25)
2025-08-20T10:31:27.9089331Z     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-08-20T10:31:27.9089420Z     at async ConfidentialClientApplication.acquireTokenByClientCredential (/node_modules/@azure/msal-node/lib/msal-node.cjs:11665:20)
2025-08-20T10:31:27.9089452Z     at BotFrameworkAdapter.<anonymous> (/node_modules/botbuilder/lib/botFrameworkAdapter.js:764:27)
2025-08-20T10:31:27.9089479Z     at Generator.throw (<anonymous>)
2025-08-20T10:31:27.9089507Z     at rejected (/node_modules/botbuilder/lib/botFrameworkAdapter.js:36:65)
2025-08-20T10:31:27.9089535Z     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)