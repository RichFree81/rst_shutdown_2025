import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { domainRegistry, type TabsProviderContext } from "./contracts";

export default function DomainOutlet() {
  const { domainId = "" } = useParams<{ domainId: string }>();
  const nav = useNavigate();
  const loc = useLocation();
  const dom = domainRegistry.get(domainId);

  if (!dom) {
    return <div className="p-3 text-sm text-red-700">Domain not found: {domainId}</div>;
  }

  const subPath = useMemo(() => {
    const prefix = `/d/${domainId}`;
    return loc.pathname.startsWith(prefix) ? loc.pathname.slice(prefix.length) || "/" : "/";
  }, [loc.pathname, domainId]);

  const route = useMemo(() => {
    const s = subPath === "" ? "/" : subPath;
    return dom.routes.find(r => s === r.path) || dom.routes[0];
  }, [dom.routes, subPath]);

  useEffect(() => {
    if (!route) return;
    const s = subPath || "/";
    const isRoot = s === "/";
    if (isRoot) {
      const target = dom.defaultPath || dom.routes[0]?.path || "/";
      if (target !== "/") nav(`/d/${domainId}${target}`, { replace: true });
    }
    dom.onActivate?.();
    return () => { dom.onDeactivate?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domainId]);

  const ctx: TabsProviderContext = {
    path: subPath,
    params: {},
    query: new URLSearchParams(loc.search),
    selection: undefined,
  };

  if (!route) return <div className="p-3 text-sm">No routes defined for domain.</div>;

  return (
    <div>
      {route.render(ctx)}
    </div>
  );
}
