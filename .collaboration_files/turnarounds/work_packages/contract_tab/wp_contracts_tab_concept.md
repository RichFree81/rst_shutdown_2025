# RST Projects Portal – Turnarounds Domain
## Work Package: Contracts Tab Specification

### Tab Name
- **Contracts**

---

### 1. Purpose
The Contracts tab manages contractual communications and compliance matters under NEC4 Supply Short Contracts (SSC) and Engineering and Construction Short Contracts (ECSC).  
This tab excludes cost control (handled in the Cost tab) and focuses solely on the administration of contractual processes.

---

### 2. Core Communication Types
All contractual matters are captured under three communication categories:

1. **Event-Triggered**  
   Records initiated when an event occurs requiring notification, instruction, or agreement.  
   Examples: Early Warnings, Compensation Events, Defect Notices, Dispute Referrals.

2. **Time-Based / Routine**  
   Records tied to contractual timelines or milestones.  
   Examples: Programme submissions, Payment Certificates, Completion Certificates, Forecasts.

3. **Authority / Discretionary**  
   Instructions or communications issued at the discretion of the Client/PM/Supervisor.  
   Examples: Change to Scope Instructions, Test/Search Instructions, Takeover Instructions.

---

### 3. Event-Triggered Communication (Detailed)
Each event-triggered record includes a parent **Triggering Event** and a chain of correspondence responses.

**Triggering Event Fields:**
- ID (system-generated unique identifier)
- Originator (Contractor / Supplier / Client / PM)
- Trigger Event (short descriptive title)
- Event Type (EW / CE / Defect / Dispute)
- Clause Reference
- Status (Awaiting Contractor Response / Awaiting Client Response / Pending Meeting / Closed-out, etc.)
- Response/Action By (date – context sensitive, e.g., “Meeting By”, “Reply By”)

**Correspondence Chain:**
- Starts with initial notice/instruction/response issued or received.
- Continues with chronological responses between parties.
- Ends when the event is closed-out (no further responses permitted).

**Draft Responses:**
- Draft responses are maintained separately until logged.
- Drafts can be edited, saved, exported, or deleted before logging.
- New actions cannot be initiated while a draft exists.

**Logged Responses:**
- Logged correspondence is immutable (view-only).
- Actions available: Export as PDF, Close Record.

---

### 4. Time-Based / Routine Records
Covers recurring or milestone-driven submissions and certifications.

**Examples:**
- Programme Submissions (weekly/monthly)
- Payment Certificates (monthly)
- Completion Certificates (milestones)
- Forecasts (periodic)

**Fields:**
- ID
- Type (Programme, Payment Cert, Completion Cert, etc.)
- Clause Reference
- Originator
- Recipient
- Submission Date
- Due/Review Date
- Status (Submitted, Accepted, Rejected, Closed)

---

### 5. Authority / Discretionary Records
Captures Client/PM/Supervisor initiated instructions.

**Examples:**
- Change to Scope Instruction
- Test/Search Instruction
- Takeover Instruction

**Fields:**
- ID
- Instruction Type
- Clause Reference
- Originator
- Recipient
- Issue Date
- Response/Action Required (Y/N)
- Due Date
- Status (Pending, Actioned, Closed)
- Linked Event/CE (if created)

---

### 6. Event/Action Playbook
A predefined table of common contractual scenarios and their step-by-step workflow actions.

**Examples:**
- Early Warning → Meeting → Mitigation Actions → Close
- Instruction Changing Scope → Notify CE → Submit Quotation → PM Decision
- Defect Notification → Contractor Correction → Re-inspection → Close

Each playbook entry defines: Trigger → Responsible Party → Response Timeline → Required Actions → Closure Conditions.

---

### 7. Data Presentation Requirements
- **Layout**: Tabs for each communication category (Event-Triggered, Time-Based, Authority).  
- **Expand/Collapse Trees**: For Event-Triggered, expand to reveal correspondence chains.  
- **Statuses**: Color-coded badges (Green = Open/On Track, Yellow = Due Soon, Red = Overdue, Grey = Closed).  
- **Chain Management**: Drafts outside correspondence chain until logged. Logged items immutable.  
- **Responsiveness**: Desktop (grid + tabs) and mobile (stacked, collapsible cards).

---

### 8. Wireframe: Contracts Tab – Event-Triggered Example

```
+========================================================================================+
| [EW-001] Early Warning: Access Constraint at Bay 4                                    |
+========================================================================================+
| Originator: Contractor     | Type: Early Warning (EW) | Clause: 15  | Status: Pending   |
| Response/Action By: 25-Aug-2025                                                        |
+----------------------------------------------------------------------------------------+
| Correspondence Chain                                                                    |
| -------------------------------------------------------------------------------------- |
| 22-Aug-2025  Contractor → PM  : EW Notification – Access constraint may delay lifts     |
| 23-Aug-2025  PM → Contractor  : Mitigation meeting set for 24 Aug 08:00                 |
|                                                                                         |
| [Draft Response Placeholder – not part of chain until logged]                           |
+----------------------------------------------------------------------------------------+
| Actions: [Save Draft] [Export PDF] [Delete Draft] [Log Response] [Close Event]          |
+----------------------------------------------------------------------------------------+
```

---

### 9. Governance & Compliance
- All communications stored in a form readable, copyable, and recordable (per NEC requirements).  
- Notifications must be distinct and issued separately (no bundling).  
- Automated time-bar calculation for due dates, per NEC clause requirements.  
- Dashboard summary highlighting overdue or pending actions.

---
