2025-08-20T12:25:13.0757542Z Incoming request to /api/messages: {
2025-08-20T12:25:13.0757972Z   hasAuthHeader: true,
2025-08-20T12:25:13.0758013Z   activityType: 'message',
2025-08-20T12:25:13.0758040Z   source: '52.112.14.0:24768'
2025-08-20T12:25:13.0758065Z }
2025-08-20T12:25:14.6357045Z Bot Framework Adapter Error: RestError: Authorization has been denied for this request.
2025-08-20T12:25:14.6357950Z  {
2025-08-20T12:25:14.6357989Z   "name": "RestError",
2025-08-20T12:25:14.6358010Z   "statusCode": 401,
2025-08-20T12:25:14.6358030Z   "request": {
2025-08-20T12:25:14.6358051Z     "streamResponseStatusCodes": {},
2025-08-20T12:25:14.6358081Z     "url": "https://smba.trafficmanager.net/emea/f0c6e989-9963-41a2-937b-3c589b802bb9/v3/conversations/a%3A1l1EOtvwHyxkoJnxGo5IGdqKnz0gBxunXiZlPJSCq2gMg4b5SzXsYH_89nQfcyhB2STFwYEwz-rrAZDZPAUWX5tAPde27kd8aV-zIhIWAUqp4XWUCBfI91EJUWTZf_qk5/activities/1755692712369",
2025-08-20T12:25:14.6358099Z     "method": "POST",
2025-08-20T12:25:14.6358117Z     "headers": {
2025-08-20T12:25:14.6358137Z       "_headersMap": {
2025-08-20T12:25:14.6358177Z         "content-type": "application/json; charset=utf-8",
2025-08-20T12:25:14.6358198Z         "x-ms-conversation-id": "REDACTED",
2025-08-20T12:25:14.6358218Z         "accept": "*/*",
2025-08-20T12:25:14.6358242Z         "user-agent": "Microsoft-BotFramework/3.1 BotBuilder/4.23.2 (Node.js,Version=v20.19.3; Linux 5.15.182.1-1.cm2; x64)",
2025-08-20T12:25:14.6358261Z         "authorization": "REDACTED"
2025-08-20T12:25:14.6358279Z       }
2025-08-20T12:25:14.6358296Z     },
2025-08-20T12:25:14.6358315Z     "withCredentials": false,
2025-08-20T12:25:14.6358334Z     "timeout": 0,
2025-08-20T12:25:14.6358354Z     "requestId": "ef9bde17-29c2-44af-8939-d5e3b3d67a65"
2025-08-20T12:25:14.6358373Z   },
2025-08-20T12:25:14.6358406Z   "details": {
2025-08-20T12:25:14.6358429Z     "message": "Authorization has been denied for this request."
2025-08-20T12:25:14.6358447Z   },
2025-08-20T12:25:14.6358468Z   "message": "Authorization has been denied for this request."
2025-08-20T12:25:14.6358487Z }
2025-08-20T12:25:14.6363624Z Exception (telemetry disabled): RestError: Authorization has been denied for this request.
2025-08-20T12:25:14.6363709Z  {
2025-08-20T12:25:14.6363738Z   "name": "RestError",
2025-08-20T12:25:14.6363761Z   "statusCode": 401,
2025-08-20T12:25:14.6363783Z   "request": {
2025-08-20T12:25:14.6363822Z     "streamResponseStatusCodes": {},
2025-08-20T12:25:14.6363858Z     "url": "https://smba.trafficmanager.net/emea/f0c6e989-9963-41a2-937b-3c589b802bb9/v3/conversations/a%3A1l1EOtvwHyxkoJnxGo5IGdqKnz0gBxunXiZlPJSCq2gMg4b5SzXsYH_89nQfcyhB2STFwYEwz-rrAZDZPAUWX5tAPde27kd8aV-zIhIWAUqp4XWUCBfI91EJUWTZf_qk5/activities/1755692712369",
2025-08-20T12:25:14.6363882Z     "method": "POST",
2025-08-20T12:25:14.6363906Z     "headers": {
2025-08-20T12:25:14.6363928Z       "_headersMap": {
2025-08-20T12:25:14.6363954Z         "content-type": "application/json; charset=utf-8",
2025-08-20T12:25:14.6363980Z         "x-ms-conversation-id": "REDACTED",
2025-08-20T12:25:14.6364004Z         "accept": "*/*",
2025-08-20T12:25:14.6364032Z         "user-agent": "Microsoft-BotFramework/3.1 BotBuilder/4.23.2 (Node.js,Version=v20.19.3; Linux 5.15.182.1-1.cm2; x64)",
2025-08-20T12:25:14.6364054Z         "authorization": "REDACTED"
2025-08-20T12:25:14.6364084Z       }
2025-08-20T12:25:14.6364103Z     },
2025-08-20T12:25:14.6364124Z     "withCredentials": false,
2025-08-20T12:25:14.6364143Z     "timeout": 0,
2025-08-20T12:25:14.6364166Z     "requestId": "ef9bde17-29c2-44af-8939-d5e3b3d67a65"
2025-08-20T12:25:14.6364188Z   },
2025-08-20T12:25:14.6364209Z   "details": {
2025-08-20T12:25:14.6364236Z     "message": "Authorization has been denied for this request."
2025-08-20T12:25:14.6364257Z   },
2025-08-20T12:25:14.6364281Z   "message": "Authorization has been denied for this request."
2025-08-20T12:25:14.6364303Z }
2025-08-20T12:25:15.3462569Z Error processing bot message: Error: BotFrameworkAdapter.processActivity(): 500 ERROR
2025-08-20T12:25:15.3462845Z  RestError: Authorization has been denied for this request.
2025-08-20T12:25:15.3463191Z     at handleErrorResponse (/node_modules/@azure/core-http/dist/index.js:3149:19)
2025-08-20T12:25:15.3463220Z     at /node_modules/@azure/core-http/dist/index.js:3085:49
2025-08-20T12:25:15.3463247Z     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-08-20T12:25:15.3463274Z     at async ThrottlingRetryPolicy.sendRequest (/node_modules/@azure/core-http/dist/index.js:4460:26)
2025-08-20T12:25:15.3463303Z     at async ConnectorClient.sendOperationRequest (/node_modules/@azure/core-http/dist/index.js:4889:31)
2025-08-20T12:25:15.3463331Z     at BotFrameworkAdapter.<anonymous> (/node_modules/botbuilder/lib/botFrameworkAdapter.js:764:27)
2025-08-20T12:25:15.3463395Z     at Generator.throw (<anonymous>)
2025-08-20T12:25:15.3463423Z     at rejected (/node_modules/botbuilder/lib/botFrameworkAdapter.js:36:65)
2025-08-20T12:25:15.3463450Z     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-08-20T12:25:15.7267240Z Incoming request to /api/messages: {
2025-08-20T12:25:15.7267849Z   hasAuthHeader: true,
2025-08-20T12:25:15.7267894Z   activityType: 'message',
2025-08-20T12:25:15.7267921Z   source: '52.112.14.0:24768'
2025-08-20T12:25:15.7267941Z }
2025-08-20T12:25:15.7391592Z Bot Framework Adapter Error: RestError: Authorization has been denied for this request.
2025-08-20T12:25:15.7391807Z  {
2025-08-20T12:25:15.7391842Z   "name": "RestError",
2025-08-20T12:25:15.7391870Z   "statusCode": 401,
2025-08-20T12:25:15.7391894Z   "request": {
2025-08-20T12:25:15.7391920Z     "streamResponseStatusCodes": {},
2025-08-20T12:25:15.7392010Z     "url": "https://smba.trafficmanager.net/emea/f0c6e989-9963-41a2-937b-3c589b802bb9/v3/conversations/a%3A1l1EOtvwHyxkoJnxGo5IGdqKnz0gBxunXiZlPJSCq2gMg4b5SzXsYH_89nQfcyhB2STFwYEwz-rrAZDZPAUWX5tAPde27kd8aV-zIhIWAUqp4XWUCBfI91EJUWTZf_qk5/activities/1755692712369",
2025-08-20T12:25:15.7392040Z     "method": "POST",
2025-08-20T12:25:15.7392061Z     "headers": {
2025-08-20T12:25:15.7392083Z       "_headersMap": {
2025-08-20T12:25:15.7392107Z         "content-type": "application/json; charset=utf-8",
2025-08-20T12:25:15.7392129Z         "x-ms-conversation-id": "REDACTED",
2025-08-20T12:25:15.7392153Z         "accept": "*/*",
2025-08-20T12:25:15.7392181Z         "user-agent": "Microsoft-BotFramework/3.1 BotBuilder/4.23.2 (Node.js,Version=v20.19.3; Linux 5.15.182.1-1.cm2; x64)",
2025-08-20T12:25:15.7392205Z         "authorization": "REDACTED"
2025-08-20T12:25:15.7392231Z       }
2025-08-20T12:25:15.7392253Z     },
2025-08-20T12:25:15.7392298Z     "withCredentials": false,
2025-08-20T12:25:15.7392323Z     "timeout": 0,
2025-08-20T12:25:15.7392351Z     "requestId": "96f8b634-f659-476d-a4b6-aca279d5ad70"
2025-08-20T12:25:15.7392377Z   },
2025-08-20T12:25:15.7392402Z   "details": {
2025-08-20T12:25:15.7392428Z     "message": "Authorization has been denied for this request."
2025-08-20T12:25:15.7392453Z   },
2025-08-20T12:25:15.7392479Z   "message": "Authorization has been denied for this request."
2025-08-20T12:25:15.7392502Z }
2025-08-20T12:25:15.7397947Z Exception (telemetry disabled): RestError: Authorization has been denied for this request.
2025-08-20T12:25:15.7398085Z  {
2025-08-20T12:25:15.7398111Z   "name": "RestError",
2025-08-20T12:25:15.7398133Z   "statusCode": 401,
2025-08-20T12:25:15.7398155Z   "request": {
2025-08-20T12:25:15.7398178Z     "streamResponseStatusCodes": {},
2025-08-20T12:25:15.7398210Z     "url": "https://smba.trafficmanager.net/emea/f0c6e989-9963-41a2-937b-3c589b802bb9/v3/conversations/a%3A1l1EOtvwHyxkoJnxGo5IGdqKnz0gBxunXiZlPJSCq2gMg4b5SzXsYH_89nQfcyhB2STFwYEwz-rrAZDZPAUWX5tAPde27kd8aV-zIhIWAUqp4XWUCBfI91EJUWTZf_qk5/activities/1755692712369",
2025-08-20T12:25:15.7398232Z     "method": "POST",
2025-08-20T12:25:15.7398255Z     "headers": {
2025-08-20T12:25:15.7398273Z       "_headersMap": {
2025-08-20T12:25:15.7398301Z         "content-type": "application/json; charset=utf-8",
2025-08-20T12:25:15.7398619Z         "x-ms-conversation-id": "REDACTED",
2025-08-20T12:25:15.7398663Z         "accept": "*/*",
2025-08-20T12:25:15.7398694Z         "user-agent": "Microsoft-BotFramework/3.1 BotBuilder/4.23.2 (Node.js,Version=v20.19.3; Linux 5.15.182.1-1.cm2; x64)",
2025-08-20T12:25:15.7398719Z         "authorization": "REDACTED"
2025-08-20T12:25:15.7398741Z       }
2025-08-20T12:25:15.7398763Z     },
2025-08-20T12:25:15.7398785Z     "withCredentials": false,
2025-08-20T12:25:15.7398806Z     "timeout": 0,
2025-08-20T12:25:15.7398830Z     "requestId": "96f8b634-f659-476d-a4b6-aca279d5ad70"
2025-08-20T12:25:15.7398853Z   },
2025-08-20T12:25:15.7398876Z   "details": {
2025-08-20T12:25:15.7398917Z     "message": "Authorization has been denied for this request."
2025-08-20T12:25:15.7461492Z   },
2025-08-20T12:25:15.7461563Z   "message": "Authorization has been denied for this request."
2025-08-20T12:25:15.7461580Z }
2025-08-20T12:25:15.7499391Z Error processing bot message: Error: BotFrameworkAdapter.processActivity(): 500 ERROR
2025-08-20T12:25:15.7499519Z  RestError: Authorization has been denied for this request.
2025-08-20T12:25:15.7499556Z     at handleErrorResponse (/node_modules/@azure/core-http/dist/index.js:3149:19)
2025-08-20T12:25:15.7499617Z     at /node_modules/@azure/core-http/dist/index.js:3085:49
2025-08-20T12:25:15.7499648Z     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-08-20T12:25:15.7499676Z     at async ThrottlingRetryPolicy.sendRequest (/node_modules/@azure/core-http/dist/index.js:4460:26)
2025-08-20T12:25:15.7499704Z     at async ConnectorClient.sendOperationRequest (/node_modules/@azure/core-http/dist/index.js:4889:31)
2025-08-20T12:25:15.7499731Z     at BotFrameworkAdapter.<anonymous> (/node_modules/botbuilder/lib/botFrameworkAdapter.js:764:27)
2025-08-20T12:25:15.7500083Z     at Generator.throw (<anonymous>)
2025-08-20T12:25:15.7500113Z     at rejected (/node_modules/botbuilder/lib/botFrameworkAdapter.js:36:65)
2025-08-20T12:25:15.7500139Z     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-08-20T12:25:28.7019309Z Health check: Testing Key Vault connectivity...
2025-08-20T12:25:28.7024480Z Retrieving secret from Key Vault: openai-api-key
2025-08-20T12:25:28.7927878Z Successfully retrieved secret from Key Vault: openai-api-key
2025-08-20T12:25:28.7929308Z Retrieving secret from Key Vault: microsoft-app-id
2025-08-20T12:25:28.7932243Z Retrieving secret from Key Vault: microsoft-app-password
2025-08-20T12:25:28.8205421Z Successfully retrieved secret from Key Vault: microsoft-app-password
2025-08-20T12:25:28.8365536Z Successfully retrieved secret from Key Vault: microsoft-app-id
2025-08-20T12:25:28.8369993Z Health check completed: healthy