import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { domainRegistry, type ExplorerItem } from "./contracts";

// Fallback placeholder when no domain is active
const placeholderTree: ExplorerItem[] = [
  { id: "getting-started", label: "Getting Started" },
  { id: "dashboard", label: "Dashboard" },
];

export default function ExplorerPane({ onSelect }: { onSelect: (id: string, label: string) => void }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tree, setTree] = useState<ExplorerItem[]>(placeholderTree);
  const loc = useLocation();
  const activeDomainId = useMemo(() => {
    const m = loc.pathname.match(/^\/d\/([^\/]+)/);
    return m?.[1] || null;
  }, [loc.pathname]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const dom = activeDomainId ? domainRegistry.get(activeDomainId) : undefined;
      if (!dom) { setTree(placeholderTree); return; }
      try {
        const data = await dom.explorer.getTree({ path: loc.pathname, params: {}, query: new URLSearchParams(loc.search), selection: undefined });
        if (!cancelled) setTree(data);
      } catch {
        if (!cancelled) setTree([]);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [activeDomainId, loc.pathname, loc.search]);

  function Node({ item, depth = 0 }: { item: ExplorerItem; depth?: number }) {
    const hasChildren = !!item.children?.length;
    const expanded = !!open[item.id];
    const isSelected = !hasChildren && selectedId === item.id;
    return (
      <div>
        <button
          className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md ${
            isSelected ? "border-l-2 border-brand-copper-300" : "border-l-2 border-transparent"
          } ${depth ? "pl-4" : ""} ${hasChildren ? "" : "hover:bg-brand-bluegrey-50"}`}
          onClick={() => (
            hasChildren
              ? setOpen({ ...open, [item.id]: !expanded })
              : (setSelectedId(item.id), onSelect(item.id, item.label))
          )}
        >
          {hasChildren ? (
            <svg viewBox="0 0 24 24" className={`h-4 w-4 text-text-secondary transition-transform ${expanded ? "rotate-90" : ""}`} fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-text-secondary" fill="currentColor"><path d="M3 5h18v14H3z"/></svg>
          )}
          <span className={`text-sm ${depth === 0 ? "text-brand-navy" : "text-text-primary"}`}>{item.label}</span>
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
    <div className="h-full w-full overflow-auto p-2">
      {tree.map((it) => (
        <Node key={it.id} item={it} />
      ))}
    </div>
  );
}
