# Use Case : Capture Handoffs  
ID: UC-005  
Priority: 2  
Theme: Node Data Entry

## Summary  
This use case defines how users capture structured Handoffs for each node. Handoffs represent deliverables or dependencies from other packages that are required before this node can begin. They are essential for coordination across teams and for validating workflow readiness.

## Out of Scope  
- Enforcement of inter-package dependencies  
- Validation of referenced package IDs  
- UI filtering or cross-linking to source packages  

## Reference Documents  
- PRP Section 2.4.1 – Handover Inputs  
- PRP Section 2.5 – Popout Display Modes  

## Primary Actor  
Role: Workflow Editor (e.g., Project Engineer)

## Stakeholders & Interests  
- Dependency Owner: Must deliver handoff item before this node can proceed  
- Planner: Uses handoffs to manage sequencing and readiness dependencies  
- QA/Handover Manager: Requires traceability of inputs to ensure readiness  

## Preconditions  
- Workflow is open and editable  
- Node is placed and selected  
- User has access to Handoffs panel  

## Main Success Flow  
Given the user selects a node  
And opens the Handoffs panel  
When the user clicks “Add Handoff”  
Then a form row appears with input fields  
And the user can specify a handoff source and required date  
And the new handoff appears in the list  
And the badge counter updates to reflect total handoffs  

## Scenario: Alternate Success Flow : Add Multiple Handoffs  
Given the user adds one handoff  
When the user clicks “Add Another”  
Then additional rows appear  
And all handoffs are stored when panel is closed  

## Error Handling  
Given a required field is missing (e.g., no Source Package)  
When the user clicks Save  
Then the system highlights the missing field  
And prevents submission until completed  

## Postconditions  
- Node data includes an array of handoff objects  
- Badge counter on red handoff icon reflects count  
- Handoffs are available for validation during execution planning  

## Data  
Inputs:  
- Source Package ID (UUID, required)  
- Deliverable Reference (string, required)  
- Required By Date (ISO 8601, optional)  
Outputs:  
- node.data.handoffs[] = array of {sourcePackageId, deliverableRef, requiredByDate}

## Acceptance Criteria  
- [ ] User can add/remove multiple handoffs  
- [ ] Save is blocked on incomplete rows  
- [ ] Badge count reflects handoff total  
- [ ] Data persists in workflow state  

## Open Questions  
- Should deliverable reference validate against defined Deliverables in other packages?  
- Should Required By Date enforce constraints based on workflow timing?  
