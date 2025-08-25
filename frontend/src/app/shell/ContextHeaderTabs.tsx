import { useState } from "react";

export default function ContextHeaderTabs({
  title,
  tabs = ["Overview", "Details", "Activity"],
}: {
  title: string;
  tabs?: string[];
}) {
  const [active, setActive] = useState(0);
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-border-subtle">
      <div className="px-2 py-1">
        <div className="flex items-center gap-0.5">
          {tabs.map((t, i) => (
            <button
              key={t}
              onClick={() => setActive(i)}
              className={`px-2 py-1 text-sm font-medium whitespace-nowrap min-h-[28px] border-b-2 ${
                i === active
                  ? "text-brand-navy border-brand-copper"
                  : "text-text-secondary border-transparent hover:text-brand-navy hover:bg-transparent"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
