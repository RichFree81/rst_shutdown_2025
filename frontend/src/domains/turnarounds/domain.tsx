import { lazy } from "react";
import type { JSX } from "react";
import type { DomainDefinition, ExplorerItem, ExplorerProvider } from "@/app/shell/contracts";

const DashboardsPage = lazy(() => import("./pages/DashboardsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));

const TurnaroundsIcon = {
  title: "Turnarounds",
  render(): JSX.Element {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
        <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
      </svg>
    );
  },
};

const allWorkPackages: ExplorerItem[] = [
  { id: "wp-1", label: <div className="text-sm">WP-001: Tank Inspection</div>, hideIcon: true },
  { id: "wp-2", label: <div className="text-sm">WP-002: Valve Replacement</div>, hideIcon: true },
  { id: "wp-3", label: <div className="text-sm">WP-003: Scaffolding Setup</div>, hideIcon: true },
];

class TurnaroundsExplorerProvider implements ExplorerProvider {
  private listeners: Array<() => void> = [];
  private isWorkPackagesMenuOpen = false;

  subscribe = (callback: () => void) => {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  };

  private notify = () => {
    this.listeners.forEach((l) => l());
  };

  private toggleWorkPackagesMenu = () => {
    this.isWorkPackagesMenuOpen = !this.isWorkPackagesMenuOpen;
    this.notify();
  };

  private handleSearch = () => {
    console.log('Search clicked');
    this.toggleWorkPackagesMenu();
  };

  private handleFilter = () => {
    console.log('Filter clicked');
    this.toggleWorkPackagesMenu();
  };

  private handleAddNew = () => {
    console.log('Add new clicked');
    this.toggleWorkPackagesMenu();
  };

  private handleClearFilters = () => {
    console.log('Clear filters clicked');
    this.toggleWorkPackagesMenu();
  };

  async getTree(): Promise<ExplorerItem[]> {
    return [
      { id: "getting-started", label: "Getting Started", icon: <svg viewBox="0 0 24 24" className="h-4 w-4 text-text-secondary" fill="currentColor"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg> },
      { id: "dashboards", label: "Dashboards", path: "/d/turnarounds/dashboards", icon: <svg viewBox="0 0 24 24" className="h-4 w-4 text-text-secondary" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg> },
      { id: "separator-1", label: "" },
      {
        id: "work-packages",
        label: "Work Packages",
        icon: <svg viewBox="0 0 24 24" className="h-4 w-4 text-text-secondary" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z"/></svg>,
        children: allWorkPackages,
      },
      { id: "separator-2", label: "" },
      { id: "settings", label: "Settings", path: "/d/turnarounds/settings", icon: <svg viewBox="0 0 24 24" className="h-4 w-4 text-text-secondary" fill="currentColor"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17-.59-1.69-.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg> },
      { id: "notifications", label: "Notifications", path: "/d/turnarounds/notifications", icon: <svg viewBox="0 0 24 24" className="h-4 w-4 text-text-secondary" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg> },
    ];
  }
}

const TurnaroundsExplorer = new TurnaroundsExplorerProvider();

const TurnaroundsDomain: DomainDefinition = {
  id: "turnarounds",
  title: "Turnarounds",
  icon: TurnaroundsIcon,
  routes: [
    { 
      path: "dashboards", 
      render: () => <DashboardsPage />,
      tabs: {
        async getTabs() {
          console.log('Domain: getTabs called for dashboards');
          const tabs = [
            { key: "dashboard-1", label: "Dashboard 1" },
            { key: "dashboard-2", label: "Dashboard 2" },
            { key: "dashboard-3", label: "Dashboard 3" },
          ];
          console.log('Domain: returning tabs:', tabs);
          return tabs;
        },
        renderTabContent(tabKey: string) {
          console.log('Domain: renderTabContent called with key:', tabKey);
          const dashboardNumber = tabKey.split('-')[1];
          const content = (
            <div className="p-8 text-center text-text-secondary">
              <h2 className="text-xl font-medium mb-2">Dashboard {dashboardNumber}</h2>
              <p>Dashboard {dashboardNumber} is coming soon.</p>
            </div>
          );
          console.log('Domain: returning content for dashboard:', dashboardNumber);
          return content;
        }
      }
    },
    { path: "settings", render: () => <SettingsPage /> },
    { path: "notifications", render: () => <NotificationsPage /> },
  ],
  explorer: TurnaroundsExplorer,
  onActivate: () => {
    // Auto-select Getting Started when domain loads (only if at root path)
    setTimeout(() => {
      const currentPath = window.location.pathname;
      console.log('Domain onActivate - current path:', currentPath);
      
      // Only auto-select Getting Started if we're at the root domain path
      if (currentPath === '/d/turnarounds' || currentPath === '/d/turnarounds/') {
        const event = new CustomEvent('domain-select-explorer', { 
          detail: { id: 'getting-started', title: 'Getting Started' } 
        });
        window.dispatchEvent(event);
        console.log('Dispatched domain-select-explorer event for Getting Started');
      } else {
        console.log('Skipping auto-select Getting Started - not at root path');
      }
    }, 200);
  },
};

export default TurnaroundsDomain;
