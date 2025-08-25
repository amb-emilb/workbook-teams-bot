/**
 * PostgreSQL-based file storage for Teams integration
 * Stores files in database as BLOBs with downloadable URLs
 */
import { Pool } from 'pg';
import crypto from 'crypto';

export interface StoredFile {
  id: string;
  filename: string;
  content_type: string;
  size: number;
  created_at: Date;
  expires_at: Date;
  download_count: number;
  max_downloads?: number;
}

export interface FileUpload {
  filename: string;
  content: string | Buffer;
  content_type: string;
  expires_hours?: number;
  max_downloads?: number;
}

export class FileStorageService {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
  }

  async initialize(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS workbook_file_storage (
        id VARCHAR(32) PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        content_type VARCHAR(100) NOT NULL,
        content BYTEA NOT NULL,
        size INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL,
        download_count INTEGER DEFAULT 0,
        max_downloads INTEGER,
        metadata JSONB DEFAULT '{}'
      );

      CREATE INDEX IF NOT EXISTS idx_workbook_files_expires 
        ON workbook_file_storage(expires_at);
      CREATE INDEX IF NOT EXISTS idx_workbook_files_created 
        ON workbook_file_storage(created_at);
    `;

    await this.pool.query(createTableQuery);
    console.log('� File storage tables initialized');
  }

  async storeFile(upload: FileUpload): Promise<{ fileId: string; downloadUrl: string }> {
    const fileId = crypto.randomBytes(16).toString('hex');
    const content = typeof upload.content === 'string' 
      ? Buffer.from(upload.content, 'utf-8') 
      : upload.content;
    
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (upload.expires_hours || 24));

    const query = `
      INSERT INTO workbook_file_storage 
        (id, filename, content_type, content, size, expires_at, max_downloads)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    await this.pool.query(query, [
      fileId,
      upload.filename,
      upload.content_type,
      content,
      content.length,
      expiresAt,
      upload.max_downloads
    ]);

    console.log(`💾 Stored file ${upload.filename} (${content.length} bytes) with ID: ${fileId}`);

    return {
      fileId,
      downloadUrl: this.getDownloadUrl(fileId)
    };
  }

  async getFile(fileId: string): Promise<{ file: StoredFile; content: Buffer } | null> {
    // Check if file exists and is not expired
    const checkQuery = `
      SELECT id, filename, content_type, size, created_at, expires_at, download_count, max_downloads
      FROM workbook_file_storage 
      WHERE id = $1 AND expires_at > NOW()
    `;

    const checkResult = await this.pool.query(checkQuery, [fileId]);
    
    if (checkResult.rows.length === 0) {
      return null;
    }

    const fileInfo = checkResult.rows[0];

    // Check download limits
    if (fileInfo.max_downloads && fileInfo.download_count >= fileInfo.max_downloads) {
      return null;
    }

    // Get file content and increment download count
    const getQuery = `
      UPDATE workbook_file_storage 
      SET download_count = download_count + 1
      WHERE id = $1
      RETURNING content
    `;

    const result = await this.pool.query(getQuery, [fileId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return {
      file: {
        id: fileInfo.id,
        filename: fileInfo.filename,
        content_type: fileInfo.content_type,
        size: fileInfo.size,
        created_at: fileInfo.created_at,
        expires_at: fileInfo.expires_at,
        download_count: fileInfo.download_count + 1,
        max_downloads: fileInfo.max_downloads
      },
      content: result.rows[0].content
    };
  }

  async cleanupExpiredFiles(): Promise<number> {
    const result = await this.pool.query(
      'DELETE FROM workbook_file_storage WHERE expires_at <= NOW()'
    );
    
    const deletedCount = result.rowCount || 0;
    if (deletedCount > 0) {
      console.log(`🗑️ Cleaned up ${deletedCount} expired files`);
    }
    
    return deletedCount;
  }

  async getFileList(limit: number = 100): Promise<StoredFile[]> {
    const result = await this.pool.query(`
      SELECT id, filename, content_type, size, created_at, expires_at, download_count, max_downloads
      FROM workbook_file_storage 
      WHERE expires_at > NOW()
      ORDER BY created_at DESC 
      LIMIT $1
    `, [limit]);

    return result.rows;
  }

  private getDownloadUrl(fileId: string): string {
    // For development, we'll return a local URL
    // In production, this would be the actual Azure App Service URL
    const baseUrl = process.env.BOT_BASE_URL || 'https://workbook-teams-bot.azurewebsites.net';
    return `${baseUrl}/api/files/${fileId}`;
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}