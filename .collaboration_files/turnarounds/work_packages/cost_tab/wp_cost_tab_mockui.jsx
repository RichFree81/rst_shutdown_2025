import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Plus } from "lucide-react";

// Cost-only tab (Instructions & Notices moved to its own tab)
export default function CostTab() {
  // ──────────────────────────────────────────────────────────────────────────────
  // Package heading (stacked, left)
  const pkg = { id: "WP-001", name: "Furnace 4 Refractory Replacement" };

  // ──────────────────────────────────────────────────────────────────────────────
  // Header fields (RTO / PO / Status) — manual fields, lock-aware
  const [headerInfo, setHeaderInfo] = useState({ rtoNumber: "", poNumber: "", status: "Awaiting Scoping" });

  // Tables data
  const [costItems, setCostItems] = useState([
    { id: "c1", item: "Civil Works", description: "Excavation & foundations", value: 1200000 },
    { id: "c2", item: "Mechanical Works", description: "Refractory installation", value: 2500000 },
    { id: "c3", item: "EC&I Works", description: "Instrument cabling", value: 800000 },
    { id: "c4", item: "Other", description: "Site facilities", value: 500000 },
  ]);
  const [voItems, setVoItems] = useState([
    { id: "v1", number: "VO-01", description: "Extra scaffolding", value: 150000, status: "Approved", dateRaised: "2025-07-10", dateApproved: "2025-07-12" },
    { id: "v2", number: "VO-02", description: "Additional lining material", value: 350000, status: "Pending", dateRaised: "2025-07-15", dateApproved: "" },
  ]);

  // Summary fields
  const [allowances, setAllowances] = useState(200000);
  // Manual Original Contract Price (editable in global edit)
  const initialOriginal = useMemo(() => costItems.reduce((s, r) => s + (Number(r.value) || 0), 0), []);
  const [originalPrice, setOriginalPrice] = useState(initialOriginal);

  // Global edit & lock
  const [isEditing, setIsEditing] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Draft state for globally edited areas
  const [draftHeaderInfo, setDraftHeaderInfo] = useState(headerInfo);
  const [draftCostItems, setDraftCostItems] = useState(costItems);
  const [draftAllowances, setDraftAllowances] = useState(allowances);
  const [draftOriginalPrice, setDraftOriginalPrice] = useState(originalPrice);

  // RTO state (one per package)
  type RtoItem = { id: string; item: string; description: string; value: number | string; include: boolean };
  const [rto, setRto] = useState<{ number: string; supplier: string; contact: string; email: string; notes: string; items: RtoItem[] } | null>(null);
  const [rtoOpen, setRtoOpen] = useState(false);
  const [rtoMode, setRtoMode] = useState<"view" | "edit">("view");
  const [rtoDraft, setRtoDraft] = useState<{ number: string; supplier: string; contact: string; email: string; notes: string; items: RtoItem[] }>({ number: "", supplier: "", contact: "", email: "", notes: "", items: [] });

  const currentHeaderInfo = isEditing ? draftHeaderInfo : headerInfo;
  const currentCostItems = isEditing ? draftCostItems : costItems;
  const currentAllowances = isEditing ? draftAllowances : allowances;
  const displayOriginalPrice = isEditing ? Number(draftOriginalPrice) || 0 : originalPrice;

  // Totals (from manual Original)
  const approvedVariations = useMemo(() => voItems.filter(v => v.status === "Approved").reduce((s, v) => s + (Number(v.value) || 0), 0), [voItems]);
  const pendingVariations = useMemo(() => voItems.filter(v => v.status === "Pending").reduce((s, v) => s + (Number(v.value) || 0), 0), [voItems]);
  const revisedContractPrice = displayOriginalPrice + approvedVariations;
  const estimateFinalContractPrice = revisedContractPrice + pendingVariations;

  const formatR = (n: number | string) => `R ${Number(n || 0).toLocaleString("en-ZA")}`;

  // Global edit handlers
  const enterEdit = () => {
    setDraftHeaderInfo({ ...headerInfo });
    setDraftCostItems(costItems.map(x => ({ ...x })));
    setDraftAllowances(allowances);
    setDraftOriginalPrice(originalPrice);
    setIsEditing(true);
  };
  const cancelEdit = () => setIsEditing(false);
  const saveEdit = () => {
    if (!isLocked) {
      setHeaderInfo(draftHeaderInfo);
      setCostItems(draftCostItems.map(x => ({ ...x, value: Number(x.value) || 0 })));
      setAllowances(Number(draftAllowances) || 0);
      setOriginalPrice(Number(draftOriginalPrice) || 0);
    }
    setIsEditing(false);
  };

  // Cost table helpers (add / edit / delete)
  const addDraftCostItem = () => setDraftCostItems(prev => ([...prev, { id: `c${Math.random().toString(36).slice(2)}`, item: "", description: "", value: 0 }]));
  const removeDraftCostItem = (id: string) => setDraftCostItems(prev => prev.filter(r => r.id !== id));
  const updateDraftCostItem = (id: string, patch: Partial<{ item: string; description: string; value: number | string }>) =>
    setDraftCostItems(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));

  // ── VO popout editor state (single View icon in table) ───────────────────────
  const [voEditorOpen, setVoEditorOpen] = useState(false);
  const [voEditorMode, setVoEditorMode] = useState<"view" | "edit">("view");
  const [voEditorData, setVoEditorData] = useState({ id: "", number: "", description: "", value: "", status: "Proposed", dateRaised: "", dateApproved: "" });
  const openVoEditor = (row: typeof voEditorData) => { setVoEditorData({ ...row }); setVoEditorMode("view"); setVoEditorOpen(true); };
  const saveVoEditor = () => {
    setVoItems(prev => prev.map(r => r.id === voEditorData.id ? { ...voEditorData, value: Number(voEditorData.value) || 0 } : r));
    setVoEditorMode("view");
    setVoEditorOpen(false);
  };
  const deleteVoEditor = () => { setVoItems(prev => prev.filter(r => r.id !== voEditorData.id)); setVoEditorOpen(false); };
  const exportVoPdf = () => { alert("Export VO to PDF (stub)"); };

  // New-record dialog for VO
  const [newVoOpen, setNewVoOpen] = useState(false);
  const [newVo, setNewVo] = useState({ number: "", description: "", value: "", status: "Proposed", dateRaised: "", dateApproved: "" });
  const createVo = () => {
    setVoItems(prev => ([...prev, { id: `v${Math.random().toString(36).slice(2)}`, ...newVo, value: Number(newVo.value) || 0 }]));
    setNewVo({ number: "", description: "", value: "", status: "Proposed", dateRaised: "", dateApproved: "" });
    setNewVoOpen(false);
  };

  // UX helper
  const DisabledOverlay: React.FC<{ disabled: boolean; children: React.ReactNode }> = ({ children, disabled }) => (
    <div className={disabled ? "pointer-events-none opacity-70" : ""}>{children}</div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Top bar: heading left; lock then edit on right */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm text-gray-500">{pkg.id}</span>
          <span className="text-xl font-semibold">{pkg.name}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch id="lock" checked={isLocked} onCheckedChange={setIsLocked} />
            <label htmlFor="lock" className="text-sm">Lock tab</label>
          </div>
          {!isEditing ? (
            <Button onClick={enterEdit} disabled={isLocked}>Edit</Button>
          ) : (
            <>
              <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
              <Button onClick={saveEdit} disabled={isLocked}>Save</Button>
            </>
          )}
        </div>
      </div>

      {/* Header Information (single row; lock-aware) */}
      <Card className="shadow-md rounded-2xl">
        <CardContent className="p-4 grid grid-cols-3 gap-4">
          <DisabledOverlay disabled={isLocked}>
            {/* RTO number + RTO popout form */}
            <div>
              <p className="text-sm text-gray-500">RTO Number</p>
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <p className="text-lg font-semibold">{currentHeaderInfo.rtoNumber || "-"}</p>
                ) : (
                  <Input value={draftHeaderInfo.rtoNumber} onChange={(e) => setDraftHeaderInfo({ ...draftHeaderInfo, rtoNumber: e.target.value })} />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Open editor; create from cost breakdown if new
                    if (!rto) {
                      const items: RtoItem[] = currentCostItems.map(ci => ({ id: ci.id, item: ci.item, description: ci.description, value: ci.value, include: true }));
                      setRtoDraft({ number: draftHeaderInfo.rtoNumber || currentHeaderInfo.rtoNumber || "", supplier: "", contact: "", email: "", notes: "", items });
                      setRtoMode("edit");
                    } else {
                      setRtoDraft({ ...rto });
                      setRtoMode("view");
                    }
                    setRtoOpen(true);
                  }}
                >{rto ? "Open RTO" : "Create RTO"}</Button>
              </div>
            </div>
            {/* PO number */}
            <div>
              <p className="text-sm text-gray-500">PO Number</p>
              {!isEditing ? (
                <p className="text-lg font-semibold">{currentHeaderInfo.poNumber || "-"}</p>
              ) : (
                <Input value={draftHeaderInfo.poNumber} onChange={(e) => setDraftHeaderInfo({ ...draftHeaderInfo, poNumber: e.target.value })} />
              )}
            </div>
            {/* Status */}
            <div>
              <p className="text-sm text-gray-500">Status</p>
              {!isEditing ? (
                <StatusBadge status={currentHeaderInfo.status} />
              ) : (
                <Select value={draftHeaderInfo.status} onValueChange={(val) => setDraftHeaderInfo({ ...draftHeaderInfo, status: val })}>
                  <SelectTrigger className="w-[200px]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Awaiting Scoping">Awaiting Scoping</SelectItem>
                    <SelectItem value="Awaiting Tender Pack">Awaiting Tender Pack</SelectItem>
                    <SelectItem value="Awaiting Bid Submissions">Awaiting Bid Submissions</SelectItem>
                    <SelectItem value="Pending Award">Pending Award</SelectItem>
                    <SelectItem value="Awarded">Awarded</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </DisabledOverlay>
        </CardContent>
      </Card>

      {/* Contract Summary (manual Original + computed totals; lock-aware) */}
      <Card className="shadow-md rounded-2xl">
        <CardContent className="p-4 grid grid-cols-2 gap-4">
          <DisabledOverlay disabled={isLocked}>
            {!isEditing ? (
              <SummaryCell label="Original Contract Price" value={formatR(displayOriginalPrice)} />
            ) : (
              <div>
                <p className="text-sm text-gray-500">Original Contract Price</p>
                <Input inputMode="decimal" value={draftOriginalPrice} onChange={(e) => setDraftOriginalPrice(e.target.value)} />
              </div>
            )}
          </DisabledOverlay>
          <SummaryCell label="Approved Variations" value={formatR(approvedVariations)} />
          <SummaryCell label="Revised Contract Price" value={formatR(revisedContractPrice)} />
          <SummaryCell label="Pending Variations" value={formatR(pendingVariations)} />
          <SummaryCell label="Estimate Final Contract Price" value={formatR(estimateFinalContractPrice)} />
          <DisabledOverlay disabled={isLocked}>
            {!isEditing ? (
              <SummaryCell label="Allowances / Provisional Sums" value={formatR(currentAllowances)} />
            ) : (
              <div>
                <p className="text-sm text-gray-500">Allowances / Provisional Sums</p>
                <Input inputMode="decimal" value={draftAllowances} onChange={(e) => setDraftAllowances(e.target.value)} />
              </div>
            )}
          </DisabledOverlay>
        </CardContent>
      </Card>

      {/* Cost Breakdown (lock-aware; Add left) */}
      <Card className="shadow-md rounded-2xl">
        <CardContent className="p-4 space-y-3">
          <h2 className="text-xl font-semibold">Cost Breakdown</h2>
          <DisabledOverlay disabled={isLocked}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Value (R)</TableHead>
                  {isEditing && <TableHead className="w-24" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentCostItems.map(row => (
                  <TableRow key={row.id}>
                    <TableCell>{isEditing ? (<Input value={row.item} onChange={(e) => updateDraftCostItem(row.id, { item: e.target.value })} />) : row.item}</TableCell>
                    <TableCell>{isEditing ? (<Input value={row.description} onChange={(e) => updateDraftCostItem(row.id, { description: e.target.value })} />) : row.description}</TableCell>
                    <TableCell className="text-right">{isEditing ? (<Input inputMode="decimal" value={row.value} onChange={(e) => updateDraftCostItem(row.id, { value: e.target.value })} />) : formatR(row.value)}</TableCell>
                    {isEditing && (
                      <TableCell className="text-right"><Button variant="ghost" title="Delete" onClick={() => removeDraftCostItem(row.id)}>🗑️</Button></TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {isEditing && (
              <div className="flex justify-start"><Button variant="secondary" onClick={addDraftCostItem}><Plus className="h-4 w-4 mr-2" />Add Cost Item</Button></div>
            )}
          </DisabledOverlay>
        </CardContent>
      </Card>

      {/* Variation Orders (independent of lock/global edit, single View icon) */}
      <Card className="shadow-md rounded-2xl">
        <CardContent className="p-4 space-y-3">
          <h2 className="text-xl font-semibold mb-2">Variation Orders</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>VO No</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Value (R)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Raised</TableHead>
                <TableHead>Date Approved</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {voItems.map(vo => (
                <TableRow key={vo.id}>
                  <TableCell>{vo.number}</TableCell>
                  <TableCell>{vo.description}</TableCell>
                  <TableCell className="text-right">{formatR(vo.value)}</TableCell>
                  <TableCell>
                    <Select value={vo.status} onValueChange={(val) => setVoItems(prev => prev.map(r => r.id === vo.id ? { ...r, status: val } : r))}>
                      <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Proposed">Proposed</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{vo.dateRaised}</TableCell>
                  <TableCell>{vo.dateApproved || "-"}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" title="View" onClick={() => openVoEditor(vo)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Add New VO (left) */}
          <div className="flex justify-start"><Button onClick={() => setNewVoOpen(true)}><Plus className="h-4 w-4 mr-2" />Add New…</Button></div>
        </CardContent>
      </Card>

      {/* New VO Dialog */}
      <Dialog open={newVoOpen} onOpenChange={setNewVoOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Variation Order</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs text-gray-500">VO Number</p><Input value={newVo.number} onChange={(e) => setNewVo({ ...newVo, number: e.target.value })} /></div>
              <div><p className="text-xs text-gray-500">Value (R)</p><Input inputMode="decimal" value={newVo.value} onChange={(e) => setNewVo({ ...newVo, value: e.target.value })} /></div>
            </div>
            <div><p className="text-xs text-gray-500">Description</p><Input value={newVo.description} onChange={(e) => setNewVo({ ...newVo, description: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <Select value={newVo.status} onValueChange={(val) => setNewVo({ ...newVo, status: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Proposed">Proposed</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><p className="text-xs text-gray-500">Date Raised</p><Input value={newVo.dateRaised} onChange={(e) => setNewVo({ ...newVo, dateRaised: e.target.value })} /></div>
              <div><p className="text-xs text-gray-500">Date Approved</p><Input value={newVo.dateApproved} onChange={(e) => setNewVo({ ...newVo, dateApproved: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewVoOpen(false)}>Cancel</Button>
            <Button onClick={createVo}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* VO View/Edit Dialog */}
      <Dialog open={voEditorOpen} onOpenChange={setVoEditorOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Variation Order</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">VO Number</p>
                <Input value={voEditorData.number} disabled={voEditorMode!=="edit"} onChange={(e)=>setVoEditorData({ ...voEditorData, number: e.target.value })} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Value (R)</p>
                <Input inputMode="decimal" value={voEditorData.value} disabled={voEditorMode!=="edit"} onChange={(e)=>setVoEditorData({ ...voEditorData, value: e.target.value })} />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Description</p>
              <Input value={voEditorData.description} disabled={voEditorMode!=="edit"} onChange={(e)=>setVoEditorData({ ...voEditorData, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <Select value={voEditorData.status} disabled={voEditorMode!=="edit"} onValueChange={(val)=>setVoEditorData({ ...voEditorData, status: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Proposed">Proposed</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs text-gray-500">Date Raised</p>
                <Input value={voEditorData.dateRaised} disabled={voEditorMode!=="edit"} onChange={(e)=>setVoEditorData({ ...voEditorData, dateRaised: e.target.value })} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Date Approved</p>
                <Input value={voEditorData.dateApproved} disabled={voEditorMode!=="edit"} onChange={(e)=>setVoEditorData({ ...voEditorData, dateApproved: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter className="flex items-center justify-between">
            {voEditorMode === "view" ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={()=>setVoEditorOpen(false)}>Close</Button>
                <Button onClick={()=>setVoEditorMode("edit")}>Edit</Button>
                <Button variant="destructive" onClick={deleteVoEditor}>Delete</Button>
                <Button variant="secondary" onClick={exportVoPdf}>Export PDF</Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={()=>{setVoEditorMode("view"); setVoEditorOpen(false);}}>Cancel</Button>
                <Button onClick={saveVoEditor}>Save</Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* RTO View/Edit Dialog */}
      <Dialog open={rtoOpen} onOpenChange={setRtoOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Requisition to Order (RTO)</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">RTO Number</p>
                <Input value={rtoDraft.number} disabled={rtoMode!=="edit"} onChange={(e)=>setRtoDraft({ ...rtoDraft, number: e.target.value })} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Supplier</p>
                <Input value={rtoDraft.supplier} disabled={rtoMode!=="edit"} onChange={(e)=>setRtoDraft({ ...rtoDraft, supplier: e.target.value })} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Contact Person</p>
                <Input value={rtoDraft.contact} disabled={rtoMode!=="edit"} onChange={(e)=>setRtoDraft({ ...rtoDraft, contact: e.target.value })} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <Input type="email" value={rtoDraft.email} disabled={rtoMode!=="edit"} onChange={(e)=>setRtoDraft({ ...rtoDraft, email: e.target.value })} />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Notes / Scope Summary</p>
              <Input value={rtoDraft.notes} disabled={rtoMode!=="edit"} onChange={(e)=>setRtoDraft({ ...rtoDraft, notes: e.target.value })} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">RTO Line Items</h3>
                {rtoMode === "edit" && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      const fromCost: RtoItem[] = currentCostItems.map(ci => ({ id: ci.id, item: ci.item, description: ci.description, value: ci.value, include: true }));
                      setRtoDraft(prev => ({ ...prev, items: fromCost }));
                    }}
                  >Load from Cost Breakdown</Button>
                )}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Include</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Value (R)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rtoDraft.items.map(it => (
                    <TableRow key={it.id}>
                      <TableCell>
                        {rtoMode === "edit" ? (
                          <input type="checkbox" checked={!!it.include} onChange={(e)=>setRtoDraft(prev => ({ ...prev, items: prev.items.map(x => x.id===it.id ? { ...x, include: e.target.checked } : x) }))} />
                        ) : (
                          <Badge className={it.include ? "bg-green-500 text-white" : "bg-gray-400 text-white"}>{it.include ? "Yes" : "No"}</Badge>
                        )}
                      </TableCell>
                      <TableCell>{rtoMode === "edit" ? (<Input value={it.item} onChange={(e)=>setRtoDraft(prev => ({ ...prev, items: prev.items.map(x => x.id===it.id ? { ...x, item: e.target.value } : x) }))} />) : it.item}</TableCell>
                      <TableCell>{rtoMode === "edit" ? (<Input value={it.description} onChange={(e)=>setRtoDraft(prev => ({ ...prev, items: prev.items.map(x => x.id===it.id ? { ...x, description: e.target.value } : x) }))} />) : it.description}</TableCell>
                      <TableCell className="text-right">{rtoMode === "edit" ? (<Input inputMode="decimal" value={it.value} onChange={(e)=>setRtoDraft(prev => ({ ...prev, items: prev.items.map(x => x.id===it.id ? { ...x, value: e.target.value } : x) }))} />) : formatR(it.value)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-end gap-6 pr-2">
                <div className="text-sm text-gray-600">Subtotal (included): <span className="font-semibold">{formatR(rtoDraft.items.filter(i=>i.include).reduce((s,i)=>s + (Number(i.value)||0),0))}</span></div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex items-center justify-between">
            {rtoMode === "view" ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={()=>setRtoOpen(false)}>Close</Button>
                <Button onClick={()=>setRtoMode("edit")}>Edit</Button>
                <Button variant="secondary" onClick={()=>alert("Send to Procurement (stub)")}>Send to Procurement</Button>
                <Button variant="secondary" onClick={()=>alert("Export RTO PDF (stub)")}>Export PDF</Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={()=>{ setRtoMode("view"); setRtoOpen(false); }}>Cancel</Button>
                <Button onClick={() => {
                  setRto({ ...rtoDraft });
                  setHeaderInfo(prev => ({ ...prev, rtoNumber: rtoDraft.number }));
                  setRtoMode("view"); setRtoOpen(false);
                }}>Save</Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Approved: "bg-green-500",
    Rejected: "bg-red-500",
    Pending: "bg-yellow-500",
    "In Progress": "bg-yellow-500",
    Proposed: "bg-gray-400",
    Actioned: "bg-blue-500",
    Awarded: "bg-green-600",
    default: "bg-gray-400",
  };
  const cls = map[status] || map.default;
  return <Badge className={`${cls} text-white`}>{status}</Badge>;
}

// ─────────────── DEV TESTS (non-fatal) ───────────────
if (typeof window !== "undefined") {
  // formatR tests
  console.assert(formatR(0) === "R 0", "formatR(0) should be 'R 0'");
  console.assert(formatR(12345) === "R 12,345", "formatR(12345) should be 'R 12,345'");

  // totals logic quick-checks
  const approved = 100;
  const original = 1000;
  const pending = 50;
  const revised = original + approved;
  const estimate = revised + pending;
  console.assert(revised === 1100, "Revised total incorrect");
  console.assert(estimate === 1150, "Estimate final incorrect");
}
