import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { domainRegistry, type TabsProviderContext } from "./contracts";

export default function DomainOutlet() {
  const { domainId = "" } = useParams<{ domainId: string }>();
  const nav = useNavigate();
  const loc = useLocation();
  const dom = domainRegistry.get(domainId);

  
  const subPath = useMemo(() => {
    const prefix = `/d/${domainId}`;
    return loc.pathname.startsWith(prefix) ? loc.pathname.slice(prefix.length) || "/" : "/";
  }, [loc.pathname, domainId]);

  const route = useMemo(() => {
    if (!dom) return null;
    const s = subPath === "" ? "/" : subPath;
    // Handle root path matching and default path redirection logic.
    if (s === "/") {
      // Only return default route if domain has defaultPath defined
      if (dom.defaultPath) {
        const defaultRoute = dom.routes.find(r => r.path === dom.defaultPath) || dom.routes.find(r => r.path === "/") || dom.routes[0];
        return defaultRoute;
      }
      // No defaultPath means no route should render (explorer-only domain)
      return null;
    }
    return dom.routes.find(r => r.path === s) || null;
  }, [dom, subPath]);

  useEffect(() => {
    if (!dom) return;
    const s = subPath || "/";
    const isRoot = s === "/";
    if (isRoot && dom.defaultPath) {
      const target = dom.defaultPath;
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

  return (
    <div>
      {!dom ? (
        <div className="p-3 text-sm text-red-700">Domain not found: {domainId}</div>
      ) : !route ? (
        <div className="p-3 text-sm">No routes defined for domain.</div>
      ) : (
        route.render(ctx)
      )}
    </div>
  );
}
