# Use Case : Create Workflow for a Work Package
ID: UC-001  
Priority: 1  
Theme: Workflow Canvas Interaction

## Summary  
This use case describes how a project engineer initiates the creation of a new workflow for a defined work package. The workflow serves as a structured, visual representation of the sequence and interdependencies of project activities, enabling traceable and auditable package planning and execution.

## Out of Scope  
- Editing existing workflows  
- Validation of node spacing, connections, or templates  
- Saving to backend (covered in later use cases)

## Reference Documents
- Project Requirements Package – Workflow Builder for Engineering Project Packages

## Primary Actor  
Role: Project Engineer

## Stakeholders & Interests  
- Package Owner: Needs visibility into structured sequence of tasks for oversight  
- Execution Team: Receives defined scope and sequence for downstream delivery  
- Quality & HSE Auditors: Review structure for completeness and compliance  

## Preconditions  
- User is authenticated  
- Work Package record exists  
- User has edit permissions on the package  

## Main Success Flow  
Given the user is viewing a work package  
And the package has no existing workflow  
When the user clicks “Create Workflow”  
Then a new workflow canvas is initialized  
And a Flow Start node is added automatically to the canvas  
And the user is presented with an empty canvas to begin node placement  

## Scenario: Alternate Success Flow : Recreate Existing Workflow  
Given the user is viewing a package with an archived workflow  
When the user clicks “Create Workflow”  
Then the system prompts to either restore archived version or start fresh  

## Error Handling  
Given the package ID is invalid or access is denied  
When the user clicks “Create Workflow”  
Then an error message is shown: “Unable to create workflow. Check access or package validity.”  

## Postconditions  
- A new workflow record is created in frontend state  
- The Flow Start node is locked in as the first element  
- Workflow status is set to “Draft”

## Data  
Inputs:  
- Work Package ID (UUID): identifies the package  
- User ID: for audit trail  
Outputs:  
- Workflow ID  
- Timestamp of creation  

## Acceptance Criteria  
- [ ] Canvas opens with Flow Start node present  
- [ ] No other nodes pre-populated  
- [ ] System prevents multiple workflows per package  
- [ ] Errors are logged and visible to the user  

## Open Questions  
- What metadata should be associated with a new workflow record (e.g., version, phase)?
- Is there a requirement to track who created the workflow in UI vs backend?
