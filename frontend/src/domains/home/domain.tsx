import type { JSX } from "react";
import type { DomainDefinition, ExplorerItem, ExplorerProvider, TabsProviderContext } from "@/app/shell/contracts";

const HomeIcon = {
  title: "Home",
  render(): JSX.Element {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
        <path d="M12 3 3 10h2v9h6v-6h2v6h6v-9h2z" />
      </svg>
    );
  },
};

const HomeExplorer: ExplorerProvider = {
  async getTree(_ctx): Promise<ExplorerItem[]> {
    // Keep empty for now; can be extended later
    return [];
  },
};

function HomeLanding(_ctx: TabsProviderContext): JSX.Element {
  return (
    <div className="p-4">
      <div className="text-sm text-gray-700">Welcome home.</div>
      <div className="mt-2 text-xs text-gray-500">Select a domain from the left or start a chat.</div>
    </div>
  );
}

const HomeDomain: DomainDefinition = {
  id: "home",
  title: "Home",
  icon: HomeIcon,
  routes: [
    { path: "/", render: (ctx) => HomeLanding(ctx) },
  ],
  explorer: HomeExplorer,
  defaultPath: "/",
};

export default HomeDomain;
