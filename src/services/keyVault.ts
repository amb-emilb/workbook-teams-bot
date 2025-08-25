import { ManagedIdentityCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

/**
 * Simplified Azure Key Vault client for secure secrets management
 * PRODUCTION: Key Vault only (no .env fallback)
 * LOCAL DEVELOPMENT: .env only (no Key Vault required)
 */
class KeyVaultService {
  private client: SecretClient | null = null;
  private isProduction: boolean;

  constructor() {
    // Clean environment detection
    this.isProduction = process.env.NODE_ENV === 'production' || !!process.env.WEBSITE_INSTANCE_ID;
    
    if (this.isProduction) {
      // PRODUCTION: Key Vault only
      const keyVaultName = process.env.KEY_VAULT_NAME || 'workbook-bot-kv-3821';
      const keyVaultUrl = `https://${keyVaultName}.vault.azure.net/`;
      
      const credential = new ManagedIdentityCredential({ 
        clientId: process.env.MICROSOFT_APP_ID 
      });
      
      this.client = new SecretClient(keyVaultUrl, credential);
      console.log('� PRODUCTION: Using Key Vault with User-Assigned MSI');
    } else {
      // LOCAL DEVELOPMENT: Environment variables only
      console.log('� LOCAL DEVELOPMENT: Using .env environment variables');
    }
  }

  /**
   * Get a secret value
   * PRODUCTION: From Key Vault only
   * LOCAL DEVELOPMENT: From environment variables only
   */
  async getSecret(secretName: string): Promise<string> {
    // Map secret names to environment variable names
    const envVarMapping: Record<string, string> = {
      'openai-api-key': 'OPENAI_API_KEY',
      'microsoft-app-id': 'MICROSOFT_APP_ID',
      'microsoft-app-password': 'MICROSOFT_APP_PASSWORD',
      'workbook-api-key-dev': 'WORKBOOK_API_KEY_DEV',
      'workbook-api-key-prod': 'WORKBOOK_API_KEY_PROD',
      'workbook-password-dev': 'WORKBOOK_PASSWORD_DEV',
      'workbook-password-prod': 'WORKBOOK_PASSWORD_PROD',
      'postgres-connection-string': 'POSTGRES_CONNECTION_STRING'
    };

    if (this.isProduction) {
      // PRODUCTION: Key Vault only, no fallback
      if (!this.client) {
        throw new Error('Key Vault client not initialized for production');
      }

      try {
        console.log(`🔐 PRODUCTION: Retrieving secret from Key Vault: ${secretName}`);
        const secret = await this.client.getSecret(secretName);
        
        if (!secret.value) {
          throw new Error(`Secret ${secretName} has no value`);
        }
        
        console.log(`✅ Successfully retrieved secret from Key Vault: ${secretName}`);
        return secret.value;
      } catch (error) {
        console.error(`❌ PRODUCTION: Failed to retrieve secret ${secretName} from Key Vault:`, error);
        throw new Error(`Failed to retrieve secret ${secretName} from Key Vault: ${error}`);
      }
    } else {
      // LOCAL DEVELOPMENT: Environment variables only
      const envVar = envVarMapping[secretName];
      if (!envVar) {
        throw new Error(`No environment variable mapping for secret: ${secretName}`);
      }

      const envValue = process.env[envVar];
      if (!envValue) {
        throw new Error(`Environment variable ${envVar} not set for secret: ${secretName}`);
      }

      console.log(`🏠 LOCAL DEV: Using environment variable: ${secretName} (from ${envVar})`);
      return envValue;
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