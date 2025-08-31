import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ChevronRight, ChevronDown, Lock, FileText, Edit, Trash2, Save, AlertTriangle, Eye } from "lucide-react";

// -----------------------------
// Types
// -----------------------------

type Originator = "Client" | "Contractor" | "Supplier" | "PM" | "Supervisor";

type Status =
  | "Awaiting Contractor Response"
  | "Awaiting Client Response"
  | "Pending Early Warning Meeting"
  | "Open"
  | "Responded"
  | "Closed-out"
  | "Overdue"
  | "Due Soon";

type EventMessage = {
  id: string;
  from: Originator;
  to: Originator;
  date: string;
  text: string;
  status?: Status;
};

type EventThread = {
  id: string;
  originator: Originator;
  triggerEvent: string;
  type: string;
  clause: string;
  status: Status;
  responseActionBy?: string;
  chain: EventMessage[];
};

// -----------------------------
// Mock Data
// -----------------------------

const sample: EventThread[] = [
  {
    id: "EW-001",
    originator: "Contractor",
    triggerEvent: "Potential access constraint at Bay 4",
    type: "EW",
    clause: "15",
    status: "Pending Early Warning Meeting",
    responseActionBy: "2025-08-25",
    chain: [
      { id: "EW-001-0", from: "Contractor", to: "PM", date: "2025-08-22", text: "EW: Access constraint may delay lifts." },
      { id: "EW-001-1", from: "PM", to: "Contractor", date: "2025-08-23", text: "Mitigation meeting set for 24 Aug 08:00." },
    ],
  },
];

// -----------------------------
// Helpers
// -----------------------------

const statusBadge = (s?: Status) => {
  if (!s) return null;
  const map: Record<Status, string> = {
    "Awaiting Contractor Response": "bg-amber-100 text-amber-700",
    "Awaiting Client Response": "bg-amber-100 text-amber-700",
    "Pending Early Warning Meeting": "bg-indigo-100 text-indigo-700",
    Open: "bg-blue-100 text-blue-700",
    Responded: "bg-slate-100 text-slate-700",
    "Closed-out": "bg-emerald-100 text-emerald-700",
    Overdue: "bg-red-100 text-red-700",
    "Due Soon": "bg-amber-100 text-amber-700",
  };
  return <Badge className={`rounded-full ${map[s]} px-2.5 py-1 text-xs`}>{s}</Badge>;
};

function nowISO() {
  return new Date().toISOString().slice(0, 10);
}

// -----------------------------
// Fullscreen Overlays
// -----------------------------

function FullscreenOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex">
      <div className="bg-white w-full h-full p-4 overflow-auto">
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>✕</Button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Draft/Creation form — fullscreen
function ResponseFormFullscreen({
  initialText = "",
  isEditingDraft = false,
  onCancel,
  onSaveDraft,
  onExportPDF,
  onDeleteDraft,
}: {
  initialText?: string;
  isEditingDraft?: boolean;
  onCancel: () => void;
  onSaveDraft: (text: string) => void;
  onExportPDF: (text: string) => void;
  onDeleteDraft?: () => void;
}) {
  const [text, setText] = useState(initialText);
  return (
    <FullscreenOverlay onClose={onCancel}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold mb-4">{isEditingDraft ? "Edit Draft" : "New Response"}</h2>
        <textarea className="w-full border rounded-md p-3 text-sm min-h-[300px]" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your response…" />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => onSaveDraft(text)}><Save className="h-4 w-4 mr-1"/> Save Draft</Button>
          <Button variant="outline" onClick={() => onExportPDF(text)}><FileText className="h-4 w-4 mr-1"/> Export PDF</Button>
          {isEditingDraft && onDeleteDraft && (
            <Button variant="outline" onClick={onDeleteDraft}><Trash2 className="h-4 w-4 mr-1"/> Delete Draft</Button>
          )}
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </FullscreenOverlay>
  );
}

// Logged correspondence viewer — fullscreen (view-only)
function LoggedViewer({ m, onClose }: { m: EventMessage; onClose: () => void }) {
  return (
    <FullscreenOverlay onClose={onClose}>
      <div className="max-w-3xl mx-auto space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Correspondence Record</h2>
          <div className="text-sm text-slate-500">{m.from} → {m.to} • {m.date}</div>
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="whitespace-pre-wrap text-sm">{m.text}</div>
          </CardContent>
        </Card>
        <div className="flex gap-2">
          <Button variant="outline"><FileText className="h-4 w-4 mr-1"/> Export PDF</Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </FullscreenOverlay>
  );
}

// -----------------------------
// Components
// -----------------------------

function ChainItem({ m, onView }: { m: EventMessage; onView: (m: EventMessage) => void }) {
  return (
    <div className="p-3 rounded-xl border bg-white">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="font-medium text-slate-700">{m.from}</span>
        <span>→</span>
        <span className="font-medium text-slate-700">{m.to}</span>
        <span className="ml-auto">{m.date}</span>
      </div>
      <div className="text-sm mt-1">{m.text}</div>
      <div className="mt-2 flex items-center gap-2">
        {m.status && <div>{statusBadge(m.status)}</div>}
        <Button size="sm" variant="ghost" className="ml-auto" onClick={() => onView(m)}>
          <Eye className="h-4 w-4 mr-1"/> View
        </Button>
      </div>
    </div>
  );
}

type ActionChoice = "" | "Close-out" | "PM-Contractor" | "Contractor-PM" | "Client-Contractor";

function EventRow({ t }: { t: EventThread }) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<ActionChoice>("");
  const [showForm, setShowForm] = useState(false);
  const [viewerMsg, setViewerMsg] = useState<EventMessage | null>(null);

  // Draft management
  const [draftText, setDraftText] = useState<string | null>(null);
  const [draftAction, setDraftAction] = useState<ActionChoice>("");

  const isClosed = t.status === "Closed-out";
  const hasDraft = draftText !== null;

  function actionToParties(a: ActionChoice): { from: Originator; to: Originator } | null {
    switch (a) {
      case "PM-Contractor":
        return { from: "PM", to: "Contractor" };
      case "Contractor-PM":
        return { from: "Contractor", to: "PM" };
      case "Client-Contractor":
        return { from: "Client", to: "Contractor" };
      default:
        return null;
    }
  }

  function handleCreateNewResponse() {
    setShowForm(true);
    setDraftAction(action);
  }

  function handleSaveDraft(text: string) {
    setDraftText(text);
    setShowForm(false);
  }

  function handleLogResponse(text: string) {
    const parties = actionToParties(draftAction || action);
    if (!parties) return;
    t.chain.push({ id: `${t.id}-${t.chain.length}`, from: parties.from, to: parties.to, date: nowISO(), text });
    setDraftText(null);
    setDraftAction("");
    setShowForm(false);
  }

  function deleteDraft() {
    setDraftText(null);
    setDraftAction("");
  }

  return (
    <>
      <TableRow className="cursor-pointer" onClick={() => setOpen((v) => !v)}>
        <TableCell className="w-[120px]">
          <div className="flex items-center gap-1">
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <span>{t.id}</span>
          </div>
        </TableCell>
        <TableCell>{t.originator}</TableCell>
        <TableCell className="hidden md:table-cell">{t.triggerEvent}</TableCell>
        <TableCell>{t.type}</TableCell>
        <TableCell>{t.clause}</TableCell>
        <TableCell>{statusBadge(t.status)}</TableCell>
        <TableCell>{t.responseActionBy ?? "—"}</TableCell>
      </TableRow>

      {open && (
        <TableRow>
          <TableCell colSpan={7} className="bg-slate-50">
            <div className="p-4 space-y-4">
              <div className="text-xs font-medium text-slate-500 mb-2">Correspondence Chain</div>
              <div className="space-y-2">
                {t.chain.map((m) => (
                  <ChainItem key={m.id} m={m} onView={(mm) => setViewerMsg(mm)} />
                ))}
              </div>

              {/* Draft panel (separate from chain) */}
              {hasDraft && (
                <Card className="border-amber-300 bg-amber-50">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-600"/> Draft Response (not logged)</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <div className="text-sm whitespace-pre-wrap">{draftText}</div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => setShowForm(true)}><Edit className="h-4 w-4 mr-1"/> Edit Draft</Button>
                      <Button size="sm" onClick={() => handleLogResponse(draftText!)}><FileText className="h-4 w-4 mr-1"/> Log Response</Button>
                    </div>
                    <div className="text-xs text-amber-700">While a draft exists, no new action can be started.</div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="pt-3 border-t space-y-3">
                {isClosed ? (
                  <div className="text-xs text-red-600 flex items-center gap-2">
                    <Lock className="h-4 w-4"/> This event is closed. No further correspondence allowed.
                  </div>
                ) : (
                  <>
                    <Select value={action} onValueChange={setAction} disabled={hasDraft}>
                      <SelectTrigger><SelectValue placeholder="Select Action" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Close-out">Close-out</SelectItem>
                        <SelectItem value="PM-Contractor">PM → Contractor Response</SelectItem>
                        <SelectItem value="Contractor-PM">Contractor → PM Response</SelectItem>
                        <SelectItem value="Client-Contractor">Client → Contractor Response</SelectItem>
                      </SelectContent>
                    </Select>
                    {action === "Close-out" && !hasDraft && (
                      <Button size="sm" variant="destructive"><Lock className="h-4 w-4 mr-1"/> Close Event</Button>
                    )}
                    {(action === "PM-Contractor" || action === "Contractor-PM" || action === "Client-Contractor") && !hasDraft && (
                      <Button size="sm" onClick={handleCreateNewResponse}>Create New Response</Button>
                    )}
                  </>
                )}
              </div>

              {/* Fullscreen forms/viewers */}
              {showForm && (
                <ResponseFormFullscreen
                  initialText={draftText ?? ""}
                  isEditingDraft={!!draftText}
                  onCancel={() => setShowForm(false)}
                  onSaveDraft={(text) => handleSaveDraft(text)}
                  onExportPDF={() => { /* placeholder */ }}
                  onDeleteDraft={draftText ? deleteDraft : undefined}
                />
              )}
              {viewerMsg && (
                <LoggedViewer m={viewerMsg} onClose={() => setViewerMsg(null)} />
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export default function ContractEventTriggeredSpec() {
  const [rows] = useState<EventThread[]>(sample);
  const [search, setSearch] = useState("");
  const [originator, setOriginator] = useState<Originator | "All">("All");
  const [status, setStatus] = useState<Status | "All">("All");

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const s = search.trim().toLowerCase();
      const matches =
        !s ||
        r.id.toLowerCase().includes(s) ||
        r.triggerEvent.toLowerCase().includes(s) ||
        r.type.toLowerCase().includes(s) ||
        r.clause.toLowerCase().includes(s);
      const matchesOriginator = originator === "All" || r.originator === originator;
      const matchesStatus = status === "All" || r.status === status;
      return matches && matchesOriginator && matchesStatus;
    });
  }, [rows, search, originator, status]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contract — Event Triggered (Spec)</h1>
          <p className="text-sm text-slate-500">Root = Triggering Event. Expand to manage correspondence chain. Draft responses are kept separate until logged.</p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Event-Triggered Communications</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Filters */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3 border-b">
            <div className="md:col-span-2">
              <div className="text-xs text-slate-500 mb-1">Search</div>
              <Input placeholder="Search by ID, trigger, type, clause…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Originator</div>
              <Select value={originator} onValueChange={(v) => setOriginator(v as any)}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Client">Client</SelectItem>
                  <SelectItem value="Contractor">Contractor</SelectItem>
                  <SelectItem value="Supplier">Supplier</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                  <SelectItem value="Supervisor">Supervisor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Status</div>
              <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Awaiting Contractor Response">Awaiting Contractor Response</SelectItem>
                  <SelectItem value="Awaiting Client Response">Awaiting Client Response</SelectItem>
                  <SelectItem value="Pending Early Warning Meeting">Pending Early Warning Meeting</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Due Soon">Due Soon</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                  <SelectItem value="Responded">Responded</SelectItem>
                  <SelectItem value="Closed-out">Closed-out</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Originator</TableHead>
                <TableHead>Trigger Event</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>Clause Ref</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Response/Action By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t) => (
                <EventRow key={t.id} t={t} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
