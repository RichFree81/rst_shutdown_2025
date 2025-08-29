# Use Case : Apply Node Templates  
ID: UC-008  
Priority: 3  
Theme: Node Configuration

## Summary  
This use case defines how users assign a predefined template type to each node. Templates determine the default data structure and layout (e.g., Scoping, Procurement, Delivery). Selecting a template initializes the node with predefined icons, field visibility, and default data (e.g., activities, approvals).

## Out of Scope  
- Creation or editing of template definitions (admin/config activity)  
- Custom template builder UI  
- Dynamic form rendering  

## Reference Documents  
- PRP Section 2.3 – Node Templates  
- PRP Section 2.4.1 – Default Data Sets  

## Primary Actor  
Role: Workflow Editor (e.g., Project Engineer)

## Stakeholders & Interests  
- Engineering Leads: Rely on template structure for discipline-specific workflows  
- Quality Assurance: Templates help enforce documentation and review consistency  
- PMO: Expects template metadata to drive reporting and standardization  

## Preconditions  
- A workflow canvas is initialized and editable  
- Node has been added to the canvas  
- Template definitions are available and loaded in UI  

## Main Success Flow  
Given a node is placed on the canvas  
And no template is assigned yet  
When the user selects a node  
And chooses a template from the dropdown list  
Then the system assigns the selected template type to the node  
And populates the node with the relevant icon set  
And inserts default data for Activities, Handoffs, Deliverables, and Approvals  

## Scenario: Alternate Success Flow : Switch Template After Assignment  
Given a node already has a template  
When the user selects a different template  
Then the system asks whether to overwrite existing data or keep custom changes  

## Error Handling  
Given no templates are loaded  
When the user tries to assign a template  
Then the template dropdown is disabled and a message is shown  

## Postconditions  
- Node data contains template type  
- Default popout entries (activities, etc.) reflect the template  
- Node icon row is rendered based on enabled sections  

## Data  
Inputs:  
- Template Type (enum): Scoping, Procurement, Delivery, etc.  
Outputs:  
- node.data.template = selected type  
- node.data.activities, .handoffs, etc. = populated defaults  

## Acceptance Criteria  
- [ ] Node template can be selected via UI  
- [ ] Template assignment updates node appearance  
- [ ] Default fields populate correctly  
- [ ] User is warned if changing template with existing data  

## Open Questions  
- Can templates be assigned in bulk (multi-node selection)?  
- Should template assignment be locked after approvals begin?
