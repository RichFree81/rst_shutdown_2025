import { lazy, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { JSX } from "react";
import type { DomainDefinition, ExplorerItem, ExplorerProvider, TabSpec, TabsProviderContext } from "@/app/shell/contracts";

const DashboardsPage = lazy(() => import("./pages/DashboardsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const CostPage = lazy(() => import("./pages/CostPage"));

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

// Shared helpers/components for inline editing in Overview
const STATUS_OPTIONS = ["On Track", "At Risk", "Delayed", "Complete", "Not Started"] as const;
type KpiStatus = typeof STATUS_OPTIONS[number];

function statusClass(s: string) {
  switch (s) {
    case "On Track": return "bg-green-100 text-green-800 border-green-300";
    case "At Risk": return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "Delayed": return "bg-red-100 text-red-800 border-red-300";
    case "Complete": return "bg-blue-100 text-blue-800 border-blue-300";
    case "Not Started": return "bg-gray-100 text-gray-800 border-gray-300";
    default: return "bg-gray-100 text-gray-800 border-gray-300";
  }
}

function FieldText({ value, onChange, editing }: { value: string; onChange: (v: string) => void; editing: boolean }) {
  if (!editing) return <span className="inline-block align-baseline">{value || "—"}</span>;
  return (
    <input
      className="w-full border border-border-subtle rounded px-2 py-1 text-sm"
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  );
}

function FieldMultiline({ value, onChange, editing }: { value: string; onChange: (v: string) => void; editing: boolean }) {
  if (!editing) return (
    <div className="text-sm pr-6">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Use padding-left to create hanging indent so wrapped lines align with text, not the marker
          ul: (props: any) => <ul className="list-disc pl-6 my-1" {...props} />,
          ol: (props: any) => <ol className="list-decimal pl-6 my-1" {...props} />,
          li: (props: any) => <li className="mb-0.5" {...props} />,
          p: (props: any) => <p className="my-1" {...props} />,
        }}
      >
        {value || "—"}
      </ReactMarkdown>
    </div>
  );
  // Edit mode with formatting toolbar
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  const toggleBullets = () => {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? 0;
    const before = value.slice(0, start);
    const selected = value.slice(start, end) || value; // if nothing selected, apply to full text
    const after = value.slice(end);
    const lines = selected.split(/\r?\n/);
    const allBulleted = lines.every(l => /^\s*-\s+/.test(l) || l.trim() === "");
    let formatted: string;
    if (allBulleted) {
      // remove bullets
      formatted = lines.map(l => l.replace(/^\s*-\s+/, "")).join("\n");
    } else {
      // replace any numbering with bullets, then add bullets
      formatted = lines
        .map(l => l.replace(/^\s*\d+\.\s+/, ""))
        .map(l => l.replace(/^\s*-\s+/, "- "))
        .map(l => (l.trim() ? (l.startsWith("- ") ? l : `- ${l}`) : l))
        .join("\n");
    }
    const next = before + formatted + after;
    onChange(next);
    // restore selection roughly over formatted block
    const newEnd = before.length + formatted.length;
    requestAnimationFrame(() => ta.setSelectionRange(before.length, newEnd));
  };

  const toggleNumbers = () => {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? 0;
    const before = value.slice(0, start);
    const selected = value.slice(start, end) || value; // if nothing selected, apply to full text
    const after = value.slice(end);
    const lines = selected.split(/\r?\n/);
    const allNumbered = lines.every(l => /^\s*\d+\.\s+/.test(l) || l.trim() === "");
    let formatted: string;
    if (allNumbered) {
      // remove numbering
      formatted = lines.map(l => l.replace(/^\s*\d+\.\s+/, "")).join("\n");
    } else {
      // replace any bullets with numbers, then number sequentially
      const cleaned = lines.map(l => l.replace(/^\s*-\s+/, ""));
      formatted = cleaned.map((l, i) => (l.trim() ? `${i + 1}. ${l}` : l)).join("\n");
    }
    const next = before + formatted + after;
    onChange(next);
    const newEnd = before.length + formatted.length;
    requestAnimationFrame(() => ta.setSelectionRange(before.length, newEnd));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter') return;
    const ta = taRef.current;
    if (!ta) return;
    const pos = ta.selectionStart ?? 0;
    // Find current line boundaries
    const prevNL = value.lastIndexOf('\n', pos - 1);
    const nextNL = value.indexOf('\n', pos);
    const lineStart = prevNL === -1 ? 0 : prevNL + 1;
    const lineEnd = nextNL === -1 ? value.length : nextNL;
    const line = value.slice(lineStart, lineEnd);

    const bulletMatch = line.match(/^(\s*)-\s+(.*)$/);
    const numMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);

    if (bulletMatch) {
      e.preventDefault();
      const indent = bulletMatch[1] || '';
      const content = (bulletMatch[2] || '').trim();
      if (!content) {
        // Exit list: remove bullet and create normal new line
        const next = value.slice(0, lineStart) + value.slice(lineEnd);
        onChange(next);
        requestAnimationFrame(() => ta.setSelectionRange(lineStart, lineStart));
      } else {
        // Continue bullet on next line
        const insert = '\n' + indent + '- ';
        const next = value.slice(0, pos) + insert + value.slice(pos);
        onChange(next);
        const newPos = pos + insert.length;
        requestAnimationFrame(() => ta.setSelectionRange(newPos, newPos));
      }
      return;
    }

    if (numMatch) {
      e.preventDefault();
      const indent = numMatch[1] || '';
      const n = parseInt(numMatch[2] || '0', 10);
      const content = (numMatch[3] || '').trim();
      if (!content) {
        // Exit list
        const next = value.slice(0, lineStart) + value.slice(lineEnd);
        onChange(next);
        requestAnimationFrame(() => ta.setSelectionRange(lineStart, lineStart));
      } else {
        // Continue numbering
        const insert = '\n' + indent + (n + 1).toString() + '. ';
        const next = value.slice(0, pos) + insert + value.slice(pos);
        onChange(next);
        const newPos = pos + insert.length;
        requestAnimationFrame(() => ta.setSelectionRange(newPos, newPos));
      }
      return;
    }
  };

  return (
    <div>
      <div className="mb-1 flex items-center gap-1">
        <button type="button" className="px-2 py-0.5 text-xs rounded border" onClick={toggleBullets} title="Bulleted list">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
            <circle cx="5" cy="6" r="1.5"/>
            <rect x="9" y="5" width="10" height="2" rx="1"/>
            <circle cx="5" cy="12" r="1.5"/>
            <rect x="9" y="11" width="10" height="2" rx="1"/>
            <circle cx="5" cy="18" r="1.5"/>
            <rect x="9" y="17" width="10" height="2" rx="1"/>
          </svg>
        </button>
        <button type="button" className="px-2 py-0.5 text-xs rounded border" onClick={toggleNumbers} title="Numbered list">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
            <text x="3" y="7" fontSize="6">1.</text>
            <rect x="9" y="5" width="10" height="2" rx="1"/>
            <text x="3" y="13" fontSize="6">2.</text>
            <rect x="9" y="11" width="10" height="2" rx="1"/>
            <text x="3" y="19" fontSize="6">3.</text>
            <rect x="9" y="17" width="10" height="2" rx="1"/>
          </svg>
        </button>
      </div>
      <textarea
        ref={taRef}
        className="w-full h-28 border border-border-subtle rounded px-2 py-1 text-sm"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

function WorkPackageOverview({ data }: { data: any }) {
  const [editing, setEditing] = useState(false);
  const [owner, setOwner] = useState<string>(data.owner);
  const [discipline, setDiscipline] = useState<string>(data.discipline);
  // Single string for related project: "PRJ-123: Furnace 4 Major Shutdown"
  const [relatedProjectDesc, setRelatedProjectDesc] = useState<string>(`${data.related_project_id}: ${data.related_project_name}`);
  const [kShutdown, setKShutdown] = useState<KpiStatus>(data.kpis.shutdown_readiness);
  const [kWorks, setKWorks] = useState<KpiStatus>(data.kpis.works_execution);
  const [kRts, setKRts] = useState<KpiStatus>(data.kpis.return_to_service);
  const [kClose, setKClose] = useState<KpiStatus>(data.kpis.close_out);
  const [scope, setScope] = useState<any>({ ...data.scope });
  const [locked, setLocked] = useState<boolean>(!!data.locked);
  // TODO: wire to real auth/roles later. For now, everyone can lock/unlock.

  const toggleLock = () => {
    setLocked(prev => {
      const next = !prev;
      if (next) setEditing(false); // when locking, exit edit mode
      return next;
    });
  };

  // last saved snapshot for cancel
  const [lastSaved, setLastSaved] = useState<any>({
    owner: data.owner,
    discipline: data.discipline,
    relatedProjectDesc: `${data.related_project_id}: ${data.related_project_name}`,
    scope: { ...data.scope },
  });

  const onCancelAll = () => {
    setOwner(lastSaved.owner);
    setDiscipline(lastSaved.discipline);
    setRelatedProjectDesc(lastSaved.relatedProjectDesc);
    setScope({ ...lastSaved.scope });
    setEditing(false);
  };

  const onSaveAll = () => {
    setLastSaved({ owner, discipline, relatedProjectDesc, scope: { ...scope } });
    setEditing(false);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Identity block */}
      <div>
        <div className="text-brand-navy flex items-start justify-between gap-4">
          <div className="leading-tight">
            <div className="text-sm font-semibold uppercase tracking-wide">{data.id}</div>
            <div className="text-lg font-semibold uppercase tracking-wide">{data.title.replace(/^\w+-\d+\:\s*/, "")}</div>
          </div>
          <div className="flex items-center gap-2">
            {/* Lock indicator and controls */}
            {locked && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-border-subtle bg-gray-50 text-gray-700">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                  <path d="M12 2a5 5 0 00-5 5v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm-3 8V7a3 3 0 016 0v3H9z"/>
                </svg>
                Locked
              </span>
            )}
            {/* Lock toggle (temporarily available to all users) */}
            {!editing && (
              <div className="relative inline-flex items-center group">
                <button
                  type="button"
                  role="switch"
                  aria-checked={locked}
                  aria-label={locked ? 'Unlock Package Overview' : 'Lock Package Overview'}
                  onClick={toggleLock}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${locked ? 'bg-blue-500' : 'bg-gray-300'}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${locked ? 'translate-x-5' : 'translate-x-1'}`}
                  />
                </button>
                {/* Themed tooltip */}
                <div className="pointer-events-none absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <div className="rounded-md border border-border-subtle bg-white text-[11px] text-gray-800 px-2 py-1 shadow-md">
                    {locked ? 'Unlock Package Overview' : 'Lock Package Overview'}
                  </div>
                </div>
              </div>
            )}
            {/* Removed extra text label to avoid duplicate "Locked" tags */}
            {/* Edit controls */}
            {!editing ? (
              <button
                type="button"
                className="px-3 py-1.5 text-sm rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => !locked && setEditing(true)}
                disabled={locked}
                title={locked ? "Locked. Unlock to edit." : "Edit"}
              >
                Edit
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm rounded border"
                  onClick={onCancelAll}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm rounded bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={onSaveAll}
                >
                  Save
                </button>
              </>
            )}
          </div>
        </div>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded-lg border border-border-subtle md:col-span-2">
            <div className="text-sm text-text-secondary">Related Project</div>
            <div className="flex items-baseline gap-2 whitespace-nowrap min-w-0">
              <span className="truncate">
                <FieldText value={relatedProjectDesc} onChange={setRelatedProjectDesc} editing={editing} />
              </span>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-border-subtle">
            <div className="text-sm text-text-secondary">Discipline</div>
            <FieldText value={discipline} onChange={setDiscipline} editing={editing} />
          </div>
          <div className="bg-white p-3 rounded-lg border border-border-subtle">
            <div className="text-sm text-text-secondary">Package Owner</div>
            <FieldText value={owner} onChange={setOwner} editing={editing} />
          </div>
        </div>
      </div>

      {/* KPIs row */}
      <div>
        {/* KPIs header removed per request */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-white p-3 rounded-lg border border-border-subtle">
            <div className="text-sm text-text-secondary">Shutdown Readiness</div>
            <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded border ${statusClass(kShutdown)}`}>{kShutdown}</span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-border-subtle">
            <div className="text-sm text-text-secondary">Works Execution</div>
            <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded border ${statusClass(kWorks)}`}>{kWorks}</span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-border-subtle">
            <div className="text-sm text-text-secondary">Return to Service</div>
            <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded border ${statusClass(kRts)}`}>{kRts}</span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-border-subtle">
            <div className="text-sm text-text-secondary">Close-out</div>
            <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded border ${statusClass(kClose)}`}>{kClose}</span>
          </div>
        </div>
      </div>

      {/* Scope Summary */}
      <div>
        <div className="text-sm font-semibold text-brand-navy mb-2">Scope Summary</div>
        <div className="bg-white rounded-lg border border-border-subtle">
          <dl className="divide-y divide-border-subtle">
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3 p-4">
              <dt className="col-span-1 md:col-span-2 text-sm text-text-secondary">Purpose:</dt>
              <dd className="col-span-3 md:col-span-4 text-sm">
                <FieldMultiline value={scope.purpose} onChange={v => setScope((s: any) => ({ ...s, purpose: v }))} editing={editing} />
              </dd>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3 p-4">
              <dt className="col-span-1 md:col-span-2 text-sm text-text-secondary">Overview of Works:</dt>
              <dd className="col-span-3 md:col-span-4 text-sm">
                <FieldMultiline value={scope.overview_of_works} onChange={v => setScope((s: any) => ({ ...s, overview_of_works: v }))} editing={editing} />
              </dd>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3 p-4">
              <dt className="col-span-1 md:col-span-2 text-sm text-text-secondary">Pre-Turnaround Work:</dt>
              <dd className="col-span-3 md:col-span-4 text-sm">
                <FieldMultiline value={scope.pre_turnaround_work} onChange={v => setScope((s: any) => ({ ...s, pre_turnaround_work: v }))} editing={editing} />
              </dd>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3 p-4">
              <dt className="col-span-1 md:col-span-2 text-sm text-text-secondary">Turnaround Work:</dt>
              <dd className="col-span-3 md:col-span-4 text-sm">
                <FieldMultiline value={scope.turnaround_work} onChange={v => setScope((s: any) => ({ ...s, turnaround_work: v }))} editing={editing} />
              </dd>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3 p-4">
              <dt className="col-span-1 md:col-span-2 text-sm text-text-secondary">Post-Turnaround Work:</dt>
              <dd className="col-span-3 md:col-span-4 text-sm">
                <FieldMultiline value={scope.post_turnaround_work} onChange={v => setScope((s: any) => ({ ...s, post_turnaround_work: v }))} editing={editing} />
              </dd>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3 p-4">
              <dt className="col-span-1 md:col-span-2 text-sm text-text-secondary">End Deliverables:</dt>
              <dd className="col-span-3 md:col-span-4 text-sm">
                <FieldMultiline value={scope.end_deliverables} onChange={v => setScope((s: any) => ({ ...s, end_deliverables: v }))} editing={editing} />
              </dd>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3 p-4">
              <dt className="col-span-1 md:col-span-2 text-sm text-text-secondary">Constraints:</dt>
              <dd className="col-span-3 md:col-span-4 text-sm">
                <FieldMultiline value={scope.constraints} onChange={v => setScope((s: any) => ({ ...s, constraints: v }))} editing={editing} />
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

// Demo data for work packages: predefined fields, per-package values
const workPackagesData: Record<string, {
  // Identity
  id: string;
  title: string;
  discipline: string;
  owner: string;
  // Project linkage
  related_project_id: string;
  related_project_name: string;
  // Overall status (free text aligned to spec labels)
  overall_status: "Not Started" | "In Progress: On Track" | "In Progress: At Risk" | "On Hold" | "Complete";
  // KPIs
  kpis: {
    shutdown_readiness: "On Track" | "At Risk" | "Delayed" | "Complete" | "Not Started";
    works_execution: "On Track" | "At Risk" | "Delayed" | "Complete" | "Not Started";
    return_to_service: "On Track" | "At Risk" | "Delayed" | "Complete" | "Not Started";
    close_out: "On Track" | "At Risk" | "Delayed" | "Complete" | "Not Started";
  };
  // Dates
  start_date?: string;
  end_date?: string;
  // Scope summary (multiline strings allowed)
  scope: {
    purpose: string;
    overview_of_works: string;
    pre_turnaround_work: string;
    turnaround_work: string;
    post_turnaround_work: string;
    end_deliverables: string;
    constraints: string;
  };
}> = {
  "wp-1": {
    id: "WP-001",
    title: "WP-001: Tank Inspection",
    discipline: "Mechanical",
    owner: "John Doe (Planner)",
    related_project_id: "PRJ-123",
    related_project_name: "Furnace 4 Major Shutdown",
    overall_status: "In Progress: On Track",
    kpis: {
      shutdown_readiness: "On Track",
      works_execution: "At Risk",
      return_to_service: "Delayed",
      close_out: "Not Started",
    },
    start_date: "2025-09-01",
    end_date: "2025-09-05",
    scope: {
      purpose: "Ensure integrity of tank T-101 to support safe operations post-turnaround.",
      overview_of_works: "Internal visual inspection, thickness measurements, nozzle inspection, and coating assessment.",
      pre_turnaround_work: "Scaffolding setup, isolation planning, permits, pre-job briefings.",
      turnaround_work: "Drain and gas-free tank, open manways, perform inspections, document findings.",
      post_turnaround_work: "Close tank, remove scaffolding, restore utilities, finalize reports.",
      end_deliverables: "Inspection report, repair recommendations, updated asset records.",
      constraints: "Confined space entry requirements and limited outage window.",
    },
  },
  "wp-2": {
    id: "WP-002",
    title: "WP-002: Valve Replacement",
    discipline: "Instrumentation",
    owner: "Jane Smith (Engineer)",
    related_project_id: "PRJ-123",
    related_project_name: "Furnace 4 Major Shutdown",
    overall_status: "Not Started",
    kpis: {
      shutdown_readiness: "On Track",
      works_execution: "Not Started",
      return_to_service: "Not Started",
      close_out: "Not Started",
    },
    start_date: "2025-09-06",
    end_date: "2025-09-08",
    scope: {
      purpose: "Restore optimal control of feed flow via CV-220 replacement.",
      overview_of_works: "Remove existing valve, install new valve, integrity checks, and calibration.",
      pre_turnaround_work: "Spare verification, tools prep, isolation plan, scaffolding if required.",
      turnaround_work: "Depressurize, remove old valve, install new valve, leak test, calibrate.",
      post_turnaround_work: "Functional testing under load and documentation updates.",
      end_deliverables: "Calibration sheet, as-built records, commissioning sign-off.",
      constraints: "Tight space and coordination with operations for isolation windows.",
    },
  },
  "wp-3": {
    id: "WP-003",
    title: "WP-003: Scaffolding Setup",
    discipline: "Civil",
    owner: "Alan Turing (Technician)",
    related_project_id: "PRJ-123",
    related_project_name: "Furnace 4 Major Shutdown",
    overall_status: "Complete",
    kpis: {
      shutdown_readiness: "Complete",
      works_execution: "Complete",
      return_to_service: "Complete",
      close_out: "Complete",
    },
    start_date: "2025-08-24",
    end_date: "2025-08-28",
    scope: {
      purpose: "Provide safe access for exchanger maintenance activities.",
      overview_of_works: "Erect and certify scaffold structures per plan.",
      pre_turnaround_work: "Material staging and site preparation.",
      turnaround_work: "Build scaffolds, tag, and handover to users.",
      post_turnaround_work: "Dismantle scaffolds and clear site.",
      end_deliverables: "Scaffold handover certificates and inspection logs.",
      constraints: "Limited laydown area and shared access routes.",
    },
  },
};

const allWorkPackages: ExplorerItem[] = [
  { id: "wp-1", label: <div className="text-sm">WP-001: Tank Inspection</div>, hideIcon: true, path: "/d/turnarounds/work-packages/wp-1" },
  { id: "wp-2", label: <div className="text-sm">WP-002: Valve Replacement</div>, hideIcon: true, path: "/d/turnarounds/work-packages/wp-2" },
  { id: "wp-3", label: <div className="text-sm">WP-003: Scaffolding Setup</div>, hideIcon: true, path: "/d/turnarounds/work-packages/wp-3" },
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
    {
      path: "work-packages/:wpId",
      render: () => <div />,
      tabs: {
        async getTabs(_ctx: TabsProviderContext): Promise<TabSpec[]> {
          // Same tabs for each work package
          return [
            { key: "overview", label: "Overview" },
            { key: "cost", label: "Cost" },
          ];
        },
        renderTabContent(tabKey: string, ctx: TabsProviderContext): JSX.Element {
          // Extract wpId from path like "/work-packages/wp-1"
          const parts = ctx.path.replace(/^\/+/, "").split("/");
          const wpId = parts[1] || "";
          const data = workPackagesData[wpId];
          if (!data) {
            return <div className="p-4 text-sm text-red-700">Work Package not found</div>;
          }
          if (tabKey === "overview") {
            return <WorkPackageOverview data={data} />;
          }
          if (tabKey === "cost") {
            return <CostPage wpId={wpId} data={data} />;
          }
          return <div className="p-4">Unknown tab</div>;
        },
      },
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
