# Use Case : Capture Node Activities  
ID: UC-004  
Priority: 2  
Theme: Node Data Entry

## Summary  
This use case defines how users assign structured “Activities” to each node within the workflow. Activities define the actionable steps required to complete that node’s scope. Some activities are prepopulated based on node template type (e.g. Scoping, Procurement), while others are entered manually or modified by the user.

## Out of Scope  
- Validation of activity content  
- Role assignments or scheduling of activities  
- Dependencies between activities within a node  

## Reference Documents  
- PRP: Node Templates  
- PRP: Default Data Sets  

## Primary Actor  
Role: Workflow Editor (e.g., Project Engineer)

## Stakeholders & Interests  
- Planner: Uses activity list to build work schedules  
- Quality Auditor: Expects activities to be traceable to scope and deliverables  
- Execution Team: Receives defined activities for site execution  

## Preconditions  
- Workflow has been created and is in editable state  
- At least one node exists  
- User has access to open the Activities popout panel  

## Main Success Flow  
Given a node is placed on the canvas  
And the user opens the Activities popout panel  
When the system detects the node’s template  
Then the panel shows default activities (if available)  
And the user can add, remove, or edit activity entries  

## Scenario: Alternate Success Flow : No Default Activities  
Given a custom node template is selected  
When the user opens the Activities panel  
Then the panel starts empty  
And the user can define new activities manually  

## Error Handling  
Given the user attempts to save an activity with a missing required field  
When the Save button is clicked  
Then an error message is displayed and the field is highlighted  

## Postconditions  
- Node data includes a structured list of activities  
- Badge counter on the Activities icon is updated  
- Data is available for backend sync  

## Data  
Inputs:  
- Activity Name (string, required): what must be done  
- Description (string, optional): further detail  
- Category (enum, optional): discipline/type  
Outputs:  
- Stored in node.data.activities as array of objects  

## Acceptance Criteria  
- [ ] Default activities are shown for known templates  
- [ ] User can add/edit/delete activities  
- [ ] Save is blocked if required fields are missing  
- [ ] Badge counter updates to reflect activity count  

## Open Questions  
- Should activity categories be predefined or freeform?  
- Is there a maximum number of activities per node?
