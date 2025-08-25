import type { DomainDefinition, ExplorerProviderContext, ExplorerItem, TabsProviderContext } from "@/app/shell/contracts";
import React from "react";

const SampleExplorer = {
  async getTree(_ctx: ExplorerProviderContext): Promise<ExplorerItem[]> {
    return [
      { id: "welcome", label: "Welcome" },
      {
        id: "examples",
        label: "Examples",
        children: [
          { id: "ex-1", label: "Example A" },
          { id: "ex-2", label: "Example B" },
        ],
      },
    ];
  },
};

const SampleDomain: DomainDefinition = {
  id: "sample",
  title: "Sample (Dev Only)",
  icon: {
    title: "Sample",
    render: () => (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><path d="M4 4h16v16H4z"/></svg>
    ),
  },
  defaultPath: "/overview",
  routes: [
    {
      path: "/overview",
      render: (_ctx: TabsProviderContext) => (
        <div className="space-y-2">
          <div className="text-sm">This is the generic Sample domain used to visually review shell structures. It is disabled by default in production.</div>
        </div>
      ),
      tabs: {
        async getTabs() {
          return [
            { key: "overview", label: "Overview" },
            { key: "activity", label: "Activity" },
          ];
        },
        renderTabContent(key: string, _ctx: TabsProviderContext) {
          if (key === "activity") return <div className="p-2">No recent activity.</div>;
          return <div className="p-2">Sample overview content.</div>;
        },
      },
    },
    {
      path: "/examples",
      render: (_ctx: TabsProviderContext) => <div className="p-2">Examples route</div>,
    },
  ],
  explorer: SampleExplorer,
};

export default SampleDomain;
