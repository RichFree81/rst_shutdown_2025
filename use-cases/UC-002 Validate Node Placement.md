# Use Case : Validate Node Placement
ID: UC-002  
Priority: 1  
Theme: Workflow Canvas Interaction

## Summary  
This use case ensures that users placing nodes on the workflow canvas are guided by rules that prevent overlap and maintain a minimum spacing buffer between nodes. This visual validation ensures legibility, avoids downstream logic errors, and keeps the workflow readable and presentable.

## Out of Scope  
- Connection validation between nodes  
- Node data validation (handled in separate use cases)  
- Backend persistence of node positions  

## Reference Documents
- Project Requirements Package – Workflow Canvas Constraints  

## Primary Actor  
Role: Workflow Editor (Project Engineer or Package Planner)

## Stakeholders & Interests  
- Project Reviewers: Require clean, legible diagrams for review and audit  
- Developers: Enforce front-end layout constraints for reliable canvas behavior  
- QA Team: Require deterministic snap behavior to write test cases  

## Preconditions  
- A workflow has been created and is open in the canvas  
- The user is authorized to edit this workflow  
- Grid and snap-to-grid features are active  
- Minimum node spacing constraint is configured (75px in all directions)

## Main Success Flow  
Given the user is editing a workflow  
And the canvas has existing nodes placed  
When the user drags a new node or moves an existing one  
Then the system checks if the node violates the minimum spacing  
And if invalid, the node is outlined red and flagged as invalid  
And on release, the node snaps back to its last valid position  

## Scenario: Alternate Success Flow : Move Node to Valid Position  
Given the node was previously in an invalid red zone  
When the user moves it to a valid location  
Then the red outline disappears  
And the node snaps to grid and becomes valid  

## Error Handling  
Given the node is dragged too fast or outside canvas bounds  
When the system cannot determine validity  
Then the node snaps back to its last known valid position  

## Postconditions  
- Nodes maintain minimum spacing buffer  
- No overlaps or stacking of nodes  
- Invalid placement is visually flagged during drag

## Data  
Inputs:  
- Node position (x,y)  
- Grid size  
- Existing node bounding boxes  
Outputs:  
- Node position (snapped or restored)  
- Node UI state (valid/invalid flag)  

## Acceptance Criteria  
- [ ] Nodes cannot be dropped in overlapping or under-spaced zones  
- [ ] Visual cue (red highlight) shown for invalid drop  
- [ ] On drop into invalid space, node returns to previous location  
- [ ] On valid move, node aligns to grid  

## Open Questions  
- Should spacing rules be configurable per workflow type?  
- Do system messages need to be logged for invalid drop attempts?  
