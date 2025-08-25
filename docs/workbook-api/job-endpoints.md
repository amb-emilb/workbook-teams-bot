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

