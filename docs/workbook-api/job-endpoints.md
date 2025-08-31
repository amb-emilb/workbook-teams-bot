1. JobTeamAllRequest[]

# Request URL
https://ambitiondemo.workbook.net/api/json/reply/JobTeamAllRequest[]
Request Method
POST
Status Code
200 OK
Remote Address
52.164.255.111:443
Referrer Policy
strict-origin-when-cross-origin

# Request Payload

[{Id: 11133}]
0
: 
{Id: 11133}
Id
: 
11133

# Response:

[
    {
        "JobId": 11133,
        "ResourceId": 2,
        "BonusPart": false,
        "Id": 676510,
        "JobAccess": true,
        "PortalAccessType": 0
    },
    {
        "JobId": 11133,
        "ResourceId": 15,
        "BonusPart": false,
        "Id": 676511,
        "JobAccess": true,
        "PortalAccessType": 0
    },
  [...]
]

2. TaskResourcePriceRequest

# Request URL
https://ambitiondemo.workbook.net/api/json/reply/TasksResourcePriceRequest
Request Method
POST
Status Code
200 OK
Remote Address
52.164.255.111:443
Referrer Policy
strict-origin-when-cross-origin

# Payload

{Ids: [31235, 31236, 31237, 31238]}
Ids
: 
[31235, 31236, 31237, 31238]
0
: 
31235
1
: 
31236
2
: 
31237
3
: 
31238

# Response

[
    {
        "Id": 31235,
        "TaskId": 20274,
        "Hours": 4.0000,
        "Cost": 600.0000,
        "Sale": 1250.0000,
        "HoursTimeRegistration": 0,
        "IsoCode": "DKK"
    },
    {
        "Id": 31236,
        "TaskId": 20274,
        "Hours": 6.5000,
        "Cost": 800.0000,
        "Sale": 1250.0000,
        "HoursTimeRegistration": 0,
        "IsoCode": "DKK"
    },
    {
        "Id": 31237,
        "TaskId": 20274,
        "Hours": 0.0000,
        "Cost": 600.0000,
        "Sale": 1250.0000,
        "HoursTimeRegistration": 0,
        "IsoCode": "DKK"
    },
    {
        "Id": 31238,
        "TaskId": 20274,
        "Hours": 14.0000,
        "Cost": 400.0000,
        "Sale": 1250.0000,
        "HoursTimeRegistration": 0,
        "IsoCode": "DKK"
    }
]

3. TaskRequest[]

# Request URL

https://ambitiondemo.workbook.net/api/json/reply/TaskRequest[]
Request Method
POST
Status Code
200 OK
Remote Address
52.164.255.111:443
Referrer Policy
strict-origin-when-cross-origin

# Request Payload

[{Id: 20275}]
0
: 
{Id: 20275}
Id
: 
20275

# Response

[
    {
        "Id": 20275,
        "PlanId": 11499,
        "PhaseNumber": 1,
        "TaskNumber": 2,
        "TaskName": "Media - Facebook og Social - 5 til Ads",
        "ActivityId": 1210,
        "StartDate": "2021-04-06T00:00:00.000Z",
        "WorkDays": 18,
        "EndDate": "2021-04-29T00:00:00.000Z",
        "TaskStatus": 1,
        "BookingStatus": 1,
        "Milestone": false,
        "PriorityId": 2,
        "SupplementaryTextRequested": true,
        "TaskColourId": 1,
        "ShowPublic": true,
        "CreateDate": "2021-03-23T15:46:30.870Z",
        "CreateEmployeeId": 53,
        "UpdateEmployeeId": 53,
        "UpdateDate": "2021-04-15T12:34:43.317Z",
        "TemporaryId": 20274,
        "AllowTimeRegistration": true,
        "AllowUseOffDay": false,
        "FromExternal": false,
        "BookingLevel": 8,
        "Billable": true
    }
]

4. ActivityVisualizationsRequest

# Request URL

https://ambitiondemo.workbook.net/api/json/reply/ActivityVisualizationsRequest?Active=true&JobId=11133
Request Method
GET
Status Code
200 OK
Remote Address
52.164.255.111:443
Referrer Policy
strict-origin-when-cross-origin

# Payload

Query String Parameters

Active
true
JobId
11133

# Response

[
    {
        "Id": 1110,
        "ActivityText": "Audience Data"
    },
    {
        "Id": 1120,
        "ActivityText": "Software development"
    },
    {
        "Id": 1130,
        "ActivityText": "Data management"
    },
    {
        "Id": 1139,
        "ActivityText": "Project management, data"
    },
    {
        "Id": 1140,
        "ActivityText": "Data Quality"
    },
    {
        "Id": 1150,
        "ActivityText": "Analysis"
    },
  [...]
]

5. TaskInsertPositionRequest

# Request URL

Request URL
https://ambitiondemo.workbook.net/api/json/reply/TaskInsertPositionRequest
Request Method
PUT
Status Code
200 OK
Remote Address
52.164.255.111:443
Referrer Policy
strict-origin-when-cross-origin

# Payload

{PlanId: 11499, PhaseNumber: 1, StartDate: "2021-04-30T00:00:00.000Z", WorkDays: 5, PriorityId: 2,…}
ActivityId
: 
1120
AfterTaskNumber
: 
20275
PhaseNumber
: 
1
PlaceLast
: 
false
PlanId
: 
11499
PriorityId
: 
2
StartDate
: 
"2021-04-30T00:00:00.000Z"
TaskName
: 
"TestTask"
WorkDays
: 
5

# Response

{
    "Id": 20954,
    "PlanId": 11499,
    "PhaseNumber": 1,
    "TaskNumber": 3,
    "TaskName": "TestTask",
    "ActivityId": 1120,
    "StartDate": "2021-05-03T00:00:00.000Z",
    "WorkDays": 5,
    "EndDate": "2021-05-07T00:00:00.000Z",
    "TaskStatus": 1,
    "BookingStatus": 1,
    "Milestone": false,
    "PriorityId": 2,
    "SupplementaryTextRequested": true,
    "TaskColourId": 1,
    "ShowPublic": true,
    "CreateDate": "2025-08-25T15:02:20.423Z",
    "CreateEmployeeId": 53,
    "UpdateEmployeeId": 53,
    "UpdateDate": "2025-08-25T15:02:21.283Z",
    "AllowTimeRegistration": true,
    "AllowUseOffDay": false,
    "FromExternal": false,
    "Billable": true
}

6. ExpenditureOpenEntriesRequest

# Request URL

Request URL
https://ambitiondemo.workbook.net/api/json/reply/ExpenditureOpenEntriesRequest?JobId=11133
Request Method
GET
Status Code
200 OK
Remote Address
52.164.255.111:443
Referrer Policy
strict-origin-when-cross-origin

# Payload

Query String Parameters

JobId
11133

# Response

[
    {
        "Id": 1,
        "Icon": "Timereg.png",
        "CompanyId": 1,
        "Jobid": 11133,
        "ExpenseType": 1,
        "ExpenseDescription": "Time entry",
        "Expensedate": "2021-04-07T00:00:00.000Z",
        "ResourceId": 15,
        "ResourceName": "Anders Dohrn",
        "ApprovalStatus": 10,
        "ApprovalStatusText": "10 - Under preparation",
        "Quantity": 0.2500,
        "CurrencyId": 1,
        "CurrencyName": "DKK",
        "TotalAmountSale": 312.50,
        "TotalAmountCost": 150.00,
        "TotalAmountSaleDisplayCurrency": 312.50,
        "TotalAmountCostDisplayCurrency": 150.00
    },
    {
        "Id": 2,
        "Icon": "Timereg.png",
        "CompanyId": 1,
        "Jobid": 11133,
        "ExpenseType": 1,
        "ExpenseDescription": "Time entry",
        "Expensedate": "2021-04-16T00:00:00.000Z",
        "ResourceId": 3627,
        "ResourceName": "Kiki Andersen",
        "ApprovalStatus": 10,
        "ApprovalStatusText": "10 - Under preparation",
        "Quantity": 0.2500,
        "CurrencyId": 1,
        "CurrencyName": "DKK",
        "TotalAmountSale": 312.50,
        "TotalAmountCost": 100.00,
        "TotalAmountSaleDisplayCurrency": 312.50,
        "TotalAmountCostDisplayCurrency": 100.00
    },
    {
        "Id": 3,
        "Icon": "Timereg.png",
        "CompanyId": 1,
        "Jobid": 11133,
        "ExpenseType": 1,
        "ExpenseDescription": "Time entry",
        "Expensedate": "2021-04-12T00:00:00.000Z",
        "ResourceId": 27,
        "ResourceName": "Jacob Kildebogaard",
        "ApprovalStatus": 10,
        "ApprovalStatusText": "10 - Under preparation",
        "Quantity": 0.5000,
        "CurrencyId": 1,
        "CurrencyName": "DKK",
        "TotalAmountSale": 625.00,
        "TotalAmountCost": 400.00,
        "TotalAmountSaleDisplayCurrency": 625.00,
        "TotalAmountCostDisplayCurrency": 400.00
    },
    {
        "Id": 4,
        "Icon": "Timereg.png",
        "CompanyId": 1,
        "Jobid": 11133,
        "ExpenseType": 1,
        "ExpenseDescription": "Time entry",
        "Expensedate": "2021-04-15T00:00:00.000Z",
        "ResourceId": 3627,
        "ResourceName": "Kiki Andersen",
        "ApprovalStatus": 10,
        "ApprovalStatusText": "10 - Under preparation",
        "Quantity": 0.5000,
        "CurrencyId": 1,
        "CurrencyName": "DKK",
        "TotalAmountSale": 625.00,
        "TotalAmountCost": 200.00,
        "TotalAmountSaleDisplayCurrency": 625.00,
        "TotalAmountCostDisplayCurrency": 200.00
    },
  [...]
]

7. PriceListsJobRequest

Request URL
https://ambitiondemo.workbook.net/api/json/reply/PriceListsJobRequest
Request Method
GET
Status Code
200 OK
Remote Address
52.164.255.111:443
Referrer Policy
strict-origin-when-cross-origin

# Response

[
    {
        "CurrencyIsoCode": "EUR",
        "Id": 2,
        "Name": "Essity TENA",
        "CurrencyId": 5,
        "Blocked": false,
        "PriceListDescription": "TEC Programme Pricelist",
        "EnableActivityAccess": false
    },
    {
        "CurrencyIsoCode": "DKK",
        "Id": 3,
        "Name": "Novartis",
        "CurrencyId": 1,
        "Blocked": false,
        "PriceListDescription": "Novartis vendor agreement pricing",
        "EnableActivityAccess": false
    },
    {
        "CurrencyIsoCode": "DKK",
        "Id": 1,
        "Name": "Standard",
        "CurrencyId": 1,
        "Blocked": false,
        "EnableActivityAccess": false
    },
    {
        "CurrencyIsoCode": "DKK",
        "Id": 4,
        "Name": "Syngenta",
        "CurrencyId": 1,
        "Blocked": false,
        "PriceListDescription": "Syngenta rabat ved årligt køb over 600.000 DKK",
        "EnableActivityAccess": false
    }
]

8. JobCreateRequest

# Request Payload

{CompanyId: 1, ContactResourceId: null, ProjectId: 797, PriceListId: 1, TeamId: 1,…}
AccountManagerResourceId
: 
27
Chargeable
: 
true
CompanyId
: 
1
ContactResourceId
: 
null
CostingCodeId
: 
null
DebtorId
: 
null
DeliveryDate
: 
"2025-10-30T22:26:34.641Z"
FolderIds
: 
[]
JobFolder
: 
"Tester23"
JobId
: 
null
JobManagerResourceId
: 
53
JobStatusId
: 
"1"
MandatoryDimensions
: 
{1: "1", 14: "6"}
1
: 
"1"
14
: 
"6"
Name
: 
"Tester23"
PriceListId
: 
1
ProjectId
: 
797
StartDate
: 
"2025-08-31T00:00:00.000Z"
TeamId
: 
1
TimeRegistrationAllowed
: 
1

# Headers

Request URL
https://ambitiondemo.workbook.net/api/json/reply/JobCreateRequest
Request Method
PUT
Status Code
200 OK
Remote Address
52.164.255.111:443
Referrer Policy
strict-origin-when-cross-origin

# Response

{"JobId":11233}

9. JobPatchRequest

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

{Patch: {Id: 11233}}
Patch
: 
{Id: 11233}
Id
: 
11233


# Response

{
    "JobID": 11233,
    "Id": 11233,
    "JobName": "Tester23",
    "ProjectId": 797,
    "StatusId": 1,
    "JobTypeId": 3,
    "LeveringsDato": "2025-10-30T22:26:34.640Z",
    "EndDate": "2025-10-30T22:26:34.640Z",
    "ResponsibleId": 53,
    "CompanyId": 1,
    "TeamId": 1,
    "Public": true,
    "CreateDate": "2025-08-31T21:27:37.573Z",
    "Billable": true,
    "CompletePhase": 0,
    "JobTaskActive": true,
    "JobTaskUseAllDays": false,
    "JobResponsibleId": 27,
    "TimeEntryAllowed": 1,
    "FolderExtra": " Tester23",
    "FolderArchived": false,
    "ProductId": 6,
    "StartDate": "2025-08-31T00:00:00.000Z",
    "AdminOnly": false,
    "JournalNumber": 0,
    "TemplateJob": false,
    "SupplementaryTextRequested": true,
    "CompanyDepartmentId": 1,
    "ExpAccMtd": 1,
    "CreateEmployeeId": 53,
    "PostMethodTime": 2,
    "PostMethodMat": 2,
    "PostMethodExt": 2,
    "IsMediaJob": false,
    "FlexTimeRegDisabled": false,
    "Dim1": 1,
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

10. ETCResourceByJobIdVisualizationRequest[]

# Headers

Request URL
https://ambitiondemo.workbook.net/api/json/reply/ETCResourceByJobIdVisualizationRequest[]
Request Method
POST
Status Code
200 OK
Remote Address
52.164.255.111:443
Referrer Policy
strict-origin-when-cross-origin

# Payload

[{Id: 11233}]
0
: 
{Id: 11233}
Id
: 
11233

# Response

[
    {
        "Id": 11233,
        "JobId": 11233,
        "Hours": 0,
        "HoursAmount": 0,
        "HoursNotBooked": 0,
        "HoursNotBookedAmount": 0
    }
]

12. JobSimpleVisualizationRequest[]

# Headers

Request URL
https://ambitiondemo.workbook.net/api/json/reply/JobSimpleVisualizationRequest[]
Request Method
POST
Status Code
200 OK
Remote Address
52.164.255.111:443
Referrer Policy
strict-origin-when-cross-origin

# Payload

[{Id: 11233}]
0
: 
{Id: 11233}
Id
: 
11233

# Response

[
    {
        "Id": 11233,
        "JobId": 11233,
        "JobName": "Tester23",
        "CustomerId": 3811,
        "CustomerName": "ADECCO",
        "Billable": true,
        "ProjectId": 797,
        "StatusId": 1,
        "CompanyId": 1,
        "EndDate": "2025-10-30T22:26:34.640Z",
        "StartDate": "2025-08-31T00:00:00.000Z",
        "JobTypeId": 3,
        "JobRessAnsvarID": 27,
        "ResponsibleId": 53,
        "ProstatusId": 0,
        "CompanyDepartmentId": 1,
        "CostingCodeId": 0
    }
]