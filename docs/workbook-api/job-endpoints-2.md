1. TagsRequest

# Headers:

Request URL
https://ambitiondemo.workbook.net/api/json/reply/TagsRequest
Request Method
GET
Status Code
200 OK
Remote Address
52.164.255.111:443
Referrer Policy
strict-origin-when-cross-origin

# Response:


    {
        "Id": 1,
        "TagId": 1,
        "TagName": "E-conomic",
        "Active": true,
        "CreateDate": "2018-03-29T17:07:34.100Z",
        "UpdateResourceId": 30,
        "UpdateDate": "2018-04-03T09:22:02.513Z",
        "Color": "#e2ac1c",
        "Internal": false
    },
    {
        "Id": 2,
        "TagId": 2,
        "TagName": "Mediakunder fra Timelog",
        "Active": true,
        "CreateDate": "2018-03-30T14:03:14.623Z",
        "UpdateResourceId": 30,
        "UpdateDate": "2018-04-03T09:22:13.673Z",
        "Color": "#e04de5",
        "Internal": false
    },

    {and so on..}

# Functionality

Returns a list of all tags (id, tagname, tagid)

2. InvoicesRequest?JobId={id}

# Headers

Request URL
https://ambitiondemo.workbook.net/api/json/reply/InvoicesRequest?JobId=5382
Request Method
GET
Status Code
200 OK
Remote Address
52.164.255.111:443
Referrer Policy
strict-origin-when-cross-origin

# Payload

Job ID (e.g. 5382)

# Response

[
    {
        "Id": 10369,
        "Number": "83645",
        "TypeId": 3,
        "Date": "2021-03-31T00:00:00.000Z",
        "JobId": 5382,
        "ResponsibleResourceId": 53,
        "Title": "Faktura",
        "Headline": "Job 5382 - SKODBORG.DK - Searchmetrics licens",
        "DebtorId": 1101,
        "DebtorLabel": "KURHOTEL SKODSBORG A/S\nSkodsborg Strandvej 139\n2942 Skodsborg",
        "DebtorAttention": "",
        "VATPercent": 0.2500000000,
        "LanguageId": 1030,
        "PrintDate": "2021-04-09T00:00:00.000Z",
        "PrintResourceId": 53,
        "DebtorCompanyNumber": "15978333",
        "ShowPhases": 0,
        "ShowPhasePrice": true,
        "ShowPhaseNumber": true,
        "ShowLines": 1,
        "ShowLinePrice": true,
        "ShowLineHours": false,
        "ShowLineHoursPrice": true,
        "ShowDividingLines": false,
        "DoIndentLines": false,
        "ShowDecimals": true,
        "ShowCurrency": true,
        "ShowVATPercent": false,
        "AmountNet": 2395.00,
        "AmountVat": 598.75,
        "AmountTot": 2993.75,
        "JournalNumber": 5417,
        "PayTermId": 1,
        "DueDate": "2021-04-10T00:00:00.000Z",
        "CreditNoteCloseJob": false,
        "MainInvoice": false,
        "AmountNetCurrency": 2395.0000,
        "AmountVatCurrency": 598.7500,
        "AmountTotalCurrency": 2993.7500,
        "PostDate": "2021-03-31T00:00:00.000Z",
        "AmountNetVatAttract": 2395.0000,
        "AmountNetVatAttractCurrency": 2395.0000,
        "PayModeId": 1,
        "PayModeIdentificationNo": "00000000083645",
        "PayModeCheckDigit": 2,
        "PayModeIdentificationLine": "+71< 000000000836452+89749735<",
        "PayModeAccountNo": 89749735,
        "PayModeDebtorAnnotation": "",
        "CompanyName": "Ambition A/S",
        "UpdateResId": 53,
        "UpdateDate": "2021-04-09T13:34:58.957Z",
        "UpdateType": 1,
        "eTransferDate": "2021-04-09T13:27:01.077Z",
        "UseActGrouping": false,
        "Status": 70,
        "PartialInvoiceExpPostIsApproved": false,
        "ArpVatId": 160002,
        "DeliveryArpAccId": 1101,
        "DeliveryDebtorAttention": "",
        "ReverseCharge": false,
        "PayTermText": "Betalingsbetingelse: netto kontant 10 dage",
        "ReportLayoutId": 130,
        "CurrencyId": 1,
        "CurrencyRate": 100.000000000000,
        "CurrencyDate": "1900-01-01T00:00:00.000Z",
        "DoNotCapitalize": false,
        "SalesDate": "2021-03-31T00:00:00.000Z",
        "NumberNumeric": 83645,
        "SubInvoice": false,
        "EliminatePartInvoice": false,
        "ReportWatermarkId": 2,
        "PaymentStatusForSystemsWithoutFinance": 10,
        "ShowPartInvoiceExpenseDetails": false,
        "IncludeVouchers": 0,
        "Internal": false,
        "TimeOfSupplyOnLines": false
    },
    {
        "Id": 10032,
        "Number": "83325",
        "TypeId": 3,
        "Date": "2021-02-28T00:00:00.000Z",
        "JobId": 5382,
        "ResponsibleResourceId": 53,
        "Title": "Faktura",
        "Headline": "Job 5382 - SKODBORG.DK - Searchmetrics licens",
        "DebtorId": 1101,
        "DebtorLabel": "KURHOTEL SKODSBORG A/S\nSkodsborg Strandvej 139\n2942 Skodsborg",
        "DebtorAttention": "",
        "VATPercent": 0.2500000000,
        "LanguageId": 1030,
        "PrintDate": "2021-03-02T00:00:00.000Z",
        "PrintResourceId": 53,
        "DebtorCompanyNumber": "15978333",
        "ShowPhases": 0,
        "ShowPhasePrice": true,
        "ShowPhaseNumber": true,
        "ShowLines": 1,
        "ShowLinePrice": true,
        "ShowLineHours": false,
        "ShowLineHoursPrice": true,
        "ShowDividingLines": false,
        "DoIndentLines": false,
        "ShowDecimals": true,
        "ShowCurrency": true,
        "ShowVATPercent": false,
        "AmountNet": 2395.00,
        "AmountVat": 598.75,
        "AmountTot": 2993.75,
        "JournalNumber": 5215,
        "PayTermId": 1,
        "DueDate": "2021-03-10T00:00:00.000Z",
        "CreditNoteCloseJob": false,
        "MainInvoice": false,
        "AmountNetCurrency": 2395.0000,
        "AmountVatCurrency": 598.7500,
        "AmountTotalCurrency": 2993.7500,
        "PostDate": "2021-02-28T00:00:00.000Z",
        "AmountNetVatAttract": 2395.0000,
        "AmountNetVatAttractCurrency": 2395.0000,
        "PayModeId": 1,
        "PayModeIdentificationNo": "00000000083325",
        "PayModeCheckDigit": 1,
        "PayModeIdentificationLine": "+71< 000000000833251+89749735<",
        "PayModeAccountNo": 89749735,
        "PayModeDebtorAnnotation": "",
        "CompanyName": "Ambition A/S",
        "UpdateResId": 53,
        "UpdateDate": "2021-03-02T11:43:44.310Z",
        "UpdateType": 1,
        "eTransferDate": "2021-03-02T11:43:29.247Z",
        "UseActGrouping": false,
        "Status": 70,
        "PartialInvoiceExpPostIsApproved": false,
        "ArpVatId": 160002,
        "DeliveryArpAccId": 1101,
        "DeliveryDebtorAttention": "",
        "ReverseCharge": false,
        "PayTermText": "Betalingsbetingelse: netto kontant 10 dage",
        "ReportLayoutId": 130,
        "CurrencyId": 1,
        "CurrencyRate": 100.000000000000,
        "CurrencyDate": "1900-01-01T00:00:00.000Z",
        "DoNotCapitalize": false,
        "SalesDate": "2021-02-28T00:00:00.000Z",
        "NumberNumeric": 83325,
        "SubInvoice": false,
        "EliminatePartInvoice": false,
        "ReportWatermarkId": 2,
        "PaymentStatusForSystemsWithoutFinance": 10,
        "ShowPartInvoiceExpenseDetails": false,
        "IncludeVouchers": 0,
        "Internal": false,
        "TimeOfSupplyOnLines": false
    },

{and so on...}

# Functionality

Returns all invoices for a given job.

3. InvoiceRequest?Id={invoiceId}

# Headers

Request URL
https://ambitiondemo.workbook.net/api/json/reply/InvoiceRequest?Id=10369
Request Method
GET
Status Code
200 OK
Remote Address
52.164.255.111:443
Referrer Policy
strict-origin-when-cross-origin

# Payload

Invoice ID (e.g. 10369)

# Response

{
    "Id": 10369,
    "Number": "83645",
    "TypeId": 3,
    "Date": "2021-03-31T00:00:00.000Z",
    "JobId": 5382,
    "ResponsibleResourceId": 53,
    "Title": "Faktura",
    "Headline": "Job 5382 - SKODBORG.DK - Searchmetrics licens",
    "DebtorId": 1101,
    "DebtorLabel": "KURHOTEL SKODSBORG A/S\nSkodsborg Strandvej 139\n2942 Skodsborg",
    "DebtorAttention": "",
    "VATPercent": 0.2500000000,
    "LanguageId": 1030,
    "PrintDate": "2021-04-09T00:00:00.000Z",
    "PrintResourceId": 53,
    "DebtorCompanyNumber": "15978333",
    "ShowPhases": 0,
    "ShowPhasePrice": true,
    "ShowPhaseNumber": true,
    "ShowLines": 1,
    "ShowLinePrice": true,
    "ShowLineHours": false,
    "ShowLineHoursPrice": true,
    "ShowDividingLines": false,
    "DoIndentLines": false,
    "ShowDecimals": true,
    "ShowCurrency": true,
    "ShowVATPercent": false,
    "AmountNet": 2395.00,
    "AmountVat": 598.75,
    "AmountTot": 2993.75,
    "JournalNumber": 5417,
    "PayTermId": 1,
    "DueDate": "2021-04-10T00:00:00.000Z",
    "CreditNoteCloseJob": false,
    "MainInvoice": false,
    "AmountNetCurrency": 2395.0000,
    "AmountVatCurrency": 598.7500,
    "AmountTotalCurrency": 2993.7500,
    "PostDate": "2021-03-31T00:00:00.000Z",
    "AmountNetVatAttract": 2395.0000,
    "AmountNetVatAttractCurrency": 2395.0000,
    "PayModeId": 1,
    "PayModeIdentificationNo": "00000000083645",
    "PayModeCheckDigit": 2,
    "PayModeIdentificationLine": "+71< 000000000836452+89749735<",
    "PayModeAccountNo": 89749735,
    "PayModeDebtorAnnotation": "",
    "CompanyName": "Ambition A/S",
    "UpdateResId": 53,
    "UpdateDate": "2021-04-09T13:34:58.957Z",
    "UpdateType": 1,
    "eTransferDate": "2021-04-09T13:27:01.077Z",
    "UseActGrouping": false,
    "Status": 70,
    "PartialInvoiceExpPostIsApproved": false,
    "ArpVatId": 160002,
    "DeliveryArpAccId": 1101,
    "DeliveryDebtorAttention": "",
    "ReverseCharge": false,
    "PayTermText": "Betalingsbetingelse: netto kontant 10 dage",
    "ReportLayoutId": 130,
    "CurrencyId": 1,
    "CurrencyRate": 100.000000000000,
    "CurrencyDate": "1900-01-01T00:00:00.000Z",
    "DoNotCapitalize": false,
    "SalesDate": "2021-03-31T00:00:00.000Z",
    "NumberNumeric": 83645,
    "SubInvoice": false,
    "EliminatePartInvoice": false,
    "ReportWatermarkId": 2,
    "PaymentStatusForSystemsWithoutFinance": 10,
    "ShowPartInvoiceExpenseDetails": false,
    "IncludeVouchers": 0,
    "Internal": false,
    "TimeOfSupplyOnLines": false
}

# Functionality

Returns detailed information for a single invoice

4. InvoicePaymentStatusRequest?Id={}

# Headers 

Request URL
https://ambitiondemo.workbook.net/api/json/reply/InvoicePaymentStatusRequest?Id=10369
Request Method
GET
Status Code
200 OK
Remote Address
52.164.255.111:443
Referrer Policy
strict-origin-when-cross-origin

# Payload

Invoice ID (e.g. 10369)

# Response

{
    "Id": 10369,
    "CompanyId": 1,
    "JobId": 5382,
    "PaymentStatusId": 50,
    "PaymentStatusText": "DUE & NOT PAID, DKK 2.993,75",
    "PaymentStatus": "DUE & NOT PAID",
    "Amount": 2993.75,
    "IsoCode": "DKK",
    "LatestPaidDate": "2021-03-31T00:00:00.000Z"
}

# Functionality

Returns status for a given invoice.

5. ExpenditureSummaryHoursAndCostRequest?JobId={jobId}&ShowInCompanyCurrency=0

# Headers

Request URL
https://ambitiondemo.workbook.net/api/json/reply/ExpenditureSummaryHoursAndCostRequest?JobId=5382&ShowInCompanyCurrency=0
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
5382 (example)
ShowInCompanyCurrency
0

# Response

[
    {
        "Id": 38,
        "JobId": 5382,
        "RowType": 1,
        "GroupNumber": 1,
        "GroupName": "Activity summary",
        "SortOrder": 1269,
        "CurrencyId": 1,
        "CurrencyCode": "DKK",
        "ActivityId": 1269,
        "Description": "1269 - Project management, search",
        "ActualHours": 13.0000,
        "ActualCosts": 7800.0000,
        "ActualPrice": 16250.0000,
        "UnBilled": -16250.0000
    },
    {
        "Id": 40,
        "JobId": 5382,
        "RowType": 1,
        "GroupNumber": 1,
        "GroupName": "Activity summary",
        "SortOrder": 1280,
        "CurrencyId": 1,
        "CurrencyCode": "DKK",
        "ActivityId": 1280,
        "Description": "1280 - Searchmetrics",
        "QuotedPrice": 28740.0000,
        "Billed": 83825.0000,
        "UnBilled": 83825.0000
    },
    {
        "Id": 45,
        "JobId": 5382,
        "RowType": 1,
        "GroupNumber": 1,
        "GroupName": "Activity summary",
        "SortOrder": 1304,
        "CurrencyId": 1,
        "CurrencyCode": "DKK",
        "ActivityId": 1304,
        "Description": "1304 - Project assistant",
        "ActualHours": 0.5000,
        "ActualCosts": 300.0000,
        "ActualPrice": 625.0000,
        "UnBilled": -625.0000
    },
    {
        "Id": 78,
        "JobId": 5382,
        "RowType": 2,
        "GroupNumber": 2,
        "GroupName": "Total",
        "SortOrder": 2,
        "CurrencyId": 1,
        "CurrencyCode": "DKK",
        "Description": "Total",
        "QuotedPrice": 28740.0000,
        "ActualHours": 13.5000,
        "ActualCosts": 8100.0000,
        "ActualPrice": 16875.0000,
        "Billed": 83825.0000,
        "UnBilled": 66950.0000
    },
    {
        "Id": 79,
        "JobId": 5382,
        "RowType": 2,
        "GroupNumber": 2,
        "GroupName": "Total",
        "SortOrder": 3,
        "CurrencyId": 1,
        "CurrencyCode": "DKK",
        "Description": "Turnover",
        "ActualPrice": 8775.0000
    }
]

# Functionality

Shows a high level overview / summary

