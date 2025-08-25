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

export const AllCompanyTypes = [
  ResourceTypes.COMPANY,
  ResourceTypes.CLIENT,
  ResourceTypes.PROSPECT
] as const; // 1 + 780 + 802 = 1,583 total companies

// Helper function for type-safe checking
export function isCompanyType(typeId: number | undefined): typeId is 1 | 3 | 6 {
  return typeId !== undefined && AllCompanyTypes.includes(typeId as 1 | 3 | 6);
}