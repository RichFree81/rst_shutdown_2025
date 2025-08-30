import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { domainRegistry, type TabsProviderContext } from "./contracts";
import TabsRenderer from "./TabsRenderer";

export default function DomainOutlet() {
  const { domainId = "" } = useParams<{ domainId: string }>();
  const nav = useNavigate();
  const loc = useLocation();
  const dom = domainRegistry.get(domainId);

  
  const subPath = useMemo(() => {
    const prefix = `/d/${domainId}`;
    const result = loc.pathname.startsWith(prefix) ? loc.pathname.slice(prefix.length) || "/" : "/";
    console.log('DomainOutlet: subPath calculation - pathname:', loc.pathname, 'prefix:', prefix, 'result:', result);
    return result;
  }, [loc.pathname, domainId]);

  const route = useMemo(() => {
    if (!dom) return null;
    const s = subPath === "" ? "/" : subPath;
    // Handle root path matching and default path redirection logic.
    if (s === "/") {
      if (dom.defaultPath) {
        const defaultRoute = dom.routes.find(r => r.path === dom.defaultPath) || dom.routes.find(r => r.path === "/") || dom.routes[0];
        return defaultRoute;
      }
      return null;
    }
    // Normalize leading slash
    const key = s.startsWith("/") ? s.slice(1) : s;
    const keySegs = key.split("/");
    // Match route either by exact string or by param segments beginning with ':'
    const matched = dom.routes.find(r => {
      const rp = r.path.replace(/^\/+/, "");
      if (rp === key) return true;
      const rSegs = rp.split("/");
      if (rSegs.length !== keySegs.length) return false;
      for (let i = 0; i < rSegs.length; i++) {
        const seg = rSegs[i];
        if (seg.startsWith(":")) continue; // param match
        if (seg !== keySegs[i]) return false;
      }
      return true;
    });
    return matched || null;
  }, [dom, subPath]);

  useEffect(() => {
    if (!dom) return;
    const s = subPath || "/";
    const isRoot = s === "/";
    console.log('DomainOutlet: useEffect - domainId:', domainId, 'subPath:', subPath, 'isRoot:', isRoot, 'defaultPath:', dom.defaultPath);
    if (isRoot && dom.defaultPath) {
      const target = dom.defaultPath;
      console.log('DomainOutlet: Redirecting to defaultPath:', target);
      if (target !== "/") nav(`/d/${domainId}/${target}`, { replace: true });
    }
    dom.onActivate?.();
    return () => { dom.onDeactivate?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domainId, dom]);

  const ctx: TabsProviderContext = {
    path: subPath,
    params: {},
    query: new URLSearchParams(loc.search),
    selection: undefined,
  };

  console.log('DomainOutlet: Rendering for domain:', domainId, 'subPath:', subPath, 'route:', route?.path, 'has tabs:', !!route?.tabs);
  
  return (
    <>
      {!dom ? (
        <div className="p-3 text-sm text-red-700">Domain not found: {domainId}</div>
      ) : !route ? (
        <div className="p-3 text-sm">No routes defined for domain.</div>
      ) : route.tabs ? (
        <>
          {console.log('DomainOutlet: Using TabsRenderer for route with tabs')}
          <TabsRenderer tabsProvider={route.tabs} context={ctx} />
        </>
      ) : (
        <div className="p-4">
          {route.render(ctx)}
        </div>
      )}
    </>
  );
}
