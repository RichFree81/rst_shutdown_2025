# Use Case : Handover Node Completion  
ID: UC-013  
Priority: 2  
Theme: Workflow Completion & Turnover

## Summary  
This use case ensures that the final step in the workflow explicitly captures the formal handover back to Engineering and Operations. It confirms that all site works have been completed, documentation submitted, and acceptance criteria met. The handover node serves as the closure mechanism for the work package.

## Out of Scope  
- Final signature workflows  
- Email or document dispatch mechanisms  
- Physical site access revocation  

## Reference Documents  
- PRP Section 2.3 – Site Handover Node  
- PRP Default Node Templates  

## Primary Actor  
Role: Workflow Editor or Package Owner

## Stakeholders & Interests  
- Engineering Manager: Accepts the package back into operational control  
- Operations Lead: Ensures safe and documented return of the system  
- Quality Assurance: Requires confirmation of documentation and signoffs  

## Preconditions  
- Workflow contains a Site Handover Node  
- All preceding nodes are marked as Completed  
- Required deliverables and approvals have been submitted  

## Main Success Flow  
Given the user opens the Site Handover Node  
And confirms that all checklist items are fulfilled  
When the user clicks “Mark Node Complete”  
Then the system validates required handover data  
And updates the node status to Completed  
And optionally logs the completion with timestamp and user  

## Scenario: Alternate Success Flow : Partial Acceptance  
Given not all required handover items are submitted  
When the user clicks “Mark as Partially Accepted”  
Then the system logs the acceptance but retains an alert icon  

## Error Handling  
Given the node is missing required approvals  
When the user tries to mark it as complete  
Then the system blocks the action and shows:  
“Node cannot be marked as complete until all approvals and deliverables are submitted.”  

## Postconditions  
- Node status is Completed (or Partially Accepted)  
- Workflow can be closed/finalized  
- Event is available for audit  

## Data  
Inputs:  
- Node ID  
- Checklist items (boolean confirmations)  
- Optional handover certificate uploads (<<TBC>>)  
Outputs:  
- node.status = Completed  
- Completion timestamp and user  

## Acceptance Criteria  
- [ ] Node cannot be completed without required items  
- [ ] Status reflects finalization in UI  
- [ ] Event is logged with time and user ID  
- [ ] Partial handover is supported if allowed  

## Open Questions  
- Should document uploads be mandatory at this step?  
- Is partial acceptance allowed for specific work package types?
