1. https://ambitiondemo.workbook.net/api/json/reply/ExpenditureSummaryDepartmentProfitSplitVisualizationRequest?JobId={jobId}&ShowInCompanyCurrency=false&DepartmentGrouping=1

# Headers

Request URL
https://ambitiondemo.workbook.net/api/json/reply/ExpenditureSummaryDepartmentProfitSplitVisualizationRequest?JobId=10848&ShowInCompanyCurrency=false&DepartmentGrouping=1
Request Method
GET
Status Code
200 OK
Remote Address
52.164.255.111:443
Referrer Policy
strict-origin-when-cross-origin

# Payload

JobId
10848 (Example)
ShowInCompanyCurrency
false
DepartmentGrouping
1

# Response

[
    {
        "Id": 1,
        "RecordType": 1,
        "DepartmentType": "Owner",
        "DepartmentName": "SEO",
        "DepartmentId": 10,
        "CurrencyId": 1,
        "CurrencyCode": "DKK",
        "PriceQuoteShare": 85000.00,
        "PriceQuoteSharePercentage": 100.00,
        "TaskAmount": 58125.00,
        "TaskPercentage": 86.59,
        "TimeShare": 59062.50,
        "TimePercentage": 81.82,
        "InvoiceShare": 85000.00,
        "InvoicePercentage": 100.00
    },
    {
        "Id": 3,
        "RecordType": 1,
        "DepartmentType": "Delivery",
        "DepartmentName": "AdWords",
        "DepartmentId": 9,
        "CurrencyId": 1,
        "CurrencyCode": "DKK",
        "TaskAmount": 9000.00,
        "TaskPercentage": 13.41,
        "TimeShare": 9375.00,
        "TimePercentage": 12.99
    },
    {
        "Id": 9,
        "RecordType": 1,
        "DepartmentType": "Delivery",
        "DepartmentName": "Search & Social",
        "DepartmentId": 3,
        "CurrencyId": 1,
        "CurrencyCode": "DKK",
        "TimeShare": 3750.00,
        "TimePercentage": 5.19
    },
    {
        "Id": 15,
        "RecordType": 2,
        "DepartmentName": "Total",
        "CurrencyId": 1,
        "CurrencyCode": "DKK",
        "PriceQuoteShare": 85000.00,
        "PriceQuoteSharePercentage": 100.00,
        "TaskAmount": 67125.00,
        "TaskPercentage": 100.00,
        "TimeShare": 72187.50,
        "TimePercentage": 100.00,
        "InvoiceShare": 85000.00,
        "InvoicePercentage": 100.00
    }
]

# Functionality

Department expenditure breakdown


2. JobPatchRequest

# Headers

Request URL
https://ambitiondemo.workbook.net/api/json/reply/JobPatchRequest
Request Method
PATCH
Status Code
200 OK
Remote Address
52.164.255.111:443
Referrer Policy
strict-origin-when-cross-origin

# Payload

Uses payload for the field you want to patch, e.g. here im patching the account manager:

{Patch: {JobResponsibleId: 29, Id: 10848}}
Patch
: 
{JobResponsibleId: 29, Id: 10848}
Id
: 
10848
JobResponsibleId
: 
29

# Response

{
    "JobID": 10848,
    "Id": 10848,
    "JobName": "AKADEMIKERBLADET.DK - SEO - klippekort 2021",
    "ProjectId": 789,
    "StatusId": 1,
    "JobTypeId": 31,
    "LeveringsDato": "2021-03-31T00:00:00.000Z",
    "EndDate": "2022-04-30T00:00:00.000Z",
    "ResponsibleId": 53,
    "CompanyId": 1,
    "TeamId": 11,
    "Public": true,
    "CreateDate": "2021-01-28T09:11:45.603Z",
    "Billable": true,
    "CompletePhase": 0,
    "JobTaskActive": true,
    "JobTaskUseAllDays": false,
    "JobResponsibleId": 29,
    "TimeEntryAllowed": 1,
    "FolderExtra": " AKADEMIKERBLADETDK - SEO - februar_marts 2021",
    "FolderArchived": false,
    "StartDate": "2021-01-28T00:00:00.000Z",
    "AdminOnly": false,
    "JournalNumber": 0,
    "TemplateJob": false,
    "SupplementaryTextRequested": true,
    "CompanyDepartmentId": 10,
    "ExpAccMtd": 1,
    "CreateEmployeeId": 53,
    "PostMethodTime": 2,
    "PostMethodMat": 2,
    "PostMethodExt": 2,
    "IsMediaJob": false,
    "FlexTimeRegDisabled": false,
    "PostSpecId": 2,
    "VoucherRegistrationAllowed": true,
    "MaterialRegAllowed": true,
    "RetainerJob": false,
    "JobAccessType": 1,
    "EmployeeAccessType": 0,
    "ExternalUserAccessType": 0,
    "PricelistID": 1,
    "SubsistenceAllowanceAllowed": true,
    "MileageEntryAllowed": true,
    "BillingExternalExpenseType": 1,
    "BillingMileageType": 1,
    "BillingTimeEntryTravelTimeType": 1,
    "ExpenseEntryAllowed": true,
    "MatGrpID": 1,
    "SupportTicketEnable": false,
    "AdjustmentHandlingTime": 0,
    "AdjustmentHandlingMat": 0,
    "AdjustmentHandlingExtExp": 0,
    "AdjustmentHandlingExtExpCost": 0,
    "AdjustmentHandlingExtraDiscount": 0,
    "PurchaseOrderAllowed": true,
    "ProjectRetainerMasterJob": false,
    "ProjectRetainerDeliveryJob": false,
    "CapitalizeSalesInvoice": false,
    "TimeAndMaterial": false,
    "PayWhenPaid": false
}

# Functionality

For patching / updating ANY field ond a given job

3. JobTypesRequest?Active=true&CompanyId=1

# Payload

Active
true
CompanyId
1 

# Response

[
    {
        "Id": 4,
        "Name": "AdHoc",
        "Active": true,
        "RetainerJob": false,
        "UpdatePriceQuote": false
    },
    {
        "Id": 31,
        "Name": "Annonce",
        "Active": true,
        "RetainerJob": false,
        "UpdateDate": "2018-04-05T14:22:24.140Z",
        "UpdatePriceQuote": false
    },
    {
        "Id": 25,
        "Name": "Direct Mail",
        "Active": true,
        "RetainerJob": false,
        "UpdateDate": "2018-04-05T14:20:19.183Z",
        "UpdatePriceQuote": false
    },
    {
        "Id": 29,
        "Name": "Intern",
        "Active": true,
        "RetainerJob": false,
        "UpdateDate": "2018-04-05T14:21:17.640Z",
        "UpdatePriceQuote": false
    },
    {
        "Id": 32,
        "Name": "Intern, herunder ferie",
        "Active": true,
        "RetainerJob": false,
        "UpdateDate": "2018-04-05T15:29:24.677Z",
        "UpdatePriceQuote": false
    },
    {
        "Id": 10,
        "Name": "Intern, herunder ferie og fravær",
        "Active": true,
        "RetainerJob": false,
        "UpdatePriceQuote": false
    },
    {
        "Id": 27,
        "Name": "Kampagne",
        "Active": true,
        "RetainerJob": false,
        "UpdateDate": "2018-04-05T14:20:53.780Z",
        "UpdatePriceQuote": false
    },
    {
        "Id": 8,
        "Name": "Klippekort",
        "Active": true,
        "RetainerJob": false,
        "UpdatePriceQuote": false
    },
    {
        "Id": 3,
        "Name": "Løbende",
        "Active": true,
        "RetainerJob": false,
        "UpdatePriceQuote": false
    },
    {
        "Id": 24,
        "Name": "NewBizz",
        "Active": true,
        "RetainerJob": false,
        "UpdatePriceQuote": false
    },
    {
        "Id": 26,
        "Name": "Online",
        "Active": true,
        "RetainerJob": false,
        "UpdateDate": "2018-04-05T14:20:29.807Z",
        "UpdatePriceQuote": false
    },
    {
        "Id": 28,
        "Name": "Oplæg",
        "Active": true,
        "RetainerJob": false,
        "UpdateDate": "2018-04-05T14:21:05.690Z",
        "UpdatePriceQuote": false
    },
    {
        "Id": 30,
        "Name": "Tryksag",
        "Active": true,
        "RetainerJob": false,
        "UpdateDate": "2018-04-05T14:21:41.890Z",
        "UpdatePriceQuote": false
    }
]

# Functionality

Returns various job types for Ambition

4. TimeEntryTaskResourceSumVisualizationRequest[]

# Headers

Request URL
https://ambitiondemo.workbook.net/api/json/reply/TimeEntryTaskResourceSumVisualizationRequest[]
Request Method
POST
Status Code
200 OK
Remote Address
52.164.255.111:443
Referrer Policy
strict-origin-when-cross-origin

# Payload

[{Id: 29608, HasTimeEntry: true}, {Id: 29503, HasTimeEntry: true}, {Id: 29478, HasTimeEntry: true}]
0
: 
{Id: 29608, HasTimeEntry: true}
HasTimeEntry
: 
true
Id
: 
29608
1
: 
{Id: 29503, HasTimeEntry: true}
HasTimeEntry
: 
true
Id
: 
29503
2
: 
{Id: 29478, HasTimeEntry: true}
HasTimeEntry
: 
true
Id
: 
29478

# Response

[
    {
        "Id": 29608,
        "ResourceId": 27,
        "TaskId": 19053,
        "HoursTimeRegistration": 1.0000,
        "Done": true,
        "HasTimeRegistration": true
    },
    {
        "Id": 29503,
        "ResourceId": 53,
        "TaskId": 19053,
        "HoursTimeRegistration": 1.0000,
        "Done": true,
        "HasTimeRegistration": true
    },
    {
        "Id": 29478,
        "ResourceId": 2463,
        "TaskId": 19053,
        "HoursTimeRegistration": 6.5000,
        "Done": true,
        "HasTimeRegistration": true
    }
]

6. https://ambitiondemo.workbook.net/api/json/reply/CapacityVisualizationMultiRequest

# Headers

Request URL
https://ambitiondemo.workbook.net/api/json/reply/CapacityVisualizationMultiRequest
Request Method
POST
Status Code
200 OK
Remote Address
52.164.255.111:443
Referrer Policy
strict-origin-when-cross-origin

# Payload

{References: [{ResourceId: 2463, TaskId: 19054}, {ResourceId: 53, TaskId: 19054}],…}
IncludeAbsence
: 
true
IncludeCurrentHours
: 
true
IncludeEmptyCapacity
: 
true
PeriodType
: 
1
References
: 
[{ResourceId: 2463, TaskId: 19054}, {ResourceId: 53, TaskId: 19054}]
0
: 
{ResourceId: 2463, TaskId: 19054}
ResourceId
: 
2463
TaskId
: 
19054
1
: 
{ResourceId: 53, TaskId: 19054}
ResourceId
: 
53
TaskId
: 
19054

# Response

[
    {
        "ReferenceId": 29479,
        "Id": 0,
        "ResourceId": 2463,
        "DayDate": "2021-03-01T00:00:00.000Z",
        "Capacity": 7.3750,
        "CapacityCurrent": 7.3750,
        "HoursBooked": 0,
        "HoursBookedCurrent": 0,
        "TotalHoursBooked": 0,
        "TotalHoursBookedCurrent": 0,
        "TotalApprovedHoursBooked": 0,
        "TotalApprovedHoursBookedCurrent": 0,
        "HoursNormal": 6.5000,
        "BookingLevel": 3,
        "DayType": 1,
        "HoursHoliday": 0.0000
    },
    {
        "ReferenceId": 29479,
        "Id": 0,
        "ResourceId": 2463,
        "DayDate": "2021-03-02T00:00:00.000Z",
        "Capacity": 7.3750,
        "CapacityCurrent": 7.3750,
        "HoursBooked": 0,
        "HoursBookedCurrent": 0,
        "TotalHoursBooked": 0,
        "TotalHoursBookedCurrent": 0,
        "TotalApprovedHoursBooked": 0,
        "TotalApprovedHoursBookedCurrent": 0,
        "HoursNormal": 6.5000,
        "BookingLevel": 3,
        "DayType": 1,
        "HoursHoliday": 0.0000
    },
    {
        "ReferenceId": 29479,
        "Id": 0,
        "ResourceId": 2463,
        "DayDate": "2021-03-03T00:00:00.000Z",
        "Capacity": 7.3750,
        "CapacityCurrent": 7.3750,
        "HoursBooked": 0,
        "HoursBookedCurrent": 0,
        "TotalHoursBooked": 0,
        "TotalHoursBookedCurrent": 0,
        "TotalApprovedHoursBooked": 0,
        "TotalApprovedHoursBookedCurrent": 0,
        "HoursNormal": 6.5000,
        "BookingLevel": 3,
        "DayType": 1,
        "HoursHoliday": 0.0000
    },
    {
        "ReferenceId": 29479,
        "Id": 0,
        "ResourceId": 2463,
        "DayDate": "2021-03-04T00:00:00.000Z",
        "Capacity": 7.3750,
        "CapacityCurrent": 7.3750,
        "HoursBooked": 0,
        "HoursBookedCurrent": 0,
        "TotalHoursBooked": 0,
        "TotalHoursBookedCurrent": 0,
        "TotalApprovedHoursBooked": 0,
        "TotalApprovedHoursBookedCurrent": 0,
        "HoursNormal": 6.5000,
        "BookingLevel": 3,
        "DayType": 1,
        "HoursHoliday": 0.0000
    },

{ and so on }

# Functionality

Uncertain, but might return capacity for specific resources on the job