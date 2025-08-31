# Use Case : Track Node Status  
ID: UC-011  
Priority: 2  
Theme: Node Lifecycle & Monitoring

## Summary  
This use case enables users to assign and update the status of a workflow node to reflect its current lifecycle stage (e.g., Not Started, In Progress, Completed). Status changes are visible in the node card UI and can be used to drive validation and reporting logic within the broader workflow.

## Out of Scope  
- Automatic status transitions based on upstream/downstream node logic  
- Notification or alerts based on status changes  
- Status summaries across multiple workflows  

## Reference Documents  
- PRP Section 2.2 – Node Design  
- PRP Node Card Layout (status indicator)  

## Primary Actor  
Role: Workflow Editor or Package Owner

## Stakeholders & Interests  
- Package Owner: Monitors live progress of individual work packages  
- Reviewers/Approvers: Use status for sign-off readiness  
- System Admins: May query statuses for reporting and dashboards  

## Preconditions  
- Node exists on the workflow canvas  
- Status feature is visible in the node card (top right)  
- User has permissions to update node status  

## Main Success Flow  
Given the user is viewing a node  
And the node has an existing status (default = Not Started)  
When the user clicks the status indicator  
Then a dropdown list of valid statuses appears  
And the user selects a new status  
Then the new status is saved to the node  
And the status label updates visually  

## Scenario: Alternate Success Flow : Restricted Status Update  
Given the node has pending required fields (e.g., Approvals = Required but missing approver)  
When the user selects “Completed”  
Then the system blocks the change  
And shows a message: “Node cannot be marked as Completed until all required fields are filled”  

## Error Handling  
Given the user attempts to set an undefined status  
When validation fails  
Then the system reverts to previous value and logs the issue  

## Postconditions  
- Node status is updated in state  
- UI reflects status with consistent label and styling  
- Data is available for backend sync or reporting  

## Data  
Inputs:  
- Node ID  
- New Status (enum): Not Started, In Progress On Track, In Progress At Risk, Completed, Blocked  
Outputs:  
- node.data.status = selected enum value  
- UI badge color and label reflect the value  

## Acceptance Criteria  
- [ ] Status indicator visible in node card  
- [ ] Status can be changed via dropdown  
- [ ] Invalid transitions are blocked  
- [ ] Status change persists in workflow state  

## Open Questions  
- Should status changes trigger audit logs or timestamps?  
- Can statuses be locked by role (e.g., only QA can mark as Completed)?
