/**
 * File download routes for Teams integration
 */
import * as restify from 'restify';
import { FileStorageService } from '../services/fileStorage.js';
import { keyVaultService } from '../services/keyVault.js';

let fileStorageService: FileStorageService | null = null;

export async function initializeFileRoutes() {
  console.log('[FILE STORAGE] Initializing file storage with Key Vault PostgreSQL connection...');
  
  try {
    // First, try Key Vault connection string
    console.log('[FILE STORAGE] Attempting to retrieve PostgreSQL connection from Key Vault...');
    const startTime = Date.now();
    
    const connectionString = await Promise.race([
      keyVaultService.getSecret('postgres-connection-string'),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Key Vault timeout after 15 seconds')), 15000)
      )
    ]);
    
    const retrievalTime = Date.now() - startTime;
    console.log(`[FILE STORAGE] Successfully retrieved PostgreSQL connection from Key Vault in ${retrievalTime}ms`);
    
    if (connectionString) {
      console.log('[FILE STORAGE] Initializing FileStorageService with Key Vault connection...');
      const initStartTime = Date.now();
      
      fileStorageService = new FileStorageService(connectionString);
      await fileStorageService.initialize();
      
      const initTime = Date.now() - initStartTime;
      console.log(`[FILE STORAGE] SUCCESS: PostgreSQL file storage initialized with Key Vault connection in ${initTime}ms`);
    } else {
      console.warn('[FILE STORAGE] Key Vault returned empty PostgreSQL connection string');
      console.log('[FILE STORAGE] File storage disabled - no connection string available');
    }
    
  } catch (error) {
    console.error('[FILE STORAGE] ERROR: Failed to get PostgreSQL connection from Key Vault:', error);
    console.log('[FILE STORAGE] Falling back to environment variable...');
    
    // Fallback to environment variable
    const envConnectionString = process.env.POSTGRES_CONNECTION_STRING;
    if (envConnectionString) {
      try {
        console.log('[FILE STORAGE] Attempting fallback initialization with environment variable...');
        fileStorageService = new FileStorageService(envConnectionString);
        await fileStorageService.initialize();
        console.log('[FILE STORAGE] FALLBACK SUCCESS: File storage initialized with environment variable');
      } catch (fallbackError) {
        console.error('[FILE STORAGE] FALLBACK FAILED: Environment variable initialization also failed:', fallbackError);
        console.log('[FILE STORAGE] File storage completely disabled - both Key Vault and environment variable failed');
      }
    } else {
      console.warn('[FILE STORAGE] No fallback environment variable available (POSTGRES_CONNECTION_STRING)');
      console.log('[FILE STORAGE] File storage disabled - no connection options available');
    }
  }
}

export async function handleFileDownload(req: restify.Request, res: restify.Response) {
  const { fileId } = req.params;

  if (!fileStorageService) {
    res.status(503);
    res.json({ error: 'File storage not available' });
    return;
  }

  if (!fileId || !/^[a-f0-9]{32}$/.test(fileId)) {
    res.status(400);
    res.json({ error: 'Invalid file ID' });
    return;
  }

  try {
    const result = await fileStorageService.getFile(fileId);

    if (!result) {
      res.status(404);
      res.json({ error: 'File not found or expired' });
      return;
    }

    const { file, content } = result;

    // Set headers for file download
    res.setHeader('Content-Type', file.content_type);
    res.setHeader('Content-Length', content.length);
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    // Log the download
    console.log(`📥 File download: ${file.filename} (${content.length} bytes) - ${file.download_count} total downloads`);

    res.send(content);

  } catch (error) {
    console.error('❌ Error serving file:', error);
    res.status(500);
    res.json({ error: 'Failed to serve file' });
  }
}

export async function handleFileList(req: restify.Request, res: restify.Response) {
  if (!fileStorageService) {
    res.status(503);
    res.json({ error: 'File storage not available' });
    return;
  }

  try {
    const files = await fileStorageService.getFileList(50);
    res.json({ files });
  } catch (error) {
    console.error('❌ Error listing files:', error);
    res.status(500);
    res.json({ error: 'Failed to list files' });
  }
}

// Cleanup job - can be called by a scheduled task
export async function cleanupExpiredFiles() {
  if (fileStorageService) {
    return await fileStorageService.cleanupExpiredFiles();
  }
  return 0;
}

export { fileStorageService };