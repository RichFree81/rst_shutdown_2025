# Use Case : Display Popouts  
ID: UC-010  
Priority: 3  
Theme: UI / Interaction Model

## Summary  
This use case describes how the system displays structured data entry panels (popouts) for a selected node, allowing users to manage Activities, Handoffs, Deliverables, and Approvals. These panels are accessible via icon buttons in the node card and can appear either docked to the canvas edge or anchored to the node.

## Out of Scope  
- Data validation or editing logic inside popouts (handled in UC-004 to UC-007)  
- Authorization checks for field-level access  
- Admin configuration of display modes  

## Reference Documents  
- PRP Section 2.4 – Data Entry Popouts  
- PRP Section 2.5 – Popout Display Modes  

## Primary Actor  
Role: Workflow Editor (e.g., Project Engineer)

## Stakeholders & Interests  
- UI/UX Designer: Requires consistent interaction model across nodes  
- Developers: Implement docking and anchoring modes for various screen sizes  
- QA Testers: Need deterministic rendering logic for automated testing  

## Preconditions  
- Node exists on canvas  
- Node has enabled popout sections (via template or custom config)  
- User is authorized to edit the node  

## Main Success Flow  
Given the user hovers or clicks on a node  
And clicks an icon for one of the four popout categories (Activities, Handoffs, Deliverables, Approvals)  
When the system renders the popout  
Then it displays in Dock Mode by default (right-side panel)  
And shows any existing entries in structured form  
And allows the user to edit entries  

## Scenario: Alternate Success Flow : Anchor Mode  
Given the system supports Anchor Mode and it is enabled in config  
When the user clicks the icon  
Then the popout appears in a floating card below the node  
And if Anchor cannot resolve the DOM position  
Then the system gracefully falls back to Dock Mode  

## Error Handling  
Given the user clicks a popout icon  
When rendering fails (e.g. DOM clipped or node obscured)  
Then the system displays the panel in Dock Mode with a warning in console (not user-facing)  

## Postconditions  
- Popout panel is visible with valid node data loaded  
- User can interact with panel (subject to other use cases)  
- UI adjusts if canvas is resized  

## Data  
Inputs:  
- Node ID  
- Popout type (enum: Activities, Handoffs, Deliverables, Approvals)  
Outputs:  
- Panel renders with node.data.{section} fields preloaded  

## Acceptance Criteria  
- [ ] Clicking each icon opens the correct popout  
- [ ] Dock Mode is always available  
- [ ] Anchor Mode used when supported and not clipped  
- [ ] Popout renders existing data and allows interaction  

## Open Questions  
- Can users configure default mode (dock vs anchor)?  
- Should the last opened popout persist across sessions?
