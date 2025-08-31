# Use Case : Manage Approvals  
ID: UC-007  
Priority: 2  
Theme: Node Data Entry

## Summary  
This use case defines how users capture and track approvals required for a node. Approvals represent formal sign-off by stakeholders before the node can proceed or be considered complete. Users must specify whether an approval is required, who the approver is, and track approval status.

## Out of Scope  
- Digital signature workflows  
- Notifications or automated approver workflows  
- Role-based access control for approver assignment  

## Reference Documents  
- PRP Section 2.4.1 – Approvals Popout  
- PRP: Node Status and Approval Logic  

## Primary Actor  
Role: Workflow Editor (e.g., Project Engineer)

## Stakeholders & Interests  
- Approver: Must confirm scope readiness or completion  
- QA or PMO: Audits approval records for compliance  
- Execution Team: Relies on approvals before initiating work  

## Preconditions  
- Node is created and selected  
- Workflow is in editable state  
- User has access to open Approvals popout  

## Main Success Flow  
Given the user selects a node  
And opens the Approvals panel  
When the user sets “Approval Required = Yes”  
Then fields for Approver Name and Status are shown  
And the user enters approver details  
And selects current approval status  
Then the entry is saved to node data  
And badge counter reflects presence of an approval  

## Scenario: Alternate Success Flow : Approval Not Required  
Given the user opens Approvals panel  
When they set “Approval Required = No”  
Then approver fields are hidden  
And no badge is shown  

## Error Handling  
Given Approval Required = Yes  
When the user leaves Approver field empty  
Then the system blocks save and highlights missing input  

## Postconditions  
- Approval object is stored in node data  
- UI badge is updated based on approval presence  
- Status becomes available for readiness validation logic  

## Data  
Inputs:  
- Approval Required (boolean, required)  
- Approver Name (string, required if required = true)  
- Approver Email (string, optional)  
- Approval Status (enum: Pending, Approved, Rejected)  
Outputs:  
- node.data.approval = {required, approver, email, status}

## Acceptance Criteria  
- [ ] Approvals can be toggled on/off per node  
- [ ] Required fields enforced when enabled  
- [ ] Status field shown only when approval is required  
- [ ] Badge reflects approval presence  

## Open Questions  
- Should there be a date field for when approval was granted?  
- Should approvals be linkable to actual signed certificates?
