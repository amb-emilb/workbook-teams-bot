/**
 * Workbook Resource Type IDs
 * Based on actual CRM data structure analysis
 */

export const ResourceTypes = {
  COMPANY: 1,           // Ambition A/S (the owner company) - 1 resource
  EMPLOYEE: 2,          // Internal employees at Ambition - 62 resources
  CLIENT: 3,            // Actual clients/customers - 780 resources
  SUPPLIER: 4,          // Suppliers/vendors (e.g. Adobe) - 720 resources
  PROSPECT: 6,          // Potential clients - 802 resources
  CONTACT_PERSON: 10    // Contact persons for clients - 1,250 resources
} as const;

export const ResourceTypeNames = {
  [ResourceTypes.COMPANY]: 'Company',
  [ResourceTypes.EMPLOYEE]: 'Employee',
  [ResourceTypes.CLIENT]: 'Client',
  [ResourceTypes.SUPPLIER]: 'Supplier', 
  [ResourceTypes.PROSPECT]: 'Prospect',
  [ResourceTypes.CONTACT_PERSON]: 'Contact Person'
} as const;

// Groups for filtering
export const BusinessEntityTypes = [
  ResourceTypes.CLIENT,
  ResourceTypes.PROSPECT
]; // 780 + 802 = 1,582 business entities

export const PersonTypes = [
  ResourceTypes.EMPLOYEE,
  ResourceTypes.CONTACT_PERSON
]; // 62 + 1,250 = 1,312 people

// Customer Companies (excludes our own company to avoid confusion)
// When users ask for "companies" they mean CLIENT companies only
// Prospects and suppliers must be explicitly requested
export const AllCompanyTypes = [
  ResourceTypes.CLIENT
] as const; // 780 client companies (excludes prospects, suppliers, and our own company)

// Helper function for type-safe checking (companies = clients only)
export function isCompanyType(typeId: number | undefined): typeId is 3 {
  return typeId !== undefined && AllCompanyTypes.includes(typeId as 3);
}