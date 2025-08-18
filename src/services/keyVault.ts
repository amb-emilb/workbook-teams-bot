import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

/**
 * Azure Key Vault client for secure secrets management
 * Uses Managed Identity in production, Azure CLI auth in development
 */
class KeyVaultService {
  private client: SecretClient;
  private keyVaultUrl: string;

  constructor() {
    // Get Key Vault name from environment variable set by ARM template
    const keyVaultName = process.env.KEY_VAULT_NAME || 'workbook-bot-kv-3821';
    this.keyVaultUrl = `https://${keyVaultName}.vault.azure.net/`;
        
    // Use DefaultAzureCredential which works both locally (with Azure CLI) 
    // and in production (with Managed Identity)
    const credential = new DefaultAzureCredential();
    this.client = new SecretClient(this.keyVaultUrl, credential);
  }

  /**
     * Get a secret value from Key Vault or environment variables
     * Falls back to environment variables in development mode
     */
  async getSecret(secretName: string): Promise<string> {
    // Map secret names to environment variable names
    const envVarMapping: Record<string, string> = {
      'openai-api-key': 'OPENAI_API_KEY',
      'microsoft-app-id': 'BotAppId',
      'microsoft-app-password': 'BotAppPassword',
      'workbook-api-key-dev': 'WORKBOOK_API_KEY_DEV',
      'workbook-api-key-prod': 'WORKBOOK_API_KEY_PROD',
      'workbook-password-dev': 'WORKBOOK_PASSWORD_DEV',
      'workbook-password-prod': 'WORKBOOK_PASSWORD_PROD'
    };

    // In development mode or when Key Vault is unavailable, use environment variables
    const isLocalDev = process.env.NODE_ENV === 'dev' && process.env.OPENAI_API_KEY;
    
    if (isLocalDev && envVarMapping[secretName]) {
      const envVar = envVarMapping[secretName];
      const envValue = process.env[envVar];
      
      if (envValue) {
        console.log(`Using environment variable for secret: ${secretName} (from ${envVar})`);
        return envValue;
      }
    }

    try {
      console.log(`Retrieving secret from Key Vault: ${secretName}`);
      const secret = await this.client.getSecret(secretName);
            
      if (!secret.value) {
        throw new Error(`Secret ${secretName} has no value`);
      }
            
      console.log(`Successfully retrieved secret from Key Vault: ${secretName}`);
      return secret.value;
    } catch (error) {
      // If Key Vault fails and we have a fallback env var, use it
      if (envVarMapping[secretName]) {
        const envVar = envVarMapping[secretName];
        const envValue = process.env[envVar];
        
        if (envValue) {
          console.log(`Key Vault failed, falling back to environment variable: ${secretName} (from ${envVar})`);
          return envValue;
        }
      }
      
      console.error(`Failed to retrieve secret ${secretName}:`, error);
      throw new Error(`Failed to retrieve secret ${secretName}: ${error}`);
    }
  }

  /**
     * Get multiple secrets at once
     */
  async getSecrets(secretNames: string[]): Promise<Record<string, string>> {
    const secrets: Record<string, string> = {};
        
    for (const name of secretNames) {
      secrets[name] = await this.getSecret(name);
    }
        
    return secrets;
  }
}

// Export singleton instance
export const keyVaultService = new KeyVaultService();