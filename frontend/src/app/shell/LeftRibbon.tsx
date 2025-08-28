import { Link, useLocation } from "react-router-dom";
import { useMemo, useSyncExternalStore } from "react";
import { domainRegistry } from "./contracts";

export default function LeftRibbon() {
  // subscribe to registry for dynamic updates
  const domains = useSyncExternalStore(
    (cb) => domainRegistry.subscribe(cb),
    () => domainRegistry.list(),
    () => domainRegistry.list()
  );
  const loc = useLocation();
  const activeDomainId = useMemo(() => {
    const m = loc.pathname.match(/^\/d\/([^\/]+)/);
    return m?.[1] || null;
  }, [loc.pathname]);
  const activeHome = useMemo(() => activeDomainId === "home" || loc.pathname === "/d/home", [activeDomainId, loc.pathname]);

  return (
    <>
      {/* Spacer to preserve layout width */}
      <div className="w-12 shrink-0" aria-hidden></div>
      {/* Fixed ribbon below the 48px header */}
      <aside className="fixed left-0 top-12 z-20 h-[calc(100vh-48px)] w-12 border-r border-border-subtle bg-neutral-200 flex flex-col items-center py-1 gap-1">
                <Link key="home" to="/d/home" className={`relative group rounded-xl p-2 ${activeHome ? "text-brand-navy border-l-2 border-brand-copper-300" : "text-text-secondary hover:text-brand-navy"}`}>
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><path d="M12 3 3 10h2v9h6v-6h2v6h6v-9h2z"/></svg>
          <span className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 rounded-md bg-black/75 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 whitespace-nowrap">
            Home
          </span>
        </Link>
        {domains.filter(d => d.id !== "home").map((d) => (
                    <Link key={d.id} to={`/d/${d.id}`} className={`relative group rounded-xl p-2 ${activeDomainId === d.id ? "text-brand-navy border-l-2 border-brand-copper-300" : "text-text-secondary hover:text-brand-navy"}`}>
                        {d.icon.render()}
            <span className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 rounded-md bg-black/75 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 whitespace-nowrap">
              {d.title}
            </span>
          </Link>
        ))}
        <div className="mt-auto">
                    <button className="relative group rounded-xl p-2 text-text-secondary hover:text-brand-navy">
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M19.14 12.94a7.07 7.07 0 0 0 0-1.88l2.03-1.58-2-3.46-2.39.96a7.12 7.12 0 0 0-1.63-.95l-.36-2.54H9.21l-.36 2.54c-.57.23-1.11.54-1.63.95l-2.39-.96-2 3.46 2.03 1.58a7.07 7.07 0 0 0 0 1.88L2.83 14.5l2 3.46 2.39-.96c.52.41 1.06.72 1.63.95l.36 2.54h4.58l.36-2.54c.57-.23 1.11-.54 1.63-.95l2.39.96 2-3.46-2.03-1.56ZM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7Z"/></svg>
            <span className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 rounded-md bg-black/75 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 whitespace-nowrap">
              Settings
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
