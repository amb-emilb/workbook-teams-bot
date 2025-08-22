/**
 * Workbook Resource Type IDs
 * Based on analysis of the actual data structure
 */

export const ResourceTypes = {
  OWNER_COMPANY: 1,      // The Workbook instance owner (Ambition A/S)
  EMPLOYEE: 2,           // Internal employees/users (62 resources)
  COMPANY: 3,            // Customer companies/organizations (780 resources)
  CONTACT_PERSON: 4,     // Contact persons at companies (720 resources)
  INTERNATIONAL_COMPANY: 6, // International companies (802 resources)
  EXTERNAL_CONTACT: 10   // External individual contacts (1250 resources)
} as const;

export const ResourceTypeNames = {
  [ResourceTypes.OWNER_COMPANY]: 'Owner Company',
  [ResourceTypes.EMPLOYEE]: 'Employee',
  [ResourceTypes.COMPANY]: 'Company',
  [ResourceTypes.CONTACT_PERSON]: 'Contact Person',
  [ResourceTypes.INTERNATIONAL_COMPANY]: 'International Company',
  [ResourceTypes.EXTERNAL_CONTACT]: 'External Contact'
} as const;

// Groups for filtering
export const CompanyTypes = [
  ResourceTypes.COMPANY,
  ResourceTypes.INTERNATIONAL_COMPANY
];

export const PersonTypes = [
  ResourceTypes.EMPLOYEE,
  ResourceTypes.CONTACT_PERSON,
  ResourceTypes.EXTERNAL_CONTACT
];

export const AllCompanyTypes = [
  ResourceTypes.OWNER_COMPANY,
  ResourceTypes.COMPANY,
  ResourceTypes.INTERNATIONAL_COMPANY
];