# Use Case : Capture Deliverables  
ID: UC-006  
Priority: 2  
Theme: Node Data Entry

## Summary  
This use case defines how users capture structured “Deliverables” for each node. Deliverables represent outputs or artifacts that must be produced or submitted to complete that workflow node. These are essential for downstream approvals, readiness validation, and cross-package coordination.

## Out of Scope  
- Automatic delivery tracking or upload of artifacts  
- Inter-node deliverable dependencies  
- File storage integration  

## Reference Documents  
- PRP Section 2.4.1 – Data Entry Popouts  
- PRP Default Data Sets  

## Primary Actor  
Role: Workflow Editor (e.g., Project Engineer)

## Stakeholders & Interests  
- QA/Document Controller: Requires complete list of deliverables to ensure submission and archiving  
- Engineering Manager: Reviews deliverables for scope completion  
- Approvers: Validate deliverables before sign-off  

## Preconditions  
- Node exists and is selected  
- Workflow is in editable state  
- User has access to Deliverables popout  

## Main Success Flow  
Given a node is selected  
And the user opens the Deliverables panel  
When the user clicks “Add Deliverable”  
Then a form appears to enter deliverable information  
And the user saves the deliverable entry  
Then the deliverable is listed in the node’s Deliverables array  
And the badge counter updates to reflect total  

## Scenario: Alternate Success Flow : Modify Deliverable  
Given a deliverable is already defined  
When the user clicks Edit  
Then the form appears pre-filled  
And the user can update the content and save  

## Error Handling  
Given the user saves a deliverable with missing required fields  
When validation fails  
Then the system blocks save and shows inline errors  

## Postconditions  
- node.data.deliverables is populated with user-defined entries  
- Badge counter is incremented  
- Data becomes available for readiness and handover tracking  

## Data  
Inputs:  
- Deliverable Title (string, required)  
- Type/Format (enum/string, optional)  
- Due Date (date, optional)  
- Notes or Description (string, optional)  
Outputs:  
- node.data.deliverables = array of {title, type, dueDate, notes}

## Acceptance Criteria  
- [ ] User can add, edit, and delete deliverables  
- [ ] Required fields validated  
- [ ] Badge reflects total deliverables  
- [ ] Saved data persists in state  

## Open Questions  
- Should deliverables be linkable to documents or file uploads?  
- Should deliverables have status flags (e.g., Submitted, Approved)?
