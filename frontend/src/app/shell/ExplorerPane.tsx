import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { domainRegistry, type ExplorerItem } from "./contracts";

// Fallback placeholder when no domain is active
// No items by default
const placeholderTree: ExplorerItem[] = [];


// Helper functions for localStorage persistence
const getStorageKey = (domainId: string) => `explorer-expanded-${domainId}`;

const loadExpandedState = (domainId: string): Record<string, boolean> => {
  try {
    const stored = localStorage.getItem(getStorageKey(domainId));
    if (stored) {
      return JSON.parse(stored);
    }
    // Default state: all collapsed
    return {};
  } catch {
    // Default state on error: all collapsed
    return {};
  }
};

const saveExpandedState = (domainId: string, state: Record<string, boolean>) => {
  try {
    localStorage.setItem(getStorageKey(domainId), JSON.stringify(state));
  } catch {
    // Ignore localStorage errors (e.g., in private browsing)
  }
};

export default function ExplorerPane({ domainId, onSelect }: { domainId: string; onSelect: (id: string | null, label: string | null) => void }) {
  const [open, setOpen] = useState<Record<string, boolean>>(() => loadExpandedState(domainId));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tree, setTree] = useState<ExplorerItem[]>(placeholderTree);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const loc = useLocation();
  const navigate = useNavigate();

  // Reset to collapsed state when domainId changes and auto-select Getting Started for turnarounds (only on initial load)
  useEffect(() => {
    setOpen(loadExpandedState(domainId));
    if (domainId === 'turnarounds' && selectedId === null) {
      setSelectedId('getting-started');
      onSelect('getting-started', 'Getting Started');
    } else if (domainId !== 'turnarounds') {
      setSelectedId(null);
    }
  }, [domainId]);

  useEffect(() => {
    const dom = domainRegistry.get(domainId);
    if (!dom?.explorer.subscribe) return;

    const unsub = dom.explorer.subscribe(() => {
      setRefreshCounter((c) => c + 1);
    });

    return () => unsub?.();
  }, [domainId]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const dom = domainRegistry.get(domainId);
      if (!dom) { setTree(placeholderTree); return; }
      try {
        const data = await dom.explorer.getTree({ path: loc.pathname, params: {}, query: new URLSearchParams(loc.search), selection: undefined, activeDomainId: domainId });
        if (!cancelled) setTree(data);
      } catch (e) {
        if (!cancelled) {
          setTree([
            {
              id: "error",
              label: "Error loading",
              children: [
                { id: "error-msg", label: e instanceof Error ? e.message : "Unknown error" },
              ],
            },
          ]);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [domainId, loc.pathname, loc.search, refreshCounter]);

  function Node({ item, depth = 0 }: { item: ExplorerItem; depth?: number }) {
    if (item.id.startsWith("separator-")) {
      return <div className="my-2 border-t" />;
    }
    const hasChildren = !!item.children?.length;
    const expanded = !!open[item.id];
    const isSelected = !hasChildren && selectedId === item.id;

    if (item.render) {
    return item.render(item, depth);
  }

  const buttonClasses = [
      "w-full",
      "text-left",
      "flex",
      "items-center",
      "gap-1.5",
      "py-1",
      "rounded-md",
      depth === 0 && "font-semibold",
      depth > 0 ? (item.hideIcon ? "pl-1.5" : "pl-4") : "pl-1.5",
      item.id !== "work-packages-menu" && "hover:bg-brand-bluegrey-50",
    ].filter(Boolean).join(" ");

    const toggleExpanded = () => {
      const newState = { ...open, [item.id]: !expanded };
      setOpen(newState);
      saveExpandedState(domainId, newState);
    };

    return (
      <div className="relative">
        {isSelected && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand-copper-300" />}
        <button
          className={buttonClasses}
          onClick={(e) => {
            if (item.onClick) {
              item.onClick(e, toggleExpanded);
            } else if (hasChildren) {
              toggleExpanded();
              // Don't select root tree elements - they only expand/collapse
            } else {
              setSelectedId(item.id);
              if (item.path) {
                console.log('ExplorerPane: Navigating to path:', item.path);
                navigate(item.path);
                // Clear explorer-only selection for route-based pages
                onSelect(null, null);
              } else {
                onSelect(item.id, typeof item.label === "string" ? item.label : null);
              }
            }
          }}
        >
          {!item.hideIcon && (item.icon || (hasChildren ? (
            <svg viewBox="0 0 24 24" className={`h-4 w-4 text-text-secondary transition-transform ${expanded ? "rotate-90" : ""}`} fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-text-secondary" fill="currentColor"><path d="M3 5h18v14H3z"/></svg>
          )))}
          {typeof item.label === "string" ? <span className="truncate flex-1">{item.label}</span> : <div className="flex-1">{item.label}</div>}
        </button>
        {hasChildren && expanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => (
              <Node key={child.id} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto p-2" style={{ overflow: 'visible' }}>
      {tree.map((it) => (
        <Node key={it.id} item={it} />
      ))}
    </div>
  );
}
