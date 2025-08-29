import { useState, useEffect } from "react";
import type { TabsProvider, TabsProviderContext, TabSpec } from "./contracts";

interface TabsRendererProps {
  tabsProvider: TabsProvider;
  context: TabsProviderContext;
}

export default function TabsRenderer({ tabsProvider, context }: TabsRendererProps) {
  const [tabs, setTabs] = useState<TabSpec[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTabs() {
      setLoading(true);
      try {
        console.log('TabsRenderer: Loading tabs with context:', context);
        const tabSpecs = await tabsProvider.getTabs(context);
        console.log('TabsRenderer: Loaded tabs:', tabSpecs);
        setTabs(tabSpecs);
        setActiveTab(0); // Reset to first tab when tabs change
      } catch (error) {
        console.error('Failed to load tabs:', error);
        setTabs([]);
      } finally {
        setLoading(false);
      }
    }
    
    loadTabs();
  }, [tabsProvider, context]);

  if (loading) {
    return <div className="p-4">Loading tabs...</div>;
  }

  if (tabs.length === 0) {
    return null;
  }

  const currentTab = tabs[activeTab];

  return (
    <div className="flex flex-col h-full">
      {/* Tab Headers */}
      <div className="sticky top-0 z-10 bg-white border-b border-border-subtle">
        <div className="px-2 py-1">
          <div className="flex items-center gap-0.5">
            {tabs.map((tab, i) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(i)}
                className={`px-2 py-1 text-sm font-medium whitespace-nowrap min-h-[28px] border-b-2 ${
                  i === activeTab
                    ? "text-brand-navy border-brand-copper"
                    : "text-text-secondary border-transparent hover:text-brand-navy hover:bg-transparent"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {currentTab ? (
          <>
            {console.log('TabsRenderer: Rendering content for tab:', currentTab.key)}
            {tabsProvider.renderTabContent(currentTab.key, context)}
          </>
        ) : (
          <div className="p-4 text-text-secondary">No tab selected</div>
        )}
      </div>
    </div>
  );
}
