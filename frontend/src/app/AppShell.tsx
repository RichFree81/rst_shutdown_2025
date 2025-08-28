import { Link, Outlet, useLocation } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./providers/AuthProvider";
import LeftRibbon from "./shell/LeftRibbon";
import ExplorerPane from "./shell/ExplorerPane";
import ContextHeaderTabs from "./shell/ContextHeaderTabs";
import RightChat from "./shell/RightChat";
import { domainRegistry } from "./shell/contracts";
import { APP_NAME } from "@/theme/brand";

export default function AppShell() {
  const { user, token, signOut } = useAuth();
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const contextRef = useRef<HTMLDivElement | null>(null);
  const loc = useLocation();
  const activeDomainId = useMemo(() => {
    const m = loc.pathname.match(/^\/d\/([^\/]+)/);
    return m?.[1] || null;
  }, [loc.pathname]);

  // Default domain is configurable via env; fallback to 'home'
  const defaultDomainId = (import.meta as any).env?.VITE_DEFAULT_DOMAIN_ID || "home";
  const effectiveDomainId = activeDomainId || defaultDomainId;

  const domainTitle = useMemo(() => {
    return domainRegistry.get(effectiveDomainId)?.title || "Home";
  }, [effectiveDomainId]);

  useEffect(() => {
    // Reset selection when domain changes
    setSelectedTitle(null);
  }, [effectiveDomainId]);

  function getInitials(email?: string) {
    if (!email) return "";
    const name = email.split("@")[0];
    const parts = name.replace(/[^a-zA-Z]/g, " ").split(" ").filter(Boolean);
    const letters = (parts[0]?.[0] || "A") + (parts[1]?.[0] || parts[0]?.[1] || "I");
    return letters.toUpperCase();
  }

  useEffect(() => {
    if (!menuOpen) return;
    function onClick(e: MouseEvent) {
      // Clicking the button will toggle the menu, so we only need to handle clicks outside
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey as any);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey as any);
    };
  }, [menuOpen]);

  // Auto-hide scrollbar: toggle 'scrolling' class during scroll
  useEffect(() => {
    const el = contextRef.current;
    if (!el) return;
    let t: any;
    const arm = () => {
      el.classList.add("scrolling");
      clearTimeout(t);
      t = setTimeout(() => el.classList.remove("scrolling"), 400);
    };
    const onScroll = () => arm();
    const onWheel = () => arm(); // triggers even if no overflow
    const onKey = (e: KeyboardEvent) => {
      // Arrow/Page scroll keys
      if (["ArrowDown","ArrowUp","PageDown","PageUp","Home","End"," "].includes(e.key)) arm();
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey, { passive: true } as any);
    return () => {
      el.removeEventListener("scroll", onScroll as any);
      el.removeEventListener("wheel", onWheel as any);
      window.removeEventListener("keydown", onKey as any);
    };
  }, []);

  return (
    <div className="min-h-screen bg-bg-canvas relative">
      {/* User menu (moved to top level to avoid clipping) */}
      {token && menuOpen && (
        <div ref={menuRef} className="absolute right-3 top-10 z-30 w-44 rounded-lg border border-border-subtle bg-white text-text-primary shadow-lg py-1">
          <button className="w-full text-left px-3 py-2 text-sm hover:bg-brand-bluegrey">Personal settings</button>
          <button onClick={signOut} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-brand-bluegrey">Sign out</button>
        </div>
      )}
      <header className="sticky top-0 z-10 w-full border-b border-brand-copper-300 bg-brand-navy-700 text-white">
        <div className="pl-2 pr-3 h-12 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-medium opacity-80 tracking-wider uppercase">{APP_NAME}</span>
            <span className="font-ui text-base tracking-tight">
              <span className="font-semibold">{domainTitle}</span>
              {selectedTitle && (
                <><span className="opacity-60">:</span> <span className="font-normal">{selectedTitle}</span></>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {token ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((v) => !v);
                }}
                className="h-8 w-8 rounded-full bg-white/10 text-white border border-white/20 flex items-center justify-center font-ui text-xs font-semibold hover:ring-2 hover:ring-brand-copper"
                aria-label="User menu"
              >
                {getInitials(user?.email)}
              </button>
            ) : (
              <Link to="/signin" className="px-3 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20">Sign in</Link>
            )}
          </div>
        </div>
      </header>

      <main className="h-[calc(100vh-48px)]">
        <div className="flex h-full overflow-hidden">
          {/* Left ribbon */}
          <LeftRibbon />

          {/* Explorer panel (fixed like ribbon) */}
          {/* Spacer to reserve layout space for fixed explorer */}
          <div className={`${explorerOpen ? "w-56" : "w-0"} shrink-0 transition-all duration-200`} aria-hidden></div>
          {/* Fixed explorer under header: let inner pane handle scrolling (avoid double scrollbars) */}
          <aside className={`${explorerOpen ? "block" : "hidden"} fixed left-12 top-12 z-10 h-[calc(100vh-48px)] w-56 border-r border-border-subtle bg-white overflow-visible [contain:content]`}> 
            <ExplorerPane
              domainId={effectiveDomainId}
              onSelect={(id, label) => setSelectedTitle(label)}
            />
          </aside>
          {/* Explorer tab (fixed, vertically centered short tab with arrow) */}
          <button
            onClick={() => setExplorerOpen((v) => !v)}
            aria-label={explorerOpen ? "Hide explorer" : "Show explorer"}
            className="fixed z-20 h-28 w-3 flex items-center justify-center rounded-r-lg border border-border-subtle bg-white text-text-secondary hover:text-brand-navy hover:border-brand-copper-300 transform -translate-y-1/2 group"
            style={{
              top: "calc(48px + (100vh - 48px) / 2)",
              left: explorerOpen ? 48 + 224 : 48,
            }}
          >
            <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 transition-transform ${explorerOpen ? "" : "rotate-180"}`} fill="currentColor"><path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            {/* Hover label */}
            <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-9 rounded-md bg-black/75 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 whitespace-nowrap">
              {explorerOpen ? "Hide explorer" : "Show explorer"}
            </span>
          </button>

          {/* Context area: tabs fixed at top, inner content scrolls */}
          <div className={`flex-1 min-w-0 flex flex-col bg-bg-canvas ml-6 mr-6`}>
            {selectedTitle && selectedTitle !== 'Getting Started' && <ContextHeaderTabs title={selectedTitle} />}
            <div ref={contextRef} className="relative auto-hide-scroll flex-1 overflow-y-scroll overscroll-contain [contain:content] p-4">
              {selectedTitle ? (
                <div>
                  {/* Explorer-only content for Getting Started */}
                  {effectiveDomainId === 'turnarounds' && selectedTitle === 'Getting Started' && (
                    <div>
                      <h1 className="text-3xl font-bold text-brand-navy mb-4">Welcome to Turnarounds</h1>
                      <div className="bg-brand-bluegrey-50 border-l-4 border-brand-copper-300 p-4 rounded-r-md mb-8">
                        <p className="text-lg text-brand-navy font-medium mb-2">
                          Get started with managing your plant turnaround operations efficiently and safely.
                        </p>
                      </div>

                      <div className="space-y-6">
                        <section>
                          <h2 className="text-xl font-semibold text-brand-navy mb-3">What are Turnarounds?</h2>
                          <p className="text-text-primary leading-relaxed">
                            Turnarounds are planned, periodic shutdowns of industrial facilities for maintenance, inspection, 
                            and equipment upgrades. These critical operations ensure plant safety, regulatory compliance, 
                            and optimal performance while minimizing unplanned downtime and operational risks.
                          </p>
                        </section>

                        <section>
                          <h2 className="text-xl font-semibold text-brand-navy mb-3">What This Domain Addresses</h2>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-white border border-brand-bluegrey-200 rounded-lg p-4">
                              <h3 className="font-medium text-brand-navy mb-2">Work Package Management</h3>
                              <p className="text-sm text-text-secondary">
                                Organize and track maintenance tasks, inspections, and equipment installations across your turnaround project.
                              </p>
                            </div>
                            <div className="bg-white border border-brand-bluegrey-200 rounded-lg p-4">
                              <h3 className="font-medium text-brand-navy mb-2">Resource Planning</h3>
                              <p className="text-sm text-text-secondary">
                                Coordinate personnel, equipment, and materials to ensure efficient execution and minimize downtime.
                              </p>
                            </div>
                            <div className="bg-white border border-brand-bluegrey-200 rounded-lg p-4">
                              <h3 className="font-medium text-brand-navy mb-2">Safety & Compliance</h3>
                              <p className="text-sm text-text-secondary">
                                Maintain safety standards and regulatory compliance throughout all turnaround activities.
                              </p>
                            </div>
                            <div className="bg-white border border-brand-bluegrey-200 rounded-lg p-4">
                              <h3 className="font-medium text-brand-navy mb-2">Progress Tracking</h3>
                              <p className="text-sm text-text-secondary">
                                Monitor real-time progress, identify bottlenecks, and make data-driven decisions to stay on schedule.
                              </p>
                            </div>
                          </div>
                        </section>

                        <section className="bg-brand-copper-50 border border-brand-copper-200 rounded-lg p-4">
                          <h2 className="text-xl font-semibold text-brand-navy mb-3">Getting Started</h2>
                          <p className="text-text-primary mb-3">
                            Begin by exploring the navigation tree on the left to access different areas of turnaround management:
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-text-secondary">
                            <li>Browse work packages to see planned maintenance activities</li>
                            <li>Check dashboards for project overview and key metrics</li>
                            <li>Configure settings for your turnaround preferences</li>
                            <li>Stay updated with notifications and alerts</li>
                          </ul>
                        </section>
                      </div>
                    </div>
                  )}
                  
                  {/* Placeholder content for other explorer selections */}
                  {selectedTitle !== 'Getting Started' && (
                    <div className="p-8 text-center text-text-secondary">
                      <h2 className="text-xl font-medium mb-2">{selectedTitle}</h2>
                      <p>Content for this section is coming soon.</p>
                    </div>
                  )}
                </div>
              ) : (
                <Outlet />
              )}
            </div>
          </div>

          {/* Right chat handle (fixed, vertically centered short tab with arrow & hover label) */}
          <button
            onClick={() => setChatOpen((v) => !v)}
            aria-label={chatOpen ? "Hide chat" : "Show chat"}
            className="fixed z-20 h-28 w-3 flex items-center justify-center rounded-l-lg border border-border-subtle bg-white text-text-secondary hover:text-brand-navy hover:border-brand-copper-300 transform -translate-y-1/2 group"
            style={{
              top: "calc(48px + (100vh - 48px) / 2)",
              right: chatOpen ? 384 : 0, // 96 * 4 = 384px when chat is open
            }}
          >
            <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 transition-transform ${chatOpen ? "" : "rotate-180"}`} fill="currentColor"><path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
            {/* Hover label */}
            <span className="pointer-events-none absolute right-1/2 translate-x-1/2 -top-9 rounded-md bg-black/75 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 whitespace-nowrap">
              {chatOpen ? "Hide chat" : "Show chat"}
            </span>
          </button>

          {/* Spacer to reserve layout space for fixed chat */}
          <div className={`${chatOpen ? "w-96" : "w-0"} shrink-0 transition-all duration-200`} aria-hidden></div>

          {/* Fixed chat panel under header with internal scroll */}
          <aside className={`${chatOpen ? "block" : "hidden"} fixed right-0 top-12 z-10 h-[calc(100vh-48px)] w-96 border-l border-border-subtle bg-white overflow-y-scroll overscroll-contain [scrollbar-gutter:stable] [contain:content]`}>
            <RightChat domainId={effectiveDomainId} />
          </aside>
        </div>
      </main>
    </div>
  );
}
