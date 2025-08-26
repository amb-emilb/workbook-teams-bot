/**
 * File download routes for Teams integration
 */
import * as restify from 'restify';
import { FileStorageService } from '../services/fileStorage.js';
import { keyVaultService } from '../services/keyVault.js';

let fileStorageService: FileStorageService | null = null;

export async function initializeFileRoutes() {
  try {
    console.log('[FILE STORAGE] Getting PostgreSQL connection string from Key Vault for file storage...');
    const connectionString = await keyVaultService.getSecret('postgres-connection-string');
    
    if (connectionString) {
      fileStorageService = new FileStorageService(connectionString);
      await fileStorageService.initialize();
      console.log('[FILE STORAGE] File storage service initialized with Key Vault connection');
    } else {
      console.log('[FILE STORAGE] No PostgreSQL connection string in Key Vault - file storage disabled');
    }
  } catch (error) {
    console.error('[FILE STORAGE] Failed to initialize file storage service:', error);
    console.log('[FILE STORAGE] File storage disabled due to initialization failure');
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