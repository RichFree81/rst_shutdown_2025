# FCE Application Theme Specification

This document defines the **standard theme** for the FCE application shell.  
It is the single source of truth for visual style across all Domains/Modules.  
All new modules inherit these styles to ensure a unified look and feel.

---

## 1. Typography

### Primary Typeface
- **Montserrat** — used for UI headings, navigation, buttons, and captions.  
- Clean, modern, high legibility.

### Secondary Typeface
- **Taviraj** — used for body copy and long-form content.  
- Provides professional tone, complements Montserrat.

### Hierarchy
- **H1:** Montserrat, 32–40px, Bold  
- **H2:** Montserrat, 24–28px, Semi-Bold  
- **H3:** Montserrat, 20–22px, Semi-Bold  
- **Body:** Taviraj, 16px, Regular  
- **Caption:** Montserrat, 12–14px, Light/Regular  

---

## 2. Color System

### Core Palette (semantic tokens)
| Token | Example mapping | Usage |
|-------|------------------|-------|
| `--brand-navy-700` | `#111E36` | Header background, active text emphasis |
| `--brand-blue` | `#24427E` | Primary actions/links (limited use) |
| `--brand-sky` | `#4099FF` | Focus ring, links hover |
| `--brand-bluegrey-50` | `#F3F6FB` | Very light blue-grey for subtle bands |
| `--bg-canvas` | `#FAFAFC` | App canvas (neutral-50) |
| `--bg-surface` | `#FFFFFF` | Surfaces (cards, panels when needed) |
| `--text-primary` | `#0B1220` | Primary text |
| `--text-secondary` | `#5B677A` | Secondary text |
| `--border-subtle` | `#E3E7EE` | Subtle borders/dividers |
| `--brand-copper-300` | `#C98952` | Accent highlight (active indicators) |
| `--brand-copper-700` | `#8A5826` | Deep accent (rarely used) |

### Neutrals & Supporting
- Neutral ladder available via Tailwind utilities (e.g., `bg-neutral-200` used for left ribbon background).
- Blue variants remain available but are used sparingly to maintain a flat UI.

### Accessibility Combinations
- Blue on White  
- Navy on Blue Grey  
- Copper on White  

---

## 3. Components

### Buttons
- **Primary:** `--fce-blue` background, white text.  
- **Secondary:** `--fce-bluegrey` background, navy text.  
- **Ghost:** Transparent background, blue border, blue text.  
- **Copper:** `--fce-copper` background, white text (accent call-to-action).  

**States**  
- **Hover:** Darker tint of base color.  
- **Active:** Slightly darker with pressed effect.  
- **Disabled:** Reduced opacity, no hover effect.  
- **Focus:** Sky Blue outline (`--fce-sky`).  

### Inputs
- White background, neutral border `--fce-neutral-300`.  
- Focus: Sky Blue glow `--fce-sky`.  
- Disabled: Light grey background, muted text.  

### Badges
- **Brand:** Blue Grey background, Navy text.  
- **Outline:** Neutral border, grey text.  
- **Copper:** Copper background, white text (for alerts/highlights).  

### Alerts
- Left border: `--fce-blue`.  
- Background: `#f8fbff`.  
- Text: Navy.  

### Cards
- Prefer flat design without shadows.  
- White surface when a distinct panel is required.  
- Border: `--border-subtle`.  
- Border radius: 12–16px.  

### Tables
- Header row: Blue Grey background, Navy text.  
- Dividers: Neutral grey.  
- Hover row: Blue Grey tint.  

### Navigation
- Header: dark navy background (`bg-brand-navy-700`) with a subtle copper bottom border (`border-brand-copper-300`).  
- Left ribbon: flat neutral grey (`bg-neutral-200`), no blur; active icon shows a copper left border only on the truly active item.  
- Context header tabs: flat band (white) with copper underline on the active tab only; no tab background fills or shadows.  
- Explorer: flat list; hover is a very light blue-grey (`bg-brand-bluegrey-50`); selection indicated by a copper left border on the active leaf only.  

### Footer
- Neutral grey text, centered.  
- Matches caption size.  

---

## 4. Layout & Spacing

- **Border Radius:** 12–16px for cards, inputs, and buttons.  
- **Shadows:** Avoid shadows across shell (flat design).  
- **Spacing:** Minimum 8px increments (8, 16, 24, 32).  
- **Focus State:** Always Sky Blue outline (3px).  
- **Grid/Breakpoints:**  
  - Mobile: ≤640px  
  - Tablet: 641–1024px  
  - Desktop: ≥1025px  

---

## 5. Assets & Iconography

- **Patterns:** Use logo-inspired and dot patterns subtly in backgrounds or section dividers. Avoid overuse.  
- **Icons:** Use FCE’s custom iconography set for industry-specific visuals (contract, organisation, tank, wrench, truck, safety, tools, graphs).  
- **Size:** 16–24px for inline UI icons, 32–48px for illustrative use.  
- **Style:** Line-based, minimal, consistent stroke weight.  

---

## 6. Imagery Guidelines

- **Photography Styles:**  
  - Professional, industry-specific (plants, smelting equipment).  
  - Abstract, innovation-focused imagery.  
- **Application:**  
  - If image does not align with brand palette, apply greyscale or dark blue overlay.  
  - Maintain high resolution and clarity.  
- **Do Not:** Use low-quality, off-brand, or oversaturated images.  

---

## 7. Motion & Transitions

- **Duration:** 160–220ms for standard UI interactions.  
- **Easing:** Ease-in-out for smooth transitions.  
- **Scope:** Buttons, hover states, modal entry/exit, dropdowns.  
- **Accessibility:** Avoid excessive animation; provide reduced-motion support.  

---

## 8. Accessibility Rules

- **Contrast Ratios:** Minimum AA compliance for text and background.  
- **Text Size:** Body ≥ 16px, Captions ≥ 12px.  
- **Touch Targets:** Minimum 44x44px for interactive elements.  
- **Keyboard Navigation:** All components must support tab navigation with visible focus state.  

---

## 9. Token Reference

Defined as CSS variables in `frontend/src/theme/tokens.css` and exposed to Tailwind v4 utilities via `@theme` in `frontend/src/index.css`.

Example (excerpt):
```css
/* tokens.css */
:root {
  --brand-navy-700: #111E36;
  --brand-bluegrey-50: #F3F6FB;
  --brand-copper-300: #C98952;
  --brand-copper-700: #8A5826;
  --bg-canvas: #FAFAFC; /* neutral-50 */
  --bg-surface: #FFFFFF;
  --text-primary: #0B1220;
  --text-secondary: #5B677A;
  --border-subtle: #E3E7EE;
}

/* index.css */
@theme {
  --color-brand-navy-700: var(--brand-navy-700);
  --color-brand-bluegrey-50: var(--brand-bluegrey-50);
  --color-brand-copper-300: var(--brand-copper-300);
  --color-brand-copper-700: var(--brand-copper-700);
  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-border-subtle: var(--border-subtle);
  --color-bg-canvas: var(--bg-canvas);
  --color-bg-surface: var(--bg-surface);
}
```

---

## 10. Implementation Guidance

- Tokens live in `frontend/src/theme/tokens.css`.  
- Tailwind v4 color utilities are mapped via `@theme` in `frontend/src/index.css` (no custom tailwind.config required for color mapping).  
- Typography roles in `frontend/src/theme/typography.css`.  
- Domains use shell-provided utilities; do not redefine theme locally.  

### Scrollbar behavior
- Context area uses auto-hide scrollbars that show only while actively scrolling.  
- No hover-based scrollbars; 400ms fade-out after scrolling stops.  

---

**Version:** v1.0 (Comprehensive with Copper)  
**Maintained by:** FCE Design System  
