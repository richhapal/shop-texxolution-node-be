<!--
  Consolidated Main API Contract
  This file includes the full detailed contents of the Public API, Dashboard Enquiry API,
  and Dashboard Quotation API contracts for a single-reference document while the
  original detailed files remain available separately in the `contracts/` folder.
-->

# Main API Contract — Consolidated

This consolidated contract compiles the full public and dashboard contracts into one reference.
Use the individual files in `contracts/` for modular documentation and machine parsing.

---

## Public API Contract

<!-- include public contract -->

````markdown
{::options parse_block_html="true"}

<!-- BEGIN PUBLIC CONTRACT -->

<!-- Content copied from PUBLIC_API_CONTRACT.md -->

{{PUBLIC_API_CONTRACT}}

<!-- END PUBLIC CONTRACT -->

````

---

## Dashboard Enquiry API Contract

````markdown
{::options parse_block_html="true"}

<!-- BEGIN DASHBOARD ENQUIRY CONTRACT -->

<!-- Content copied from DASHBOARD_ENQUIRY_API_CONTRACT.md -->

{{DASHBOARD_ENQUIRY_CONTRACT}}

<!-- END DASHBOARD ENQUIRY CONTRACT -->

````

---

## Dashboard Quotation API Contract

````markdown
{::options parse_block_html="true"}

<!-- BEGIN DASHBOARD QUOTATION CONTRACT -->

<!-- Content copied from DASHBOARD_QUOTATION_API_CONTRACT.md -->

{{DASHBOARD_QUOTATION_CONTRACT}}

<!-- END DASHBOARD QUOTATION CONTRACT -->

````

---

## Notes

- The `unit` field is mandatory across enquiries and quotations and validated by product category.
- Allowed units mapping is defined in `config/categoryUnits.js` and documented in each contract.
- Keep the separate detailed files updated — this consolidated file is a convenience reference.

Last updated: 22 November 2025
# Main API Contract

This is the consolidated API contract for Shop Texxolution. It highlights the key public and dashboard API changes made in recent updates — notably the enforcement of mandatory `unit` fields per product category for enquiries and quotations.

Base URL (example):
- Development: `http://localhost:3000/api`
- Public: `/api/public`
- Dashboard: `/api/dashboard`

**Quick summary**
- Every product line in `enquiry` and `quotation` payloads must include a `unit` field.
- Units are validated against a category-specific allowed list defined in `config/categoryUnits.js`.
- If `unit` is missing or invalid the API returns HTTP 400 with the following body:

```json
{
  "success": false,
  "message": "Invalid unit for category <category>. Allowed units: <units[]>"
}
```

Allowed units mapping (canonical)

- Yarn: ["kg", "cones"]
- Garments: ["pcs", "dz"]
- Denim: ["m", "yards", "rolls"]
- Greige Fabric: ["m", "yards", "rolls", "kg"]
- Finished Fabrics: ["m", "yards", "rolls"]
- Fabric (Finished): ["m", "yards", "rolls"]
- Fibre: ["kg", "bales", "tons"]
- Textile Farming: ["kg", "quintal", "bales", "tons"]
- Home Decoration: ["pcs", "sets", "m"]
- Trims & Accessories: ["pcs", "m", "rolls", "sets"]
- Packing: ["pcs", "kg", "sets"]
- Dyes & Chemicals: ["kg", "liters", "tons", "drums"]
- Machineries & Equipment: ["pcs", "units", "sets"]

Where these rules apply
- Public endpoint: `POST /api/public/enquiry` (now expects `products[]` with `productId, quantity, unit, notes`)
- Dashboard create quotation: `POST /api/dashboard/quotations` (items require `unit`)
- Dashboard update quotation: `PATCH /api/dashboard/quotations/:id` (product updates validated)

Request examples (public enquiry)

Request

```http
POST /api/public/enquiry
Content-Type: application/json

{
  "customerName": "John Doe",
  "company": "ABC Garments",
  "email": "john@example.com",
  "phone": "+1234567890",
  "message": "Requesting pricing",
  "products": [
    { "productId": "<id>", "quantity": 500, "unit": "m", "notes": "sample" }
  ]
}
```

Success (201) partial response

```json
{
  "success": true,
  "message": "Enquiry submitted successfully.",
  "data": { "enquiry": { "enquiryNo": "ENQ...", "products": [ { "productId": "<id>", "quantity": 500, "unit": "m" } ] } }
}
```

Notes for frontend teams
- Use the `config/categoryUnits.js` mapping (or the `/api/public/units` endpoint if implemented) to populate `unit` dropdowns per product category.
- Make `unit` a required field on enquiry and quotation forms.

Detailed contract files
- Public detailed contract: `contracts/PUBLIC_API_CONTRACT.md`
- Dashboard enquiries: `contracts/DASHBOARD_ENQUIRY_API_CONTRACT.md`
- Dashboard quotations: `contracts/DASHBOARD_QUOTATION_API_CONTRACT.md`

Change log
- Added `config/categoryUnits.js` mapping allowed units by product category.
- Added `unit` field to `Enquiry` and `Quotation` models.
- Validated units in `src/controllers/enquiryController.js` and `src/controllers/dashboardQuotationController.js`.
- Updated contracts to document the new requirement.

If you want a small public endpoint to fetch the allowed units mapping for the frontend, I can add `GET /api/public/units` that returns the `categoryUnits` JSON.

---

Last updated: 22 November 2025
