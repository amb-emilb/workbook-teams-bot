# Clients to be Marked as Inactive

**Generated:** 2025-08-07T14:17:24.061Z

**Total Clients Reviewed:** 945
**Clients to Mark Inactive:** 52

## Client List

| Client ID | Client Name | Inactive Reason | Current Status | Responsible |
|-----------|-------------|-----------------|----------------|-------------|
| 4185 | 21-5 | TRUE | TRUE | Grethe Fugleholm Berg |
| 4186 | 3C RETAIL | TRUE | TRUE | Carsten Maisch Olsen |
| 4187 | A/S Dyrehavsbakken | TRUE | TRUE | Martin Pierre Devantier |
| 3811 | ADECCO | TRUE | TRUE | admin |
| 4664 | Affilify ApS | TRUE | TRUE | Peter Nyemann |
| 4445 | Aim� Cosmetics s.r.o. | TRUE | TRUE | Peter Nyemann |
| 1604 | Aime Cosmetics sro. | TRUE | TRUE | Susanne Kehling H�y |
| 4031 | Bikubenfonden | TRUE | TRUE | Peter Nyemann |
| 3856 | BILLUMS PRIVATSKOLE | TRUE | TRUE | admin |
| 4190 | Bodylab ApS | TRUE | TRUE | admin |
| 4191 | Boliga ApS | TRUE | TRUE | Peter Nyemann |
| 4063 | By ACRE Aps | TRUE | TRUE | admin |
| 4415 | CGI Danmark A/S | TRUE | TRUE | Martin Pierre Devantier |
| 3835 | Coop Bank A/S | TRUE | TRUE | admin |
| 1751 | Daman.dk (Daman P/S) | TRUE | TRUE | Jeppe Berggreen |
| 4192 | Danske D�ves Landsforbund | TRUE | TRUE | Martin Pierre Devantier |
| 4434 | danske spil | TRUE | TRUE | Susanne Kehling H�y |
| 1764 | Den Intelligente Krop ApS | TRUE | TRUE | admin |
| 814 | Direct Gruppen A/S | TRUE | TRUE | admin |
| 2403 | DUMMY KUNDE TIL INDL�SNING AF JOBS | TRUE | TRUE | admin |
| 4224 | Ensured Aps  | TRUE | TRUE | Grethe Fugleholm Berg |
| 4157 | Fashion Society A/S | TRUE | TRUE | admin |
| 3887 | Freelance v/Emil Nissen (Emilnissen.dk) | TRUE | TRUE | Jeppe Berggreen |
| 1424 | Funguide | TRUE | TRUE | admin |
| 4423 | HK �stjylland | TRUE | TRUE | Martin Pierre Devantier |
| 4066 | HSCPH ApS | TRUE | TRUE | admin |
| 4327 | InsightOne Nordic AB | TRUE | TRUE | Martin Pierre Devantier |
| 672 | Institut for Medier, K�benhavns Universitet | TRUE | TRUE | admin |
| 4331 | JKZ Holding Aps | TRUE | TRUE | Peter Nyemann |
| 4201 | Kunstnersammenslutningen Fuga | TRUE | TRUE | Martin Pierre Devantier |
| 2425 | L�n og Spar Bank | TRUE | TRUE | Grethe Fugleholm Berg |
| 1844 | MASAI CLOTHING COMPANY ApS | TRUE | TRUE | admin |
| 1848 | MEDIEGURUERNE & PRINTGURUERNE ApS | TRUE | TRUE | Peter Nyemann |
| 4311 | Motus A/S | TRUE | TRUE | admin |
| 4227 | NexusOne | TRUE | TRUE | Peter Nyemann |
| 3740 | Norsk Elkraft Danmark A/S | TRUE | TRUE | admin |
| 4206 | P. Lindberg A/S | TRUE | TRUE | Grethe Fugleholm Berg |
| 4220 | Playable ApS | TRUE | TRUE | admin |
| 4346 | Reaktion SE | TRUE | TRUE | Jeppe Berggreen |
| 1643 | Skanva AS | TRUE | TRUE | admin |
| 2408 | Skanva ehf | TRUE | TRUE | admin |
| 4211 | Skanva F�nster AB (c/o Wistrand Advokatbyr�) | TRUE | TRUE | admin |
| 3851 | SONNIMAX A/S | TRUE | TRUE | admin |
| 4260 | Svane K�kkenet Hiller�d ApS | TRUE | TRUE | Martin Pierre Devantier |
| 4213 | Thansen AB | TRUE | TRUE | Jeppe Berggreen |
| 3825 | THANSEN AS (NO) | TRUE | TRUE | Jeppe Berggreen |
| 4214 | Theis Vine ApS | TRUE | TRUE | admin |
| 4228 | Unfold Copenhagen ApS | TRUE | TRUE | Jeppe Berggreen |
| 4601 | Uni Forsikring | TRUE | TRUE | Grethe Fugleholm Berg |
| 1679 | VIEGAND MAAG�E A/S | TRUE | TRUE | admin |
| 1681 | VINDUESGROSSISTEN ApS | TRUE | TRUE | admin |
| 4223 | Workshops for Retirement | TRUE | TRUE | admin |

## Summary

The above 52 clients have been identified as needing to be marked inactive based on the "Inactive" column in the CSV file.

### API Update Required

These clients need to be updated via the Workbook API PATCH endpoint:
- Endpoint: `PATCH /resource/customer`
- Field to update: `Active: false`

### Client IDs for Batch Update

```json
[
  "4185",
  "4186",
  "4187",
  "3811",
  "4664",
  "4445",
  "1604",
  "4031",
  "3856",
  "4190",
  "4191",
  "4063",
  "4415",
  "3835",
  "1751",
  "4192",
  "4434",
  "1764",
  "814",
  "2403",
  "4224",
  "4157",
  "3887",
  "1424",
  "4423",
  "4066",
  "4327",
  "672",
  "4331",
  "4201",
  "2425",
  "1844",
  "1848",
  "4311",
  "4227",
  "3740",
  "4206",
  "4220",
  "4346",
  "1643",
  "2408",
  "4211",
  "3851",
  "4260",
  "4213",
  "3825",
  "4214",
  "4228",
  "4601",
  "1679",
  "1681",
  "4223"
]
```
