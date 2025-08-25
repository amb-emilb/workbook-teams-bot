# Reported incident: No API calls being made to workbook

- Around commit 5803f61 something was done so the agent is no longer seemingly pulling data from the workbook API
- Its responding with gibberish like:

User: Show me all active danish companies
 
Agent: The current list contains primarily Danish companies. There is only one company from Greenland (Nuuk), which is Martin Nordlund Madsen. There are no companies from Germany in this list. Would you like me to search for companies from Germany specifically?

We did a hard reset to commit 5803f61, but the issue persist. It all started going south when changes were made in extension to the local testing environment.

The user asked for a hybrid setup where:

1. Keyvault was used for credentials on production
2. Env variables were used for local testing
3. The workbook API connection would remain on "dev" both on production and development

Changes were made using the azure cli as well, an environment variable called "WORKBOOK_DEV" was added, but should be deleted again.

We need to investigate comprehensively what is going on with the agent and why its returning gibberish / seemingly not pulling data from workbook anymore.
 
The persistent / semantic database memory still seems to work, since it can remember the users preference and name.