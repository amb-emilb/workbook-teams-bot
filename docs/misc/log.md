2025-08-21T08:30:26.6803077Z       [Symbol(vercel.ai.error.AI_APICallError)]: true
2025-08-21T08:30:26.6803109Z     },
2025-08-21T08:30:26.6803134Z     [Symbol(vercel.ai.error)]: true,
2025-08-21T08:30:26.6803158Z     [Symbol(vercel.ai.error.AI_RetryError)]: true
2025-08-21T08:30:26.6803180Z   }
2025-08-21T08:30:26.6803202Z }
2025-08-21T08:30:37.7510479Z Health check: Testing Key Vault connectivity...
2025-08-21T08:30:37.7511251Z Retrieving secret from Key Vault: openai-api-key
2025-08-21T08:30:37.7952393Z Successfully retrieved secret from Key Vault: openai-api-key
2025-08-21T08:30:37.7953177Z Health check completed: healthyEnding Log Tail of existing logs ---Starting Live Log Stream ---
2025-08-21T08:30:52.1170359Z Incoming request to /api/messages: {
2025-08-21T08:30:52.1170640Z   hasAuthHeader: true,
2025-08-21T08:30:52.1170675Z   activityType: 'message',
2025-08-21T08:30:52.1170698Z   source: '52.112.14.0:9804'
2025-08-21T08:30:52.1170721Z }
2025-08-21T08:30:52.1170760Z azure:identity:warning DefaultAzureCredential => Skipped createDefaultWorkloadIdentityCredential because of an error creating the credential: CredentialUnavailableError: WorkloadIdentityCredential: is unavailable. clientId is a required parameter. In DefaultAzureCredential and ManagedIdentityCredential, this can be provided as an environment variable - "AZURE_CLIENT_ID".
2025-08-21T08:30:52.1170788Z         See the troubleshooting guide for more information: https://aka.ms/azsdk/js/identity/workloadidentitycredential/troubleshoot
2025-08-21T08:30:52.1171325Z azure:core-client:warning The baseUri option for SDK Clients has been deprecated, please use endpoint instead.
2025-08-21T08:30:52.1176027Z azure:core-client:warning The baseUri option for SDK Clients has been deprecated, please use endpoint instead.
2025-08-21T08:30:52.1177933Z azure:core-client:warning The baseUri option for SDK Clients has been deprecated, please use endpoint instead.
2025-08-21T08:30:52.1181382Z azure:identity:warning DefaultAzureCredential => Skipped createDefaultBrokerCredential because of an error creating the credential: Error: Broker for WAM was requested to be enabled, but no native broker was configured. You must install the identity-broker plugin package (`npm install --save @azure/identity-broker`) and enable it by importing `useIdentityPlugin` from `@azure/identity` and calling `useIdentityPlugin(brokerPlugin)` before using `enableBroker`.
2025-08-21T08:30:52.1184295Z azure:identity:warning DefaultAzureCredential => Skipped createDefaultWorkloadIdentityCredential because of an error creating the credential: CredentialUnavailableError: WorkloadIdentityCredential: is unavailable. clientId is a required parameter. In DefaultAzureCredential and ManagedIdentityCredential, this can be provided as an environment variable - "AZURE_CLIENT_ID".
2025-08-21T08:30:52.1184384Z         See the troubleshooting guide for more information: https://aka.ms/azsdk/js/identity/workloadidentitycredential/troubleshoot
2025-08-21T08:30:52.1185864Z azure:core-client:warning The baseUri option for SDK Clients has been deprecated, please use endpoint instead.
2025-08-21T08:30:52.1188294Z azure:core-client:warning The baseUri option for SDK Clients has been deprecated, please use endpoint instead.
2025-08-21T08:30:52.1221790Z azure:core-client:warning The baseUri option for SDK Clients has been deprecated, please use endpoint instead.
2025-08-21T08:30:52.1221899Z azure:identity:warning DefaultAzureCredential => Skipped createDefaultBrokerCredential because of an error creating the credential: Error: Broker for WAM was requested to be enabled, but no native broker was configured. You must install the identity-broker plugin package (`npm install --save @azure/identity-broker`) and enable it by importing `useIdentityPlugin` from `@azure/identity` and calling `useIdentityPlugin(brokerPlugin)` before using `enableBroker`.
2025-08-21T08:30:52.3141262Z 🔄 Bridging Teams AI → Mastra Agent
2025-08-21T08:30:52.3141806Z 📝 User message: test
2025-08-21T08:30:52.3144009Z ✅ Input validated and sanitized
2025-08-21T08:30:59.8069535Z ❌ Error bridging to Mastra agent: MastraError: Failed after 3 attempts. Last error: You exceeded your current quota, please check your plan and billing details. For more information on this error, read the docs: https://platform.openai.com/docs/guides/error-codes/api-errors.
2025-08-21T08:30:59.8071849Z     at MastraLLM.__text (file:///node_modules/@mastra/core/dist/chunk-SFF2EJEV.js:200:27)
2025-08-21T08:30:59.8071895Z     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-08-21T08:30:59.8071920Z     at async Agent.generate (file:///node_modules/@mastra/core/dist/chunk-OSBHZ3L7.js:3238:23)
2025-08-21T08:30:59.8071943Z     ... 3 lines matching cause stack trace ...
2025-08-21T08:30:59.8071965Z     at async Application.run (/node_modules/@microsoft/teams-ai/lib/Application.js:406:16)
2025-08-21T08:30:59.8071986Z     at async file:///home/site/wwwroot/dist/src/teams/server.js:184:21 {
2025-08-21T08:30:59.8072007Z   id: 'LLM_GENERATE_TEXT_AI_SDK_EXECUTION_FAILED',
2025-08-21T08:30:59.8072033Z   domain: 'LLM',
2025-08-21T08:30:59.8072077Z   category: 'THIRD_PARTY',
2025-08-21T08:30:59.8072097Z   details: {
2025-08-21T08:30:59.8072115Z     modelId: 'gpt-4-turbo',
2025-08-21T08:30:59.8072134Z     modelProvider: 'openai.chat',
2025-08-21T08:30:59.8072156Z     runId: '8bfd5f39-6e65-4330-86ca-9382724b3c81',
2025-08-21T08:30:59.8072175Z     threadId: 'unknown',
2025-08-21T08:30:59.8072193Z     resourceId: 'unknown'
2025-08-21T08:30:59.8072211Z   },
2025-08-21T08:30:59.8072239Z   [cause]: RetryError [AI_RetryError]: Failed after 3 attempts. Last error: You exceeded your current quota, please check your plan and billing details. For more information on this error, read the docs: https://platform.openai.com/docs/guides/error-codes/api-errors.
2025-08-21T08:30:59.8072261Z       at _retryWithExponentialBackoff (file:///node_modules/ai/dist/index.mjs:294:13)
2025-08-21T08:30:59.8072291Z       at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-08-21T08:30:59.8072315Z       at async fn (file:///node_modules/ai/dist/index.mjs:4285:32)
2025-08-21T08:30:59.8072337Z       at async file:///node_modules/ai/dist/index.mjs:481:22
2025-08-21T08:30:59.8072360Z       at async MastraLLM.__text (file:///node_modules/@mastra/core/dist/chunk-SFF2EJEV.js:194:22)
2025-08-21T08:30:59.8073031Z       at async Agent.generate (file:///node_modules/@mastra/core/dist/chunk-OSBHZ3L7.js:3238:23)
2025-08-21T08:30:59.8073090Z       at async executeMastraAgent (file:///home/site/wwwroot/dist/src/teams/teamsBot.js:115:26)
2025-08-21T08:30:59.8073114Z       at async Object.handler (file:///home/site/wwwroot/dist/src/teams/teamsBot.js:149:30)
2025-08-21T08:30:59.8073136Z       at async /node_modules/@microsoft/teams-ai/lib/Application.js:493:25
2025-08-21T08:30:59.8073157Z       at async Application.run (/node_modules/@microsoft/teams-ai/lib/Application.js:406:16) {
2025-08-21T08:30:59.8073194Z     cause: undefined,
2025-08-21T08:30:59.8073214Z     reason: 'maxRetriesExceeded',
2025-08-21T08:30:59.8073236Z     errors: [ [APICallError], [APICallError], [APICallError] ],
2025-08-21T08:30:59.8073264Z     lastError: APICallError [AI_APICallError]: You exceeded your current quota, please check your plan and billing details. For more information on this error, read the docs: https://platform.openai.com/docs/guides/error-codes/api-errors.
2025-08-21T08:30:59.8073286Z         at file:///node_modules/@ai-sdk/provider-utils/dist/index.mjs:667:14
2025-08-21T08:30:59.8073308Z         at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-08-21T08:30:59.8073329Z         at async postToApi (file:///node_modules/@ai-sdk/provider-utils/dist/index.mjs:567:28)
2025-08-21T08:30:59.8073354Z         at async OpenAIChatLanguageModel.doGenerate (file:///node_modules/@ai-sdk/openai/dist/index.mjs:622:9)
2025-08-21T08:30:59.8073387Z         at async fn (file:///node_modules/ai/dist/index.mjs:4329:30)
2025-08-21T08:30:59.8073410Z         at async file:///node_modules/ai/dist/index.mjs:481:22
2025-08-21T08:30:59.8073432Z         at async _retryWithExponentialBackoff (file:///node_modules/ai/dist/index.mjs:282:12)
2025-08-21T08:30:59.8073456Z         at async fn (file:///node_modules/ai/dist/index.mjs:4285:32)
2025-08-21T08:30:59.8073479Z         at async file:///node_modules/ai/dist/index.mjs:481:22
2025-08-21T08:30:59.8073504Z         at async MastraLLM.__text (file:///node_modules/@mastra/core/dist/chunk-SFF2EJEV.js:194:22) {
2025-08-21T08:30:59.8073526Z       cause: undefined,
2025-08-21T08:30:59.8073551Z       url: 'https://api.openai.com/v1/chat/completions',
2025-08-21T08:30:59.8073574Z       requestBodyValues: [Object],
2025-08-21T08:30:59.8073596Z       statusCode: 429,
2025-08-21T08:30:59.8073629Z       responseHeaders: [Object],
2025-08-21T08:30:59.8073653Z       responseBody: '{\n' +
2025-08-21T08:30:59.8073679Z         '    "error": {\n' +
2025-08-21T08:30:59.8073710Z         '        "message": "You exceeded your current quota, please check your plan and billing details. For more information on this error, read the docs: https://platform.openai.com/docs/guides/error-codes/api-errors.",\n' +
2025-08-21T08:30:59.8073734Z         '        "type": "insufficient_quota",\n' +
2025-08-21T08:30:59.8073757Z         '        "param": null,\n' +
2025-08-21T08:30:59.8073782Z         '        "code": "insufficient_quota"\n' +
2025-08-21T08:30:59.8073803Z         '    }\n' +
2025-08-21T08:30:59.8073826Z         '}\n',
2025-08-21T08:30:59.8073848Z       isRetryable: true,
2025-08-21T08:30:59.8073879Z       data: [Object],
2025-08-21T08:30:59.8073904Z       [Symbol(vercel.ai.error)]: true,
2025-08-21T08:30:59.8074126Z       [Symbol(vercel.ai.error.AI_APICallError)]: true
2025-08-21T08:30:59.8074157Z     },
2025-08-21T08:30:59.8074182Z     [Symbol(vercel.ai.error)]: true,
2025-08-21T08:30:59.8074207Z     [Symbol(vercel.ai.error.AI_RetryError)]: true
2025-08-21T08:30:59.8074230Z   }
2025-08-21T08:30:59.8074252Z }
2025-08-21T08:31:37.7586818Z Health check: Testing Key Vault connectivity...
2025-08-21T08:31:37.7598578Z Retrieving secret from Key Vault: openai-api-key
2025-08-21T08:31:37.7901037Z Successfully retrieved secret from Key Vault: openai-api-key
2025-08-21T08:31:37.7901261Z Health check completed: healthy
2025-08-21T08:32:37.7624123Z Health check: Testing Key Vault connectivity...
2025-08-21T08:32:37.7624614Z Retrieving secret from Key Vault: openai-api-key
2025-08-21T08:32:37.8534886Z Successfully retrieved secret from Key Vault: openai-api-key
2025-08-21T08:32:37.8537546Z Health check completed: healthy
2025-08-21T08:33:38.2067869Z Health check: Testing Key Vault connectivity...
2025-08-21T08:33:38.2068245Z Retrieving secret from Key Vault: openai-api-key
2025-08-21T08:33:38.2068281Z Successfully retrieved secret from Key Vault: openai-api-key
2025-08-21T08:33:38.2068311Z Health check completed: healthy
2025-08-21T08:34:37.7541185Z Health check: Testing Key Vault connectivity...
2025-08-21T08:34:37.7556514Z Retrieving secret from Key Vault: openai-api-key
2025-08-21T08:34:37.8500445Z Successfully retrieved secret from Key Vault: openai-api-key
2025-08-21T08:34:37.8501355Z Health check completed: healthy
2025-08-21T08:35:37.7650380Z Health check: Testing Key Vault connectivity...
2025-08-21T08:35:37.7652754Z Retrieving secret from Key Vault: openai-api-key
2025-08-21T08:35:37.8165207Z Successfully retrieved secret from Key Vault: openai-api-key
2025-08-21T08:35:37.8180017Z Health check completed: healthy
2025-08-21T08:36:37.9209054Z Health check: Testing Key Vault connectivity...
2025-08-21T08:36:37.9210283Z Retrieving secret from Key Vault: openai-api-key
2025-08-21T08:36:38.1146343Z Successfully retrieved secret from Key Vault: openai-api-key
2025-08-21T08:36:38.1160466Z Health check completed: healthy
2025-08-21T08:37:37.9080951Z Health check: Testing Key Vault connectivity...
2025-08-21T08:37:37.9081222Z Retrieving secret from Key Vault: openai-api-key
2025-08-21T08:37:37.9509740Z Successfully retrieved secret from Key Vault: openai-api-key
2025-08-21T08:37:37.9512057Z Health check completed: healthy
2025-08-21T08:38:37.7563382Z Health check: Testing Key Vault connectivity...
2025-08-21T08:38:37.7572710Z Retrieving secret from Key Vault: openai-api-key
2025-08-21T08:38:37.8890528Z Successfully retrieved secret from Key Vault: openai-api-key
2025-08-21T08:38:37.8891737Z Health check completed: healthy
2025-08-21T08:39:37.7494821Z Health check: Testing Key Vault connectivity...
2025-08-21T08:39:37.7503247Z Retrieving secret from Key Vault: openai-api-key
2025-08-21T08:39:37.8161073Z Successfully retrieved secret from Key Vault: openai-api-key
2025-08-21T08:39:37.8171719Z Health check completed: healthy
2025-08-21T08:40:37.7515280Z Health check: Testing Key Vault connectivity...
2025-08-21T08:40:37.7526435Z Retrieving secret from Key Vault: openai-api-key
2025-08-21T08:40:37.8968819Z Successfully retrieved secret from Key Vault: openai-api-key
2025-08-21T08:40:37.8970021Z Health check completed: healthy
2025-08-21T08:41:37.7518242Z Health check: Testing Key Vault connectivity...
2025-08-21T08:41:37.7524236Z Retrieving secret from Key Vault: openai-api-key
2025-08-21T08:41:37.7964721Z Successfully retrieved secret from Key Vault: openai-api-key
2025-08-21T08:41:37.7965849Z Health check completed: healthy
2025-08-21T08:42:37.7780014Z Health check: Testing Key Vault connectivity...
2025-08-21T08:42:37.7780434Z Retrieving secret from Key Vault: openai-api-key
2025-08-21T08:42:37.8180191Z Successfully retrieved secret from Key Vault: openai-api-key
2025-08-21T08:42:37.8180557Z Health check completed: healthy
2025-08-21T08:43:37.9146004Z Health check: Testing Key Vault connectivity...
2025-08-21T08:43:37.9146945Z Retrieving secret from Key Vault: openai-api-key
2025-08-21T08:43:38.0250072Z Successfully retrieved secret from Key Vault: openai-api-key
2025-08-21T08:43:38.0251440Z Health check completed: healthy
2025-08-21T08:44:37.7513998Z Health check: Testing Key Vault connectivity...
2025-08-21T08:44:37.7517967Z Retrieving secret from Key Vault: openai-api-key
2025-08-21T08:44:37.7827708Z Successfully retrieved secret from Key Vault: openai-api-key
2025-08-21T08:44:37.7829351Z Health check completed: healthy