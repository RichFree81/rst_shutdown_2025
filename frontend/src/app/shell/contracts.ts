import type { JSX } from "react";

export type DomainId = string;

export interface DomainIcon {
  render(): JSX.Element;
  title: string;
}

export interface ExplorerItem {
  id: string;
  label: string;
  children?: ExplorerItem[];
}

export interface ExplorerProviderContext {
  path: string;
  params: Record<string, string>;
  query: URLSearchParams;
  selection?: { id: string } | null;
}

export interface ExplorerProvider {
  getTree(ctx: ExplorerProviderContext): Promise<ExplorerItem[]>;
  onSelect?(nodeId: string): void | Promise<void>;
}

export interface TabSpec {
  key: string;
  label: string;
}

export interface TabsProviderContext {
  path: string;
  params: Record<string, string>;
  query: URLSearchParams;
  selection?: { id: string } | null;
}

export interface TabsProvider {
  getTabs(ctx: TabsProviderContext): Promise<TabSpec[]>;
  renderTabContent(tabKey: string, ctx: TabsProviderContext): JSX.Element;
}

export interface RouteSpec {
  path: string;
  render(ctx: TabsProviderContext): JSX.Element;
  tabs?: TabsProvider;
}

export interface DomainLifecycle {
  onActivate?(): void | Promise<void>;
  onDeactivate?(): void | Promise<void>;
  onNavigate?(ctx: TabsProviderContext): void | Promise<void>;
  dispose?(): void | Promise<void>;
}

export interface DomainDefinition extends DomainLifecycle {
  id: DomainId;
  title: string;
  icon: DomainIcon;
  routes: RouteSpec[];
  explorer: ExplorerProvider;
  actions?: Array<{ id: string; label: string; run(ctx: TabsProviderContext): void | Promise<void>; }>;
  defaultPath?: string;
}

export class DomainRegistry {
  private domains = new Map<DomainId, DomainDefinition>();
  private listeners = new Set<() => void>();
  private snapshot: DomainDefinition[] = [];

  register(dom: DomainDefinition) {
    if (this.domains.has(dom.id)) throw new Error(`Duplicate domain id: ${dom.id}`);
    this.domains.set(dom.id, dom);
    this.snapshot = [...this.domains.values()];
    this.listeners.forEach((l) => l());
  }

  list(): DomainDefinition[] { return this.snapshot; }

  get(id: DomainId): DomainDefinition | undefined { return this.domains.get(id); }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const domainRegistry = new DomainRegistry();
