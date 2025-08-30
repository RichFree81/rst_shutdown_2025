# RST Projects Portal – Turnarounds Domain
## Work Package: Overview Tab Specification

### Tab Name
- **Overview**

---

### 1. Basic Work Package Data
Mandatory identification and ownership details.
- Package ID (system-generated unique identifier)
- Package Name (descriptive title)
- Discipline (Mechanical, EC&I, Civils, etc.)
- Package Owner (Manager / Engineer / Planner / Technician)
- Related Project ID (link to parent project)
- Related Project Name (display name of parent project)
- Overall Status (Not Started / In Progress: On Track / In Progress: At Risk / On Hold / Complete)

---

### 2. Key Performance Indicators (KPIs)
High-level status indicators for package lifecycle. Each KPI is displayed with a status badge (On Track / At Risk / Delayed / Complete / Not Started).
- Shutdown Readiness
- Works Execution
- Return to Service
- Close-out

---

### 3. Scope Summary
Concise narrative of the package scope. Each section supports multiline text (can be more than one paragraph).
- Purpose (overall intent of the works in relation to the turnaround)
- Overview of Works (big picture description of activities)
- Pre-Turnaround Work (work to be completed before the outage starts)
- Turnaround Work (work to be completed during the outage window)
- Post-Turnaround Work (work to be completed after restart/return to service)
- End Deliverables (tangible outputs expected)
- Constraints (critical limitations, conditions, or assumptions shaping execution)

---

### 4. Data Presentation Requirements
- **Layout**: Top block for package identity; KPIs in a single row; Scope Summary as multiline sections.
- **Status Indicators**: Badges color-coded (Green = On Track, Yellow = At Risk, Red = Delayed, Grey = Not Started, Blue = Complete).
- **Links**: Package ID and Related Project ID clickable to navigate to respective records.
- **Responsiveness**: Must display cleanly on desktop (grid) and mobile (stacked cards).

---

### 5. Wireframe: Work Package Overview Tab

```
+==================================================================================================+
| [WP-001] Furnace 4 Refractory Replacement                                                        |
+==================================================================================================+
| Related Project: [PRJ-123] Furnace 4 Major Shutdown        | Overall Status: [In Progress - Green] |
+--------------------------------------------------------------------------------------------------+
| Discipline: Mechanical                                     | Package Owner: John Doe (Planner)     |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Key Performance Indicators (KPIs)                                                               |
+--------------------------------------------------------------------------------------------------+
| Shutdown Readiness   | Works Execution   | Return to Service   | Close-out                        |
| [On Track - Green]   | [At Risk - Yellow]| [Delayed - Red]     | [Not Started - Grey]              |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Scope Summary                                                                                    |
+--------------------------------------------------------------------------------------------------+
| Purpose:                                                                                         |
| ----------------------------------------------------------------------------------------------- |
| (multiline text field)                                                                           |
|                                                                                                  |
| Overview of Works:                                                                               |
| ----------------------------------------------------------------------------------------------- |
| (multiline text field)                                                                           |
|                                                                                                  |
| Pre-Turnaround Work:                                                                             |
| ----------------------------------------------------------------------------------------------- |
| (multiline text field – scaffolding, prefabrication, permits, inspections)                       |
|                                                                                                  |
| Turnaround Work:                                                                                 |
| ----------------------------------------------------------------------------------------------- |
| (multiline text field – main execution activities)                                               |
|                                                                                                  |
| Post-Turnaround Work:                                                                            |
| ----------------------------------------------------------------------------------------------- |
| (multiline text field – commissioning, demobilisation, documentation)                           |
|                                                                                                  |
| End Deliverables:                                                                                |
| ----------------------------------------------------------------------------------------------- |
| (multiline text field)                                                                           |
|                                                                                                  |
| Constraints:                                                                                     |
| ----------------------------------------------------------------------------------------------- |
| (multiline text field)                                                                           |
+--------------------------------------------------------------------------------------------------+
```
