# Use Case : Enforce Workflow Start Node  
ID: UC-012  
Priority: 1  
Theme: Workflow Canvas Validation

## Summary  
This use case ensures that every workflow begins with a single, non-deletable Flow Start node, which serves as the mandatory origin point for all node sequences. This enforces visual and logical consistency across all work packages and enables rule-based execution logic downstream.

## Out of Scope  
- Defining what downstream node must follow the start node  
- Editing or moving the Flow Start node once placed  
- Handling circular logic or exit points  

## Reference Documents  
- PRP Section 2.2 – Node Design  
- PRP Section 2.3 – Default Workflow Rules  

## Primary Actor  
Role: Workflow Editor (Project Engineer)

## Stakeholders & Interests  
- PMO: Requires consistency across all workflows  
- Developers: Enforce layout and validation logic on canvas load  
- QA/Auditors: Rely on predictable workflow structure for traceability  

## Preconditions  
- Workflow is being created or loaded  
- No other nodes exist (on new creation) or Start node already exists  

## Main Success Flow  
Given a user initiates a new workflow  
When the canvas initializes  
Then the system automatically adds a Flow Start node at the top-left position  
And the node is locked in position and non-deletable  
And the node is visually distinct from activity nodes  

## Scenario: Alternate Success Flow : Reopen Existing Workflow  
Given the user reopens an existing workflow  
When the canvas loads  
Then the system confirms the presence of a Flow Start node  
And prevents workflow actions if missing  

## Error Handling  
Given the Start node is manually deleted via DOM or broken state  
When the canvas attempts to render  
Then the system regenerates the Flow Start node and logs the repair  

## Postconditions  
- Every workflow has exactly one Start node  
- Start node cannot be deleted or converted  
- All valid node paths trace to or from the Start node  

## Data  
Inputs:  
- None (Start node is system-generated)  
Outputs:  
- node.type = "FlowStart"  
- node.locked = true  

## Acceptance Criteria  
- [ ] Flow Start node auto-injected on workflow creation  
- [ ] Cannot delete or reassign Start node  
- [ ] Canvas blocks load if Start node is missing  
- [ ] Visual cue (diamond shape) for Start node present  

## Open Questions  
- Should system log audit entry when Start node is added or restored?  
- Should multiple incoming edges be allowed to the Start node (for display-only edge reversal)?
