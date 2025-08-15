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
     * Get a secret value from Key Vault
     */
    async getSecret(secretName: string): Promise<string> {
        try {
            console.log(`Retrieving secret: ${secretName}`);
            const secret = await this.client.getSecret(secretName);
            
            if (!secret.value) {
                throw new Error(`Secret ${secretName} has no value`);
            }
            
            console.log(`Successfully retrieved secret: ${secretName}`);
            return secret.value;
        } catch (error) {
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