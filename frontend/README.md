# Frontend

This README documents the React/Vite frontend located in `frontend/` and provides guidelines for adding new domains with a consistent structure.

## Overview
- Framework: React 18 + TypeScript + Vite
- Router: `react-router-dom`
- Styling: Tailwind CSS v4
  - Tokens defined in `src/theme/tokens.css`
  - Color utilities mapped via `@theme` in `src/index.css` (no custom tailwind.config needed for colors)
- API client: `src/app/api/client.ts` using `VITE_API_BASE_URL`
- Aliases: `@` → `src` (see `tsconfig.json` and `vite.config.ts`)
- Shell + Domains: UI shell owns layout/routing; domains are registered via a `domainRegistry` and are mounted under `/d/:domainId/*`.

## Scripts
- Dev: `npm run dev` (Vite on port 5173)
- Build: `npm run build` (outputs to `dist/`)
- Preview: `npm run preview` (serves built app on 5174)

## Environment
Create `frontend/.env.local` (already present) and set:
```
VITE_API_BASE_URL=http://localhost:8000
```
- For other environments, Vercel/Netlify/Azure Static Web Apps can set `VITE_...` variables in their UI.

Optional (for local demo):
```
VITE_ENABLE_SAMPLE_DOMAIN=true
```

## Directory structure (key paths)
```
frontend/
  src/
    app/
      AppRouter.tsx         # router setup
      AppShell.tsx          # layout shell
      ProtectedRoute.tsx    # auth gate
      shell/
        contracts.ts        # domain contracts + registry
        domains.ts          # domain registration bootstrap (uses env to gate sample)
        LeftRibbon.tsx      # domain switcher (icons)
        ExplorerPane.tsx    # explorer tree from active domain
        DomainOutlet.tsx    # renders active domain route
      api/
        client.ts           # apiFetch() with token and base URL
      providers/            # global providers (auth/theme/query/etc.)
    domains/
      auth/                 # auth pages (outside shell)
      sample/
        domain.tsx          # sample domain (dev-only; gated by env)
    theme/                  # design tokens and typography
    types/                  # shared TS types
  index.html               # app entry
  vite.config.ts           # Vite + alias config
  tsconfig.json            # TS + @ alias config
```

## Brand configuration
- Update `src/theme/brand.ts` to set the application name and tagline:
  - `APP_NAME`, `APP_TAGLINE`
- Auth pages (e.g., `src/domains/auth/pages/SignIn.tsx`) render outside the `AppShell` and display the brand header only, for a clean sign-in experience.

## Theme and UI conventions (flat)
- Header: dark navy (`bg-brand-navy-700`) with a subtle copper bottom border (`border-brand-copper-300`).
- Left ribbon: flat darker grey (`bg-neutral-200`), no blur; active icon shows a soft copper left border only on the active item.
- Context header tabs: white band, underline-only active state (`border-b-2 border-brand-copper-300`), no fills or shadows.
- Explorer pane: flat list; hover `bg-brand-bluegrey-50`; selection indicated by copper left border on active leaf only.
- Content area: flat canvas (`bg-bg-canvas`), domains render their own surfaces as needed (no default white card wrapper).
- Scrollbars: show-on-scroll only in the context area (no hover reveal), fade out ~400ms after scrolling stops.

Tokens live in `src/theme/tokens.css` (e.g., `--brand-navy-700`, `--brand-bluegrey-50`, `--brand-copper-300`, `--bg-canvas`, `--text-*`, `--border-subtle`). They are exposed to Tailwind utilities in `src/index.css` via an `@theme` block.

## API client usage
`src/app/api/client.ts` exposes `apiFetch(path, init?)` and optional `setTokenProvider()`.
- Base URL: `(import.meta as any).env.VITE_API_BASE_URL` (fallback `http://localhost:8000`).
- Adds `Authorization: Bearer <token>` header if a token is available.
- Usage:
```ts
import { apiFetch } from "@/app/api/client";
const me = await apiFetch("/api/v1/auth/me");
```

## Routing
Routes are defined in `src/app/AppRouter.tsx` with `createBrowserRouter`.
- Auth routes (outside shell): `/signin`, `/accept-invite`, `/request-reset`, `/reset-password`.
- Domain routes (inside shell): `/d/:domainId/*` render via `DomainOutlet` using the active domain’s `routes`.
- Header displays `"Domain Name: Section Name"`. When no domain is active, the domain title defaults to `Home`.

---

## Guidelines: Adding a new domain (frontend)
Domains are self-contained features that implement the contract in `src/app/shell/contracts.ts` and are registered with the shell.

1) Create `src/domains/<domainId>/domain.tsx` that exports a `DomainDefinition`:
```tsx
import type { DomainDefinition } from "@/app/shell/contracts";

const DomainIcon = { title: "Inventory", render: () => (<svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><path d="M3 5h18v14H3z"/></svg>) };

const InventoryDomain: DomainDefinition = {
  id: "inventory",
  title: "Inventory",
  icon: DomainIcon,
  defaultPath: "/overview",
  routes: [
    {
      path: "/overview",
      render: () => <div>Inventory overview</div>,
    },
  ],
  explorer: {
    async getTree() { return [{ id: "overview", label: "Overview" }]; },
  },
};

export default InventoryDomain;
```

2) Register it in `src/app/shell/domains.ts` (dynamic import shown):
```ts
import { domainRegistry } from "./contracts";

import("@/domains/inventory/domain").then(({ default: Inventory }) => {
  try { domainRegistry.register(Inventory); } catch (e) { /* log in dev */ }
});
```

That’s it — the domain icon appears in the left ribbon, routes are available under `/d/inventory/*`, and the explorer will render the domain-provided tree.

### Domain utilities and patterns
- Use `@/...` imports for readability.
- Fetch data via `@/app/api/client` in your domain components or hooks.
- Provide `actions` in `DomainDefinition` to expose command-like behaviors (optional).

### Conventions
- Use `@/...` imports (alias to `src`) to avoid long relative paths.
- Lazy-load routes for better performance.
- Keep pages thin; move data fetching into hooks or `api.ts` helpers.
- Keep UI consistent with theme tokens and typography utilities.
  - Use color utilities bound to tokens (e.g., `text-text-secondary`, `bg-bg-canvas`, `border-border-subtle`).
  - Avoid adding shadows; prefer borders and spacing for hierarchy.
  - Use underline-only tab styles if you add nested tab UIs.

## Local development
From `frontend/`:
```
npm install
npm run dev
```
- Ensure backend is running at the URL in `VITE_API_BASE_URL`.

## Build
From `frontend/`:
```
npm run build
npm run preview
```

## Notes
- `public/robots.txt` is included; add any static assets under `public/`.
- If deploying separately from the backend, set `VITE_API_BASE_URL` per environment.
 - Set `VITE_ENABLE_SAMPLE_DOMAIN=true` in `.env.local` to view the sample domain locally.
