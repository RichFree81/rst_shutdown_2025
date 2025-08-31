# RST Projects Portal – Turnarounds Domain
## Work Package: Cost Tab Specification

### Tab Name
- **Cost**

---

### 1. Header Information
Mandatory identification and procurement linkage details.
- **RTO Number** (manually entered, one per package; linked to popout RTO form)
- **PO Number** (manual entry, procurement reference)
- **Status** (dropdown menu: Awaiting Scoping, Awaiting Tender Pack, Awaiting Bid Submissions, Pending Award, Awarded)

---

### 2. Contract Summary
Key cost aggregates, auto-calculated where noted.
- **Original Contract Price** (manual entry; editable in global Edit mode, locked when tab is locked)
- **Approved Variations** (calculated: sum of approved variation orders)
- **Revised Contract Price** (calculated: Original + Approved)
- **Pending Variations** (calculated: sum of pending variation orders)
- **Estimate Final Contract Price** (calculated: Revised + Pending)
- **Allowances / Provisional Sums** (manual entry; editable in global Edit mode, locked when tab is locked)

---

### 3. Cost Breakdown
Tabular breakdown of contract cost items.
- **Columns**: Item | Description | Value (R)
- **Row Controls** (when in Edit mode): Add new item (button below table, left aligned), Delete row
- **Behaviours**:
  - Values editable only when global Edit enabled
  - Table locked when tab is locked
  - Summation of cost items not auto-linked to Original Contract Price (kept as manual field)

---

### 4. Variation Orders
Variation orders linked to the package.
- **Columns**: VO Number | Description | Value (R) | Status | Date Raised | Date Approved | Actions
- **Status**: Always selectable dropdown (Proposed, Approved, Rejected, Pending, In Progress)
- **Actions**: Single **View** icon → opens popout VO form
- **VO Popout Form** (per record):
  - Fields: VO Number, Description, Value, Status, Date Raised, Date Approved
  - Actions: Edit, Save, Cancel, Delete, Export PDF
- **Row Controls**: Add New… button (below table, left aligned) → opens popout VO form template

---

### 5. Requisition to Order (RTO)
One RTO per package, initiated via RTO field in header.
- **RTO Popout Form**:
  - Fields: RTO Number, Supplier, Contact Person, Email, Notes/Scope Summary
  - **Line Items**: Derived from Cost Breakdown (with option to reload), selectable include/exclude per item
  - **Subtotal**: Sum of included items
  - Actions: Edit, Save, Cancel, Send to Procurement, Export PDF
- **Behaviour**: Once created, RTO number is written back to header. Additional orders handled via Variation Orders.

---

### 6. Editing Model
- **Global Edit Toggle** (top right): Enables editing of all editable fields (except Variation Orders, managed separately)
- **Lock Toggle**: Prevents editing of RTO Number, PO Number, Status, Original Contract Price, Allowances, and Cost Breakdown
- **Variation Orders**: Managed independently via row-level popout forms

---

### 7. Data Presentation Requirements
- **Layout**: Stacked package heading, header row (RTO/PO/Status), Contract Summary, Cost Breakdown, Variation Orders
- **Status Indicators**: Dropdowns for workflow; badges for statuses in view mode
- **Buttons**: Left-aligned Add New/Add Item, top-right global Edit/Lock
- **Responsiveness**: Clean grid layout on desktop; stacked cards on mobile

---

### 8. Wireframe: Work Package Cost Tab

```
+==================================================================================================+
| [WP-001] Furnace 4 Refractory Replacement                                                        |
+==================================================================================================+
| RTO Number: [RTO-001] (button: Create/Open RTO) | PO Number: [PO-789] | Status: [Pending Award] |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Contract Summary                                                                                 |
+--------------------------------------------------------------------------------------------------+
| Original Contract Price: R 3,500,000    | Approved Variations: R 150,000                         |
| Revised Contract Price:  R 3,650,000    | Pending Variations:  R 350,000                         |
| Estimate Final Contract Price: R 4,000,000 | Allowances/Provisional Sums: R 200,000              |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Cost Breakdown                                                                                   |
+--------------------------------------------------------------------------------------------------+
| Item                 | Description               | Value (R)                                      |
| -------------------- | ------------------------- | --------------------------------------------- |
| Civil Works          | Excavation & foundations  | R 1,200,000                                    |
| Mechanical Works     | Refractory installation   | R 2,500,000                                    |
| EC&I Works           | Instrument cabling        | R   800,000                                    |
| Other                | Site facilities           | R   500,000                                    |
| ----------------------------------------------------------------------------------------------- |
| [Add Cost Item] (button, left aligned)                                                           |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Variation Orders                                                                                 |
+--------------------------------------------------------------------------------------------------+
| VO No  | Description               | Value (R) | Status   | Date Raised | Date Approved | Actions |
| ------ | ------------------------- | --------- | -------- | ----------- | ------------- | ------- |
| VO-01  | Extra scaffolding         | R 150,000 | Approved | 2025-07-10  | 2025-07-12    | [View]  |
| VO-02  | Additional lining material| R 350,000 | Pending  | 2025-07-15  | -             | [View]  |
| ----------------------------------------------------------------------------------------------- |
| [Add New…] (button, left aligned)                                                                |
+--------------------------------------------------------------------------------------------------+
```
