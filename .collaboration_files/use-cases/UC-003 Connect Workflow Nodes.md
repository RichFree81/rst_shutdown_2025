# Use Case : Connect Workflow Nodes
ID: UC-003  
Priority: 1  
Theme: Workflow Canvas Interaction

## Summary  
This use case covers how users define the sequence and dependency between workflow nodes by connecting them with directional edges (parent → child). These connections form the logical flow of the work package and are essential for tracking execution order and validating upstream/downstream dependencies.

## Out of Scope  
- Automatic edge routing  
- Line crossing avoidance or minimization  
- Validation of cyclic dependencies (to be handled separately)  

## Reference Documents
- Project Requirements Package – ReactFlow Canvas, Edge Behavior  

## Primary Actor  
Role: Workflow Editor (Project Engineer or Planner)

## Stakeholders & Interests  
- Project Scheduler: Needs clear dependency paths between activities  
- Construction Team: Relies on defined logic to execute sequentially  
- Commissioning Lead: Consumes final edge chain to understand prerequisite readiness  

## Preconditions  
- Workflow canvas is active and editable  
- At least two valid nodes exist on the canvas  
- Nodes are positioned without overlap  

## Main Success Flow  
Given two or more nodes are placed on the canvas  
And the user is in connect mode or initiates a drag from a node handle  
When the user drags a connector from one node (source) to another node (target)  
Then a directional edge is created (source → target)  
And the edge is rendered visually between the two nodes  
And the connection is stored in the workflow state  

## Scenario: Alternate Success Flow : Chain Multiple Nodes  
Given multiple nodes are arranged in logical order  
When the user connects them in sequence (A → B → C)  
Then each edge is drawn between adjacent nodes  
And the overall workflow logic reflects the intended progression  

## Error Handling  
Given the user connects a node to itself  
When the system detects the invalid loop  
Then an error message is shown: “Cannot connect node to itself”  
And the edge is not created  

## Postconditions  
- All valid edges are recorded in the node graph  
- Canvas reflects directional sequence visually  
- Workflow state is updated with edge definitions  

## Data  
Inputs:  
- Source Node ID  
- Target Node ID  
Outputs:  
- Edge ID  
- Edge object: {source, target, type, style}

## Acceptance Criteria  
- [ ] Connections are directional (source → target)  
- [ ] Connections snap to node handles  
- [ ] Self-links and duplicate links are blocked  
- [ ] Connections persist during workflow session  

## Open Questions  
- Should we allow multiple incoming edges to a single node?  
- Should disconnected nodes be visually flagged?
