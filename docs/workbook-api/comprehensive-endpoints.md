# Workbook API Comprehensive Endpoints

Complete documentation for all Workbook REST API endpoints organized by workflow and use case.

> **🔗 Base URL Pattern:** `https://ambition.workbook.net/api/json/reply/`  
> **📝 Endpoint Format:** All endpoints follow `api/json/reply/(EndpointName)`  
> **🔐 Authentication:** Bearer token required: `Authorization: Bearer <YOUR_API_KEY>`  
> **📦 Batch Support:** Some endpoints support batch operations with `[]` suffix  

## ⚠️ **CRITICAL API DOCUMENTATION WARNING**

**Workbook's official API documentation is incomplete and often incorrect.** Key issues discovered:

1. **"Patch" endpoints use POST, not PATCH**: Despite names like `ResourcePatchRequest`, these use `POST` method with a `Patch` parameter containing changes
2. **Missing response structures**: Many endpoints lack documented response formats
3. **Inconsistent parameter types**: Documentation may not match actual API requirements
4. **Method mismatches**: HTTP methods in docs may not reflect actual implementation
5. **GET Methods**: Some GET Methods might require POST with X-HTTP-OVERRIDE: GET

**⚡ Always test endpoints manually before implementing in production code.**

## 🖥️ **WORKBOOK UI CONTEXT**

**Understanding the actual Workbook interface helps map API endpoints to real business workflows:**

### **Main Tabs in Workbook Instance:**
- **📋 Ressourcer (Resources)** - Full list of active/inactive clients and contacts
  - *API Mapping*: `ResourcesRequest`, `ResourceRequest`, `ContactsRequest`, `ResourcePatchRequest`
  - *Usage*: Click on each client to view detailed information, manage status
  
- **💼 Jobs** - Created jobs and projects  
  - *API Mapping*: `BillableJobRequest`, `ClientProjectRetainerKeyFigures`, `JobKeyFiguresNotification`
  - *Usage*: Project management, billing preparation, financial tracking

- **📅 Planning** - Calendar view for scheduling
  - *API Mapping*: `TimeEntryRequest`, `RawTimeEntryRequest`, `MoveTaskToJobRequest`
  - *Usage*: Time tracking, resource scheduling, task management

- **📧 Email Import** - Email integration (not actively used)
  - *API Mapping*: Limited relevance for current implementation

- **📋 Opgaver (Tasks/Jobs Overview)** - Task and job management dashboard
  - *API Mapping*: `FollowUpTimeEntryChecklist`, `TimeEntryApprovalStatistics`, `RaiseFollowUpNotification`
  - *Usage*: Task tracking, approval workflows, team coordination

### **Business Workflow Mapping:**
1. **Client Management** → Ressourcer tab → `ResourcesRequest`/`ResourcePatchRequest` 
2. **Project Tracking** → Jobs tab → `ClientProjectRetainerKeyFigures`
3. **Time Management** → Planning tab → `TimeEntryRequest`/`RawTimeEntryRequest`
4. **Task Oversight** → Opgaver tab → `FollowUpTimeEntryChecklist`

---

## 👥 Contact & Resource Management Workflows

### **Contact Discovery & Search**

#### ContactsRequest
**Get all contacts with advanced filtering**

- **Endpoint:** `api/json/reply/ContactsRequest`
- **Method:** `GET`
- **Description:** List all contacts with additional data and filtering options

##### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| ResourceId | query integer | No | Get contacts for specific resource |
| Active | query boolean | No | Filter by active status |
| ApplicationAccessRoleId | query integer | No | Filter by access role |

##### Response Structure
```json
[{
  "Id": 0,
  "ReportProfileId": 0,
  "AllowChangeTaskStatus": false,
  "ConversationMentionMode": 0,
  "AllowMentionResources": false,
  "AllowCreateTags": false
}]
```

##### Agentic Use Cases
- Replace inefficient databoard queries
- Smart contact filtering and discovery
- Active/inactive contact management

---

#### ContactRequest
**Get single contact details**

- **Endpoint:** `api/json/reply/ContactRequest`
- **Method:** `GET`
- **Description:** Get detailed contact data for specific ID

##### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| Id | path integer | Yes | Contact ID |

##### Response Structure
```json
{
  "Id": 0,
  "ReportProfileId": 0,
  "AllowChangeTaskStatus": false,
  "ConversationMentionMode": 0,
  "AllowMentionResources": false,
  "AllowCreateTags": false
}
```

---

#### ContactsForResourceRequest
**Get contacts for specific resource**

- **Endpoint:** `api/json/reply/ContactsForResourceRequest`
- **Method:** `GET`
- **Description:** Get all contacts belonging to a specific resource

##### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| ResourceId | path integer | Yes | Resource ID |
| Active | query boolean | No | Filter by active status |

---

#### ResourceRequest
**Get single resource by ID**

- **Endpoint:** `api/json/reply/ResourceRequest`
- **Method:** `GET`
- **Description:** Get detailed resource information by ID

##### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| Id | path integer | Yes | Resource ID to retrieve |

##### Response Structure
Contains extensive resource data including personal info, contact details, permissions, and settings:
```json
{
  "Id": 0,
  "Name": "string",
  "TypeId": 0,
  "ResponsibleResourceId": 0,
  "Active": true,
  "Email": "string",
  "Phone1": "string",
  "Initials": "string",
  "Address1": "string",
  "City": "string",
  "Country": "string",
  "UserAccess": true,
  "UserLogin": "string"
}
```

##### Agentic Use Cases
- Individual resource profile lookup
- Validation of resource status and details
- User authentication verification

---

#### ResourcesRequest
**Get multiple resources with advanced filtering**

- **Endpoint:** `api/json/reply/ResourcesRequest`
- **Method:** `GET`
- **Description:** Get filtered list of resources with extensive query options

##### Parameters (Key Filters)
| Name | Type | Required | Description |
|------|------|----------|-------------|
| ResourceType | query array | No | Resource types (default: 2,10 - Employee/Contact) |
| Active | query boolean | No | Show active/inactive resources |
| ApplicationAccessRoleId | query integer | No | Filter by access role |
| ResponsibleResourceId | query array | No | Filter by responsible resource IDs |
| CompanyIds | body Int[] | No | Filter by company IDs |
| Email | query string | No | Filter by email address |
| Union | query boolean | No | Use OR logic instead of AND |
| ContactName | body string | No | Filter by contact name |
| TeamIds | query array | No | Filter by team membership |

##### Response Structure
```json
[{
  "Id": 0,
  "Name": "string",
  "TypeId": 0,
  "Active": true,
  "Email": "string",
  "Initials": "string",
  "ResponsibleResourceId": 0
}]
```

##### Agentic Use Cases
- Advanced resource discovery and filtering
- Team member lookup by various criteria
- Bulk resource validation and analysis
- Contact list generation with specific filters

---

### **Resource Status Management**

#### ResourcePatchRequest
**Update resource information and status**

- **Endpoint:** `api/json/reply/ResourcePatchRequest`
- **Method:** `POST` ⚠️ *Not PATCH despite name*
- **Description:** Modify resource properties including active/inactive status

##### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| Patch | body object | Yes | **Contains the actual patch operations** |
| Patch.Id | body string | Yes | Resource ID to update |
| Patch.Active | body string | No | Set active status ("true"/"false") |
| Patch.Name | body string | No | Resource name |
| Patch.Email | body string | No | Resource email |
| Patch.ResponsibleEmployeeId | body string | No | Responsible employee ID |

##### Request Example
```json
{
  "Patch": {
    "Id": "RESOURCE_ID",
    "Active": "false",
    "ResponsibleEmployeeId": "EMPLOYEE_ID"
  }
}
```

##### Agentic Use Cases
- Mark Inactive Tool implementation
- Automated resource status management
- Bulk resource updates

---

## 📊 Time Entry & Productivity Analytics

### **Individual Resource Analytics**

#### TimeEntryApprovalStatisticsVisualizationRequest
**Get comprehensive time entry statistics for single resource**

- **Endpoint:** `api/json/reply/TimeEntryApprovalStatisticsVisualizationRequest`
- **Method:** `GET`
- **Description:** Detailed productivity analytics for individual resources

##### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| ResourceId | query integer | Yes | Resource ID to analyze |
| StrideTimeType | query integer | Yes | Time measurement type |
| BeginDate | query string | Yes | Analysis start date |
| Stride | query integer | Yes | Time interval |
| Count | query integer | Yes | Number of periods |

##### Response Structure
```json
{
  "ResourceId": 0,
  "Entries": [{
    "BlockNumber": 0,
    "BeginDate": "2024-01-01T00:00:00.000Z",
    "EndDate": "2024-01-01T00:00:00.000Z",
    "TimeRegistrationHours": 40.5,
    "CapacityHours": 37.5,
    "HasApprovedRecords": true,
    "HasNonApprovedRecords": false,
    "HasRejectedRecords": false,
    "ApprovalRequired": true
  }]
}
```

---

### **Team Productivity Analytics**

#### ResourcesTimeEntryApprovalStatisticsVisualizationRequest
**Get time entry statistics for multiple resources**

- **Endpoint:** `api/json/reply/ResourcesTimeEntryApprovalStatisticsVisualizationRequest`
- **Method:** `GET`
- **Description:** Team-wide productivity analysis

##### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| ResourceIds | query Int[] | Yes | Array of Resource IDs |
| StrideTimeType | query integer | Yes | Time measurement type |
| BeginDate | query string | Yes | Analysis start date |
| Stride | query integer | Yes | Time interval |
| Count | query integer | Yes | Number of periods |

##### Response Structure
```json
{
  "Blocks": [{
    "BeginDate": "2024-01-01T00:00:00.000Z",
    "EndDate": "2024-01-01T00:00:00.000Z"
  }],
  "ResourceData": [{
    "ResourceId": 123,
    "Entries": [{
      "BlockNumber": 0,
      "TimeRegistrationHours": 40.5,
      "CapacityHours": 37.5,
      "HasApprovedRecords": true,
      "HasNonApprovedRecords": false,
      "HasRejectedRecords": false,
      "ApprovalRequired": true
    }]
  }]
}
```

---

### **Time Entry Management**

#### RawTimeEntryRequest
**Get detailed time entry records**

- **Endpoint:** `api/json/reply/RawTimeEntryRequest`
- **Method:** `All Verbs`
- **Description:** Complete time entry data with audit trail

##### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| Id | query integer | Yes | Time entry record ID |

##### Response Structure
```json
{
  "Id": 123,
  "ResourceId": 456,
  "JobId": 789,
  "TaskId": 101,
  "ActivityId": 202,
  "RegistrationDate": "2024-01-15T09:00:00.000Z",
  "Hours": 8.5,
  "Description": "Requirements analysis and documentation",
  "Cost": 680.0,
  "Sale": 1275.0,
  "CostMethod": 1,
  "SaleMethod": 1,
  "SequenceNumber": 12345,
  "JournalNumber": 67890,
  "Correction": 0,
  "Public": true,
  "ApprovalStatus": 30,
  "Billable": true,
  "ApprovalEmployeeResourceId": 456,
  "ApprovalEmployeeDate": "2024-01-16T10:00:00.000Z",
  "ApprovalProjectManagerResourceId": 789,
  "ApprovalProjectManagerDate": "2024-01-16T14:00:00.000Z",
  "CreateDate": "2024-01-15T09:05:00.000Z",
  "CreateResourceId": 456,
  "InternalDescription": "Detailed analysis of current state"
}
```

---

#### TimeEntryRequest
**Get visualization-friendly time entry data**

- **Endpoint:** `api/json/reply/TimeEntryRequest`
- **Method:** `GET`
- **Description:** Time entry data optimized for UI display

##### Response Structure
```json
{
  "Id": 123,
  "EmployeeId": 456,
  "SequenceNumber": 12345,
  "Hours": 8.5,
  "Description": "Project analysis work",
  "DescriptionRequired": true,
  "RegistrationDate": "2024-01-15T00:00:00.000Z",
  "ActivityId": 202,
  "ApprovalStatus": 30,
  "Billable": true,
  "CorrectionDate": null,
  "ApprovalRejectResourceId": null,
  "ApprovalRejectComment": null,
  "ApprovalRejectDate": null,
  "JobId": 789,
  "JobName": "Digital Transformation",
  "TaskId": 101,
  "TaskName": "Requirements Analysis",
  "TaskNumber": 1001,
  "CustomerName": "Acme Corporation",
  "TaskResourceHoursBooked": 40.0,
  "TaskResourceHoursUsed": 35.5
}
```

---

## 💼 Project & Job Management

### **Job Analytics & Key Figures**

#### ClientProjectRetainerKeyFiguresVisualizationRequest
**Get comprehensive project financial analytics**

- **Endpoint:** `api/json/reply/ClientProjectRetainerKeyFiguresVisualizationRequest`
- **Method:** `GET`
- **Description:** Complete project profitability analysis

##### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| Id | query int | No | Job ID to analyze |

##### Response Structure (Comprehensive Financial Data)
```json
{
  "Id": 123,
  "CurrencyId": 1,
  "ProjectRetainerJobType": 1,
  "JobReferenceKey": "PRJ-2024-001",
  "StartDate": "2024-01-01T00:00:00.000Z",
  "EndDate": "2024-12-31T00:00:00.000Z",
  "ResponsibleId": 456,
  "CompanyId": 789,
  "ProjectId": 101,
  "ClientId": 202,
  "ProjectIsMixedRetainer": false,
  "MasterJobPriceQuoteOriginalHours": 100.0,
  "MasterJobPriceQuoteOriginalAmount": 15000.0,
  "MasterJobPriceQuoteEstimatedHours": 120.0,
  "MasterJobPriceQuoteEstimatedHoursCost": 9600.0,
  "MasterJobPriceQuoteEstimatedHoursSale": 18000.0,
  "HoursBooked": 85.5,
  "HoursBookedCost": 6840.0,
  "HoursBookedSale": 12825.0,
  "HoursUsed": 80.0,
  "HoursUsedPreviousMonth": 20.0,
  "HoursUsedCurrentMonth": 25.0,
  "InvoicedExternal": 10000.0,
  "InvoicedInternal": 2000.0,
  "TotalExpenseCost": 1500.0,
  "TotalExpenseSale": 2250.0,
  "InvoicedRemaining": 5000.0,
  "Overrun": 5.5
}
```

---

### **Job Workflow Management**

#### JobRequest[]
**Get multiple jobs with complete details**

- **Endpoint:** `api/json/reply/JobRequest[]`
- **Method:** `POST` with header `X-HTTP-Method-Override: GET`
- **Description:** Fetch detailed information for multiple jobs

##### Request Structure
```http
Request URL: https://ambitiondemo.workbook.net/api/json/reply/JobRequest[]
Request Method: POST
Status Code: 200 OK
Headers:
  X-HTTP-Method-Override: GET
```

##### Request Payload
```json
[
  {"Id": 7589},
  {"Id": 8882},
  {"Id": 8968},
  {"Id": 9050},
  {"Id": 9166},
  {"Id": 9178},
  {"Id": 9386},
  {"Id": 9561},
  {"Id": 9567},
  {"Id": 9670},
  {"Id": 9674},
  {"Id": 9896},
  {"Id": 9930},
  {"Id": 9953},
  {"Id": 10054},
  {"Id": 10303},
  {"Id": 10309},
  {"Id": 10400},
  {"Id": 10646},
  {"Id": 10684},
  {"Id": 10783},
  {"Id": 11066},
  {"Id": 101531}
]
```

##### Response Structure (Reduced Example)
```json
[
  {
    "Id": 7589,
    "JobID": 7589,
    "JobName": "AKA - Google Display kampagne - juni 2019",
    "ProjectId": 236,
    "JobStatusId": 4,
    "StatusId": 4,
    "JobTypeId": 3,
    "LeveringsDato": "2019-06-23T13:08:38.783Z",
    "EndDate": "2019-07-02T00:00:00.000Z",
    "ResponsibleId": 53,
    "CompanyId": 1,
    "TeamId": 1,
    "Public": true,
    "CreateDate": "2019-04-24T15:08:15.297Z",
    "Billable": true,
    "CompletePhase": 1,
    "JobTaskActive": true,
    "JobTaskUseAllDays": false,
    "JobResponsibleId": 44,
    "TimeEntryAllowed": 1,
    "StartDate": "2019-04-24T00:00:00.000Z",
    "ContactId": 2531,
    "AdminOnly": false,
    "JournalNumber": 1790,
    "TemplateJob": false,
    "PostDate": "2019-07-02T00:00:00.000Z",
    "SupplementaryTextRequested": true,
    "CompanyDepartmentId": 9,
    "CreateEmployeeId": 44,
    "DebtorId": 776,
    "PostMethodTime": 2,
    "PostMethodMat": 2,
    "PostMethodExt": 2,
    "IsMediaJob": false,
    "FlexTimeRegDisabled": false,
    "PostSpecId": 2,
    "VoucherRegistrationAllowed": false,
    "MaterialRegAllowed": false,
    "RetainerJob": false,
    "JobAccessType": 1,
    "EmployeeAccessType": 0,
    "ExternalUserAccessType": 0,
    "PricelistID": 1,
    "SubsistenceAllowanceAllowed": false,
    "MileageEntryAllowed": false,
    "BillingExternalExpenseType": 1,
    "BillingMileageType": 1,
    "BillingTimeEntryTravelTimeType": 1,
    "ExpenseEntryAllowed": false,
    "MatGrpID": 1,
    "SupportTicketEnable": false,
    "CustomerName": "Akademikernes A-kasse",
    "CustomerId": 798,
    "AdjustmentHandlingTime": 0,
    "AdjustmentHandlingMat": 0,
    "AdjustmentHandlingExtExp": 0,
    "AdjustmentHandlingExtExpCost": 0,
    "AdjustmentHandlingExtraDiscount": 0,
    "CompanyCurrencyId": 1,
    "PurchaseOrderAllowed": true,
    "ProjectRetainerMasterJob": false,
    "ProjectRetainerDeliveryJob": false,
    "CapitalizeSalesInvoice": false,
    "TimeAndMaterial": false,
    "PayWhenPaid": false
  }
  // Additional job objects follow same structure...
]
```

##### Key Job Fields
| Field | Type | Description |
|-------|------|-------------|
| Id/JobID | integer | Unique job identifier |
| JobName | string | Job display name |
| ProjectId | integer | Parent project ID |
| JobStatusId | integer | Job status (1=Open, 4=Complete, 5=Cancelled) |
| Billable | boolean | Whether job is billable |
| TimeEntryAllowed | integer | Time entry permission (1=Allowed, 3=Not allowed) |
| ResponsibleId | integer | Responsible employee ID |
| CustomerName | string | Client company name |
| CustomerId | integer | Client company ID |
| StartDate | datetime | Job start date |
| EndDate | datetime | Job end date |
| CreateDate | datetime | Job creation timestamp |
| JournalNumber | integer | Accounting journal reference |
| CompanyDepartmentId | integer | Department ID |
| DebtorId | integer | Debtor/billing account ID |

---


#### JobsRequest
**Get job IDs for a specific project**

- **Endpoint:** `api/json/reply/JobsRequest?ProjectId=[ProjectId]`
- **Method:** `GET`
- **Description:** Returns list of job IDs associated with a project

##### Request Structure
```http
Request URL: https://ambitiondemo.workbook.net/api/json/reply/JobsRequest?ProjectId=236
Request Method: GET
Status Code: 200 OK
```

##### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| ProjectId | query integer | Yes | Project ID to get jobs for |

##### Response Structure
```json
[
  {"Id": 7589},
  {"Id": 8882},
  {"Id": 8968},
  {"Id": 8969},
  {"Id": 9050},
  {"Id": 9166},
  {"Id": 9178},
  {"Id": 9386},
  {"Id": 9561},
  {"Id": 9567},
  {"Id": 9670},
  {"Id": 9674},
  {"Id": 9896},
  {"Id": 9930},
  {"Id": 9953},
  {"Id": 10054},
  {"Id": 10072},
  {"Id": 10303},
  {"Id": 10309},
  {"Id": 10400},
  {"Id": 10646},
  {"Id": 10684},
  {"Id": 10783},
  {"Id": 10881},
  {"Id": 11021},
  {"Id": 11066},
  {"Id": 11078},
  {"Id": 11086},
  {"Id": 11184},
  {"Id": 101531}
]
```

---

#### JobKeyFigureVisualizationRequest[]
**Get key financial figures for multiple jobs**

- **Endpoint:** `api/json/reply/JobKeyFigureVisualizationRequest[]`
- **Method:** `POST` with header `X-HTTP-Method-Override: GET`
- **Description:** Fetch key performance indicators for jobs

##### Request Structure
```http
Request URL: https://ambitiondemo.workbook.net/api/json/reply/JobKeyFigureVisualizationRequest[]
Request Method: POST
Status Code: 200 OK
Headers:
  X-HTTP-Method-Override: GET
```

---

#### CustomerProjectClientPurchaseOrderValueVisualizationRequest[]
**Get purchase order values for projects**

- **Endpoint:** `api/json/reply/CustomerProjectClientPurchaseOrderValueVisualizationRequest[]`
- **Method:** `POST` with header `X-HTTP-Method-Override: GET`
- **Description:** Returns approved, actual, and invoiced amounts for projects

##### Request Structure
```http
Request URL: https://ambitiondemo.workbook.net/api/json/reply/CustomerProjectClientPurchaseOrderValueVisualizationRequest[]
Request Method: POST
Status Code: 200 OK
Headers:
  X-HTTP-Method-Override: GET
```

##### Request Payload
```json
[{"ProjectId": 236}]
```

##### Response Structure
```json
[
  {
    "Id": 236,
    "ProjectId": 236,
    "CurrencyId": 1,
    "ApprovedPriceQuotes": 1165880.00,
    "Expenditures": 942713.30,
    "Invoiced": 613730.00
  }
]
```

---

#### ETCResourceByJobIdVisualizationRequest[]
**Get Estimate To Complete (ETC) data for jobs**

- **Endpoint:** `api/json/reply/ETCResourceByJobIdVisualizationRequest[]`
- **Method:** `POST` with header `X-HTTP-Method-Override: GET`
- **Description:** Returns hours and amounts for job completion estimates

##### Request Structure
```http
Request URL: https://ambitiondemo.workbook.net/api/json/reply/ETCResourceByJobIdVisualizationRequest[]
Request Method: POST
Status Code: 200 OK
Headers:
  X-HTTP-Method-Override: GET
```

##### Request Payload
```json
[
  {"Id": 7589},
  {"Id": 8882},
  {"Id": 8968},
  {"Id": 8969},
  {"Id": 9050},
  {"Id": 9166},
  {"Id": 9178},
  {"Id": 9386},
  {"Id": 9561},
  {"Id": 9567},
  {"Id": 9670},
  {"Id": 9674},
  {"Id": 9896},
  {"Id": 9930},
  {"Id": 9953},
  {"Id": 10054},
  {"Id": 10072},
  {"Id": 10303},
  {"Id": 10309},
  {"Id": 10400},
  {"Id": 10646},
  {"Id": 10684},
  {"Id": 10783},
  {"Id": 10881},
  {"Id": 11021},
  {"Id": 11066},
  {"Id": 11078},
  {"Id": 11086},
  {"Id": 11184},
  {"Id": 101531}
]
```

##### Response Structure
```json
[
  {
    "Id": 7589,
    "JobId": 7589,
    "Hours": 0,
    "HoursAmount": 0,
    "HoursNotBooked": 0,
    "HoursNotBookedAmount": 0
  }
  // More job ETC data...
]
```

---

### **Task Management**

#### TasksResourcePriceRequest
**Get resource pricing for tasks**

- **Endpoint:** `api/json/reply/TasksResourcePriceRequest`
- **Method:** `POST`
- **Description:** Returns cost and sale prices for task resources

##### Request Payload
```json
{"Ids": [28475]}
```

##### Response Structure
```json
[
  {
    "Id": 28475,
    "TaskId": 18423,
    "Hours": 3.5,
    "Cost": 400.00,
    "Sale": 1500.00,
    "HoursTimeRegistration": 0,
    "IsoCode": "DKK"
  }
]
```

---

#### GetTaskJobIdRequest[]
**Get job IDs for tasks**

- **Endpoint:** `api/json/reply/GetTaskJobIdRequest[]`
- **Method:** `POST` with header `X-HTTP-Method-Override: GET`
- **Description:** Maps task IDs to their parent job IDs

##### Request Payload
```json
[{"Id": 18423}]
```

##### Response Structure
```json
[{"Id": 18423, "JobId": 10684}]
```

---

#### TaskJoinObjectIdsVisualizationRequest[]
**Get related object IDs for tasks**

- **Endpoint:** `api/json/reply/TaskJoinObjectIdsVisualizationRequest[]`
- **Method:** `POST` with header `X-HTTP-Method-Override: GET`
- **Description:** Returns job and customer IDs associated with tasks

##### Request Payload
```json
[{"Id": 18423}]
```

##### Response Structure
```json
[
  {
    "Id": 18423,
    "JobId": 10684,
    "CustomerId": 798,
    "PhaseNumber": 1,
    "PlanId": 10829,
    "ProjectManagerId": 23,
    "ResponsibleResourceId": 23,
    "ActivityId": 1192
  }
]
```

---

#### JobKeyFiguresNotificationRequest
**Trigger job analytics updates**

- **Endpoint:** `api/json/reply/JobKeyFiguresNotificationRequest`
- **Method:** `POST`
- **Description:** Asynchronous job key figures recalculation

##### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| JobId | body int? | No | Single Job ID to update |
| JobIds | body HashSet<int> | No | Multiple Job IDs |
| TaskId | body int? | No | Single Task ID |
| TaskIds | body HashSet<int> | No | Multiple Task IDs |
| PlanId | body int? | No | Plan ID to update |

##### Request Example
```json
{
  "JobId": 123,
  "JobIds": [123, 456, 789],
  "TaskId": 456,
  "TaskIds": [456, 789],
  "PlanId": 101
}
```

---

### **Task Management**

#### MoveTaskToJobRequest
**Move tasks between jobs**

- **Endpoint:** `api/json/reply/MoveTaskToJobRequest`
- **Method:** `POST`
- **Description:** Reorganize tasks across projects

##### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| Id | path Integer | Yes | Task ID to move |
| JobId | query Integer | Yes | Target job ID |
| PlanId | query Integer | Yes | Plan ID for task |
| PhaseNumber | query Integer | No | Phase number |
| MoveBetweenActive | query boolean | No | Allow active/inactive moves |
| MoveToCalendarSyncJob | query boolean | No | Calendar sync job moves |
| DuplicatePhase | query boolean | Yes | Duplicate task phase |

---

## 💰 Billing & Financial Management

### **Invoice Management**

#### BillableJobRequest
**Get billable job information**

- **Endpoint:** `api/json/reply/BillableJobRequest`
- **Method:** `GET`
- **Description:** Jobs ready for invoicing

##### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| Id | Path integer | Yes | Billable job ID |

##### Response Structure
```json
{
  "CustomerId": 123,
  "CustomerName": "Acme Corporation",
  "Id": 456,
  "JobId": 789,
  "JobName": "Digital Transformation Project",
  "JobStatusId": 2,
  "JobEndDate": "2024-12-31T00:00:00.000Z",
  "CompanyInitials": "ACME",
  "CurrencyCode": "USD",
  "PriceSale": 15000.0,
  "TotalExpenseSale": 2500.0,
  "InvoiceDraftSale": 12500.0,
  "ProjectManagerId": 101
}
```

---

#### InvoiceRequest
**Get comprehensive invoice data**

- **Endpoint:** `api/json/reply/InvoiceRequest`
- **Method:** `GET`
- **Description:** Detailed invoice information

##### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| Id | path integer | Yes | Invoice ID |
| JobId | path integer | No | Job ID (alternative endpoint) |

---

#### ConsolidatedInvoiceJobsRequest
**Get jobs for consolidated invoicing**

- **Endpoint:** `api/json/reply/ConsolidatedInvoiceJobsRequest`
- **Method:** `GET`
- **Description:** Jobs eligible for consolidated billing

---

## 📈 Advanced Business Intelligence

### **Multi-Dimensional Analytics**

#### CubeProjectRequest
**Get comprehensive business intelligence data**

- **Endpoint:** `api/json/reply/CubeProjectRequest`
- **Method:** `GET`
- **Description:** Finance project cube with extensive dimensions

##### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| ExpenseType | Query integer | Yes | Expense type filter |
| ReferenceNumber | Query String | No | Reference number |
| ReferenceId | Query integer | Yes | Reference ID |
| JobId | Query integer | No | Job ID filter |

##### Response Structure (Business Intelligence Cube)
```json
{
  "Id": "unique-cube-id",
  "ExpenseType": 1,
  "LineType": "Revenue",
  "ReferenceId": 123,
  "ReferenceNumber": "REF-001",
  "JobId": 456,
  "JobName": "Digital Transformation Project",
  "JobEndDate": "2024-12-31T00:00:00.000Z",
  "JobCompanyName": "Acme Corp",
  "JobDepartmentName": "IT",
  "JobTypeName": "Consulting",
  "JobResponsibleName": "John Doe",
  "JobDescription": "Full digital transformation",
  "CustomerId": 789,
  "CustomerName": "Acme Corporation",
  "CustomerType": "Enterprise",
  "ProjectName": "DT-2024-Q1",
  "ActivityName": "Requirements Analysis",
  "Quantity": 40.0,
  "CostPerUnit": 80.0,
  "SalePerUnit": 150.0,
  "Costs": 3200.0,
  "TheoreticalSale": 6000.0,
  "ActualizedCost": 3000,
  "ActualizedSale": 5800,
  "TheoreticalGrossProfit": 2800.0,
  "ActualGrossProfit": 2800,
  "EmployeeName": "Jane Smith",
  "EmployeeCompanyName": "Consulting Firm",
  "TeamName": "Digital Team",
  "Dimension1": "North Region",
  "Dimension2": "Premium Client",
  "InvoiceNumber": "INV-2024-001",
  "InvoiceType": 1,
  "InvoiceTypeDescription": "Standard Invoice"
}
```

---

## 🔔 Notification & Workflow Automation

### **User Notifications**

#### RaiseFollowUpNotificationRequest
**Trigger follow-up workflows**

- **Endpoint:** `api/json/reply/RaiseFollowUpNotificationRequest`
- **Method:** `POST`
- **Description:** Automated follow-up notifications

##### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| ReferenceType | path integer | Yes | Follow-up reference type |

---

### **Follow-Up Management**

#### FollowUpTimeEntryChecklistVisualizationRequest
**Get time entry compliance data**

- **Endpoint:** `api/json/reply/FollowUpTimeEntryChecklistVisualizationRequest`
- **Method:** `GET`
- **Description:** Time entry checklist for follow-up management

##### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| StartDate | body string | No | Analysis start date |
| EndDate | body string | No | Analysis end date |
| CompanyDepartmentIds | body Int[] | No | Department filter |
| CompanyIds | body Int[] | No | Company filter |
| TeamIds | body Int[] | No | Team filter |
| MyEmployeesIds | body Int[] | No | Employee filter |
| DisplayType | path integer | Yes | Display type ID |

##### Response Structure
```json
[{
  "Id": 0,
  "EmployeeId": 123,
  "JobId": 456,
  "Hours": 8.5,
  "ProjektId": 789,
  "CustomerTypeId": 1,
  "DayTypeId": 1,
  "AbsenceId": null,
  "EmployeeName": {}
}]
```

---

## 🔧 Utility & Validation Endpoints

### **Data Validation**

#### CheckContactsToJobOwnerRequest
**Validate contact-job relationships**

- **Endpoint:** `api/json/reply/CheckContactsToJobOwnerRequest`
- **Method:** `POST`
- **Description:** Verify contact-job owner connections

##### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| ConversationId | body integer | Yes | Conversation ID |
| ResourceInitials | body array | Yes | User initials to check |
| JobId | body integer | Yes | Job ID context |
| TaskId | body integer | Yes | Task/ticket ID |

---

## 🚀 Agentic Workflow Implementations

### **🎯 Smart Resource Management Flows**
```typescript
// 1. Contact Discovery → Status Analysis → Action
ContactsRequest → TimeEntryAnalytics → ResourcePatchRequest

// 2. Productivity Monitoring → Follow-up Workflows
ResourcesTimeEntryApprovalStatistics → RaiseFollowUpNotification
```

### **💡 Intelligent Project Analytics Flows**
```typescript
// 1. Project Health → Financial Analysis → Recommendations
ClientProjectRetainerKeyFigures → CubeProjectRequest → JobKeyFiguresNotification

// 2. Task Optimization → Resource Allocation → Performance Tracking
MoveTaskToJobRequest → ResourcesTimeEntryApprovalStatistics → FollowUpTimeEntryChecklist
```

### **🔔 Proactive Workflow Flows**
```typescript
// 1. Compliance Monitoring → Follow-up Escalation
FollowUpTimeEntryChecklistVisualization → RaiseFollowUpNotification

// 2. Billing Automation → Invoice Generation → Payment Tracking
BillableJobRequest → ConsolidatedInvoiceJobsRequest → InvoiceRequest
```

### **📊 Advanced Business Intelligence Flows**
```typescript
// 1. Multi-dimensional Analysis → Custom Dashboards → Predictive Insights
CubeProjectRequest → ClientProjectRetainerKeyFigures → ResourcesTimeEntryApprovalStatistics

// 2. Performance KPIs → Trend Analysis → Strategic Recommendations
RawTimeEntryRequest → TimeEntryRequest → JobKeyFiguresNotification
```

---

## ⚡ Implementation Priority for Teams Agent

### **Phase 3: Enhanced Tools (Next Steps)**
1. **Mark Inactive Tool** → `ResourcePatchRequest`
2. **Export Tool** → `CubeProjectRequest` + `ClientProjectRetainerKeyFigures`
3. **Report Tool** → `ResourcesTimeEntryApprovalStatistics`

### **Phase 4: Intelligence Layer**
1. **Caching Implementation** → Reduce API calls from 17+ to 1-2
2. **Workflow Automation** → Combine multiple endpoints intelligently
3. **Predictive Analytics** → Use historical data for insights

### **Phase 5: Advanced Features**
1. **Automated Follow-ups** → `RaiseFollowUpNotificationRequest`
2. **Multi-dimensional BI** → `CubeProjectRequest` workflows
3. **Advanced Task Management** → `MoveTaskToJobRequest` workflows

---

**🔗 Remember: All endpoints follow the pattern `api/json/reply/(EndpointName)`**