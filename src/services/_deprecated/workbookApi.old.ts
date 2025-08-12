import https from 'https';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment-based configuration
const NODE_ENV = process.env.NODE_ENV || 'prod';
const isDev = NODE_ENV === 'dev';

// Workbook API Configuration based on environment
const WORKBOOK_API_KEY = isDev ? process.env.WORKBOOK_API_KEY_DEV : process.env.WORKBOOK_API_KEY_PROD;
const WORKBOOK_BASE_URL = isDev ? process.env.WORKBOOK_BASE_URL_DEV : process.env.WORKBOOK_BASE_URL_PROD;
const DATABOARD_ID = isDev ? process.env.DATABOARD_ID_DEV : process.env.DATABOARD_ID_PROD;

console.log(`🌍 Environment: ${NODE_ENV.toUpperCase()}`);
console.log(`🔗 API Base URL: ${WORKBOOK_BASE_URL}`);

// TypeScript interfaces
export interface WorkbookContact {
  Id?: string | number;
  id?: string | number;
  Name?: string;
  CustomerName?: string;
  ContactPerson?: string;
  Email?: string;
  EmailAddress?: string;
  Company?: string;
  Status?: string;
}

export interface ContactStats {
  totalContacts: number;
  activeContacts: number;
  inactiveContacts: number;
  companies: number;
}

export interface DataboardRequest {
  DataboardId: string;
  Parameters: Record<string, string | number | boolean>;
}

// Validate required environment variables
if (!WORKBOOK_API_KEY) {
  throw new Error('❌ WORKBOOK_API_KEY not found in environment variables');
}
if (!WORKBOOK_BASE_URL) {
  throw new Error('❌ WORKBOOK_BASE_URL not found in environment variables');
}
if (!DATABOARD_ID) {
  throw new Error('❌ DATABOARD_ID not found in environment variables');
}

/**
 * Fetch data from Workbook databoard
 */
export async function fetchWorkbookData(parameters: Record<string, string | number | boolean> = {}): Promise<WorkbookContact[]> {
  const requestBody = JSON.stringify({
    DataboardId: DATABOARD_ID,
    Parameters: parameters
  });

  const options = {
    hostname: WORKBOOK_BASE_URL,
    path: '/report/api/json/reply/DataboardDataRequest',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${WORKBOOK_API_KEY}`,
      'X-HTTP-METHOD-OVERRIDE': 'GET',
      'Content-Length': Buffer.byteLength(requestBody)
    }
  };

  return new Promise<WorkbookContact[]>((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          
          // Extract the actual contact records (skip metadata)
          if (Array.isArray(jsonData) && jsonData.length > 0 && Array.isArray(jsonData[0])) {
            const records: WorkbookContact[] = jsonData[0].slice(1); // Skip first element (metadata)
            resolve(records);
          } else {
            resolve(jsonData as WorkbookContact[]);
          }
        } catch (error) {
          console.error('❌ Failed to parse JSON response');
          console.error('Raw response:', data);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Workbook API request failed:', error);
      reject(error);
    });
    
    req.write(requestBody);
    req.end();
  });
}

/**
 * Search contacts by query string
 */
export async function searchContacts(query = '', limit = 10): Promise<WorkbookContact[]> {
  try {
    const allContacts = await fetchWorkbookData();
    
    if (!query) {
      // Return first N contacts if no query provided
      return allContacts.slice(0, limit);
    }
    
    // Filter contacts based on query (case-insensitive)
    const queryLower = query.toLowerCase();
    const filteredContacts = allContacts.filter((contact: WorkbookContact) => {
      if (!contact) {return false;}
      
      // Search in common fields
      const searchableFields: string[] = [
        contact.Name ?? '',
        contact.Email ?? '',
        contact.Company ?? '',
        contact.CustomerName ?? '',
        contact.ContactPerson ?? '',
        contact.EmailAddress ?? ''
      ];
      
      return searchableFields.some(field => 
        field.toString().toLowerCase().includes(queryLower)
      );
    });
    
    return filteredContacts.slice(0, limit);
  } catch (error) {
    console.error('❌ Error searching contacts:', error);
    throw error;
  }
}

/**
 * Get contact statistics
 */
export async function getContactStats(): Promise<ContactStats> {
  try {
    const allContacts = await fetchWorkbookData();
    
    return {
      totalContacts: allContacts.length,
      activeContacts: allContacts.filter((c: WorkbookContact) => c.Status === 'Active').length,
      inactiveContacts: allContacts.filter((c: WorkbookContact) => c.Status === 'Inactive').length,
      companies: [...new Set(allContacts.map((c: WorkbookContact) => c.Company ?? c.CustomerName).filter(Boolean))].length
    };
  } catch (error) {
    console.error('❌ Error getting contact stats:', error);
    throw error;
  }
}