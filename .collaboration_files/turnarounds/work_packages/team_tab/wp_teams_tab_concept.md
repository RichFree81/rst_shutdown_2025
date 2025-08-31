# RST Projects Portal – Turnarounds Domain  
## Work Package: Teams Tab Specification  

### Tab Name
- **Team**

---

### 1. Assigned Team Members  
Package-specific accountability and contact details.  
- Role (Contractor Representative, SHE Rep, Project Manager, Package Manager, etc.)  
- Company / Department (Contractor firm or Client department)  
- Name (assigned individual)  
- Phone (primary contact number)  
- Email (work email address)  

---

### 2. Escalation Paths  
Defines how events are escalated at the package level. Each entry points to a structured escalation form.  
- Event / Trigger (e.g., Safety Incident – Minor, Schedule Delay, Variation Request)  
- Description (short narrative of the event/trigger)  
- Escalation Path (table of steps opened in form when viewed)  
  - Step No. (sequence of escalation)  
  - Action (responsibility or required action at this step)  

---

### 3. Data Presentation Requirements  
- **Layout**:  
  - Section 1: Assigned Team table with “Add Member” button placed at the bottom left.  
  - Section 2: Escalation Paths table with “Add Event” button placed at the bottom left.  
- **Actions**:  
  - Assigned Team: Only “View” option on rows; edit/delete/export available inside the form.  
  - Escalation Path: “View” option opens escalation form showing steps in table format.  
- **Forms**:  
  - Team Member Form: Role, Company/Department, Name, Phone, Email.  
  - Escalation Path Form: Header with Event + Description, table of steps (editable), with Edit/Delete/PDF Export options.  
- **Responsiveness**:  
  - Desktop: tables displayed in full grid layout.  
  - Mobile: tables collapse into stacked card format for clarity.  
- **Locking**:  
  - When locked, add/edit/delete actions are disabled, but view remains available.  

---

### 4. Wireframe: Work Package Teams Tab  

```
+==================================================================================================+
| [WP-014] Secondary Crusher Rebuild                                                              |
+==================================================================================================+
| Assigned Team                                                                                   |
+--------------------------------------------------------------------------------------------------+
| Role                        | Company / Department | Name          | Phone        | Email        |
| Contractor Representative   | ABC Contractors      | John Smith    | +27 82...    | john@abc...  |
| SHE Representative (Client) | RST SHE Dept         | Mary Jones    | +27 83...    | mary@rst...  |
| Project Manager             | RST Projects         | R. Freemantle | +27 82...    | richard@rst. |
| Package Manager             | RST Projects         | Jane Doe      | +27 82...    | jane@rst...  |
+--------------------------------------------------------------------------------------------------+
| [Add Member]                                                                                     |
+==================================================================================================+

+==================================================================================================+
| Escalation Paths                                                                                |
+--------------------------------------------------------------------------------------------------+
| Event / Trigger             | Description                                  | Escalation Path     |
| Safety Incident (Minor)      | First-aid injury / near miss                 | [View]              |
| Safety Incident (Major)      | Serious injury, fatal risk                   | [View]              |
| Schedule Delay               | Shift delay impacting plan                   | [View]              |
| Variation Request            | Contractor requests scope change             | [View]              |
+--------------------------------------------------------------------------------------------------+
| [Add Event]                                                                                      |
+==================================================================================================+

(When “View” is selected → open Escalation Path Form)  

Escalation Path Form (Table Based):
+==================================================================================================+
| Escalation Path: Safety Incident (Minor)                                                        |
| Description: First-aid injury / near miss                                                       |
+--------------------------------------------------------------------------------------------------+
| Step | Action                                                                                   |
| 1    | Notify Contractor Rep                                                                    |
| 2    | Escalate to SHE Rep                                                                      |
| 3    | Inform Project Manager                                                                   |
+--------------------------------------------------------------------------------------------------+
| [Edit] [Delete] [Export PDF]                                                                    |
+==================================================================================================+
```