# Use Case : Edit Default Data Sets  
ID: UC-009  
Priority: 3  
Theme: Workflow Initialization / Node Customization

## Summary  
This use case allows users to modify the default data values (Activities, Handoffs, etc.) that were auto-assigned to a node via its template. Users can retain, edit, or remove these defaults, enabling template-based initialization without limiting customization for specific package needs.

## Out of Scope  
- Editing the global template definition (this is a config/admin function)  
- Setting new global defaults  
- Batch editing of nodes  

## Reference Documents  
- PRP Section 2.4.1 – Default Data Sets  
- PRP Section 2.3 – Node Templates  

## Primary Actor  
Role: Workflow Editor (e.g., Package Engineer)

## Stakeholders & Interests  
- Execution Lead: Needs deliverables and activities to reflect accurate scope  
- QA/Reviewers: Require traceability of customized entries  
- PMO: Tracks deviations from standard templates for reporting  

## Preconditions  
- Node template has been applied  
- Default data (e.g., activities or handoffs) exists in node.data  
- User has edit permissions on the workflow  

## Main Success Flow  
Given a node with pre-populated data  
And the user opens a data entry panel (e.g., Activities)  
When the user modifies the default text, deletes an entry, or adds a new one  
Then the system updates the node’s internal data  
And marks the data set as “customized” for that node  

## Scenario: Alternate Success Flow : Revert to Defaults  
Given a user has modified the data set  
When they click “Revert to Defaults”  
Then the system restores the original template entries  

## Error Handling  
Given the user leaves a required field blank  
When they click Save  
Then the system highlights the field and blocks submission  

## Postconditions  
- Node contains a customized data set  
- Template link remains but data is no longer default  
- State is flagged for audit/logging  

## Data  
Inputs:  
- Activity / Handoff / Deliverable objects as defined in previous use cases  
- Edited or deleted values  
Outputs:  
- Updated node.data.{activities, handoffs, etc.} arrays  
- Optional: customization flag  

## Acceptance Criteria  
- [ ] Users can modify, delete, or add to default entries  
- [ ] Changes persist within node state  
- [ ] Revert option is available and restores defaults  
- [ ] Data remains structured for validation and sync  

## Open Questions  
- Should customization of default fields trigger an audit log entry?  
- Is there a way to visually distinguish “modified” vs “template” nodes?
