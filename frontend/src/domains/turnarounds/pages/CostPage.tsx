import { useEffect, useState } from "react";
import { getCostHeader, getContractSummary, updateCostHeader, updateContractSummary } from "../api";

interface Props { wpId: string; data?: { id: string; title: string } }

export default function CostPage({ wpId, data }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [header, setHeader] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [poNumber, setPoNumber] = useState("");
  const [rtoNumber, setRtoNumber] = useState("");
  const [status, setStatus] = useState<string>("");
  // Local UI-only state inspired by the concept mock (no backend yet)
  const [costItems, setCostItems] = useState<Array<{ id: string; item: string; description: string; value: number | string }>>([]);
  const [voItems, setVoItems] = useState<Array<{ id: string; number: string; description: string; value: number | string; status: string; dateRaised?: string; dateApproved?: string }>>([]);
  const wpName = (() => {
    const t = data?.title || "";
    // Match Overview logic exactly: remove leading "WP-XXX: " style prefix
    return t.replace(/^\w+-\d+\:\s*/, "");
  })();

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [h, s] = await Promise.all([
        getCostHeader(wpId),
        getContractSummary(wpId),
      ]);
      setHeader(h);
      setSummary(s);
      setPoNumber(h?.po_number ?? "");
      setRtoNumber(h?.rto_number ?? "");
      setStatus(h?.status ?? "");
    } catch (e: any) {
      setError(e?.message || "Failed to load cost data");
    } finally {
      setLoading(false);
    }
  };

  // Helpers for concept sections
  const addCostItem = () => {
    if (header?.locked) return;
    setCostItems(prev => ([...prev, { id: `c-${Math.random().toString(36).slice(2)}`, item: "", description: "", value: 0 }]));
  };
  const removeCostItem = (id: string) => {
    if (header?.locked) return;
    setCostItems(prev => prev.filter(r => r.id !== id));
  };
  const updateCostItem = (id: string, patch: Partial<{ item: string; description: string; value: number | string }>) => {
    if (header?.locked) return;
    setCostItems(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));
  };
  const setVoField = (id: string, patch: Partial<{ number: string; description: string; value: number | string; status: string; dateRaised?: string; dateApproved?: string }>) => {
    if (header?.locked) return;
    setVoItems(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));
  };
  const addVo = () => {
    if (header?.locked) return;
    setVoItems(prev => ([...prev, { id: `v-${Math.random().toString(36).slice(2)}`, number: "", description: "", value: 0, status: "Proposed", dateRaised: "", dateApproved: "" }]));
  };
  const removeVo = (id: string) => {
    if (header?.locked) return;
    setVoItems(prev => prev.filter(v => v.id !== id));
  };
  const formatR = (n: number | string) => `R ${Number(n || 0).toLocaleString("en-ZA")}`;

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [wpId]);

  const onSaveHeader = async () => {
    try {
      setError(null);
      const updated = await updateCostHeader(wpId, { po_number: poNumber, rto_number: rtoNumber, status });
      setHeader(updated);
    } catch (e: any) {
      setError(e?.message || "Failed to save header");
    }
  };

  const onToggleLock = async () => {
    try {
      setError(null);
      const updated = await updateCostHeader(wpId, { locked: !header?.locked });
      setHeader(updated);
    } catch (e: any) {
      setError(e?.message || "Failed to toggle lock");
    }
  };

  const onSaveSummary = async () => {
    try {
      setError(null);
      const updated = await updateContractSummary(wpId, {
        original_contract_price: summary?.original_contract_price,
        allowances: summary?.allowances,
      });
      setSummary(updated);
    } catch (e: any) {
      setError(e?.message || "Failed to save summary");
    }
  };

  if (loading) return <div className="p-4 text-sm text-text-secondary">Loading cost data…</div>;
  if (error) return <div className="p-4 text-sm text-red-700">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="text-brand-navy flex items-start justify-between gap-4">
          <div className="leading-tight">
            <div className="text-sm font-semibold uppercase tracking-wide">{data?.id || wpId}</div>
            <div className="text-lg font-semibold uppercase tracking-wide">{wpName || "Work Package"}</div>
          </div>
          <div className="flex items-center gap-2">
            {header?.locked && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-border-subtle bg-gray-50 text-gray-700">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                  <path d="M12 2a5 5 0 00-5 5v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm-3 8V7a3 3 0 016 0v3H9z"/>
                </svg>
                Locked
              </span>
            )}
            <div className="relative inline-flex items-center group">
              <button
                type="button"
                role="switch"
                aria-checked={!!header?.locked}
                aria-label={header?.locked ? 'Unlock Package Cost' : 'Lock Package Cost'}
                onClick={onToggleLock}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${header?.locked ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${header?.locked ? 'translate-x-5' : 'translate-x-1'}`}
                />
              </button>
              <div className="pointer-events-none absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <div className="rounded-md border border-border-subtle bg-white text-[11px] text-gray-800 px-2 py-1 shadow-md">
                  {header?.locked ? 'Unlock Package Cost' : 'Lock Package Cost'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header Information */}
      <div className="bg-white p-5 rounded-2xl border border-border-subtle shadow-sm space-y-4">
        <div className="text-base font-semibold text-brand-navy">Header Information</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-text-secondary mb-1">PO Number</div>
            <input className="w-full border rounded px-2 py-1 text-sm" value={poNumber} onChange={e => setPoNumber(e.target.value)} disabled={header?.locked} />
          </div>
          <div>
            <div className="text-sm text-text-secondary mb-1">RTO Number</div>
            <input className="w-full border rounded px-2 py-1 text-sm" value={rtoNumber} onChange={e => setRtoNumber(e.target.value)} disabled={header?.locked} />
          </div>
          <div>
            <div className="text-sm text-text-secondary mb-1">Status</div>
            <input className="w-full border rounded px-2 py-1 text-sm" value={status} onChange={e => setStatus(e.target.value)} disabled={header?.locked} />
          </div>
        </div>
        <div>
          <button type="button" className="px-3 py-1.5 text-sm rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50" onClick={onSaveHeader} disabled={header?.locked}>
            Save Header
          </button>
        </div>
      </div>

      {/* Contract Summary */}
      <div className="bg-white p-5 rounded-2xl border border-border-subtle shadow-sm space-y-4">
        <div className="text-base font-semibold text-brand-navy">Contract Summary</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-text-secondary mb-1">Original Contract Price (R)</div>
            <input type="number" step="0.01" className="w-full border rounded px-2 py-1 text-sm" value={summary?.original_contract_price ?? 0}
              onChange={e => setSummary((s: any) => ({ ...s, original_contract_price: parseFloat(e.target.value) }))} disabled={header?.locked} />
          </div>
          <div>
            <div className="text-sm text-text-secondary mb-1">Allowances (R)</div>
            <input type="number" step="0.01" className="w-full border rounded px-2 py-1 text-sm" value={summary?.allowances ?? 0}
              onChange={e => setSummary((s: any) => ({ ...s, allowances: parseFloat(e.target.value) }))} disabled={header?.locked} />
          </div>
          <div>
            <div className="text-sm text-text-secondary mb-1">Approved Variations (R)</div>
            <input className="w-full border rounded px-2 py-1 text-sm bg-gray-50" value={summary?.approved_variations ?? 0} disabled />
          </div>
          <div>
            <div className="text-sm text-text-secondary mb-1">Pending Variations (R)</div>
            <input className="w-full border rounded px-2 py-1 text-sm bg-gray-50" value={summary?.pending_variations ?? 0} disabled />
          </div>
          <div>
            <div className="text-sm text-text-secondary mb-1">Revised Contract Price (R)</div>
            <input className="w-full border rounded px-2 py-1 text-sm bg-gray-50" value={summary?.revised_contract_price ?? 0} disabled />
          </div>
          <div>
            <div className="text-sm text-text-secondary mb-1">Estimate Final Contract Price (R)</div>
            <input className="w-full border rounded px-2 py-1 text-sm bg-gray-50" value={summary?.estimate_final_contract_price ?? 0} disabled />
          </div>
        </div>
        <div>
          <button type="button" className="px-3 py-1.5 text-sm rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50" onClick={onSaveSummary} disabled={header?.locked}>
            Save Summary
          </button>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white p-5 rounded-2xl border border-border-subtle shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold text-brand-navy">Cost Breakdown</div>
          {!header?.locked && (
            <button type="button" className="px-3 py-1.5 text-sm rounded border" onClick={addCostItem}>Add Cost Item</button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-text-secondary">
                <th className="py-2 pr-3">Item</th>
                <th className="py-2 pr-3">Description</th>
                <th className="py-2 pr-3 text-right">Value (R)</th>
                {!header?.locked && <th className="py-2 pr-3 w-20 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {costItems.length === 0 ? (
                <tr>
                  <td colSpan={header?.locked ? 3 : 4} className="py-4 text-center text-text-secondary">No cost items yet.</td>
                </tr>
              ) : (
                costItems.map(row => (
                  <tr key={row.id} className="border-t border-border-subtle">
                    <td className="py-2 pr-3 align-top">
                      <input className="w-full border rounded px-2 py-1 text-sm" value={row.item} onChange={e => updateCostItem(row.id, { item: e.target.value })} disabled={header?.locked} />
                    </td>
                    <td className="py-2 pr-3 align-top">
                      <input className="w-full border rounded px-2 py-1 text-sm" value={row.description} onChange={e => updateCostItem(row.id, { description: e.target.value })} disabled={header?.locked} />
                    </td>
                    <td className="py-2 pr-3 align-top text-right">
                      {header?.locked ? (
                        <span>{formatR(row.value)}</span>
                      ) : (
                        <input className="w-full border rounded px-2 py-1 text-sm text-right" inputMode="decimal" value={row.value} onChange={e => updateCostItem(row.id, { value: e.target.value })} />
                      )}
                    </td>
                    {!header?.locked && (
                      <td className="py-2 pr-3 align-top text-right">
                        <button type="button" className="px-2 py-1 text-sm rounded border" title="Delete" onClick={() => removeCostItem(row.id)}>Delete</button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Variation Orders */}
      <div className="bg-white p-5 rounded-2xl border border-border-subtle shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold text-brand-navy">Variation Orders</div>
          {!header?.locked && (
            <button type="button" className="px-3 py-1.5 text-sm rounded border" onClick={addVo}>Add New…</button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-text-secondary">
                <th className="py-2 pr-3">VO No</th>
                <th className="py-2 pr-3">Description</th>
                <th className="py-2 pr-3 text-right">Value (R)</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Date Raised</th>
                <th className="py-2 pr-3">Date Approved</th>
                {!header?.locked && <th className="py-2 pr-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {voItems.length === 0 ? (
                <tr>
                  <td colSpan={header?.locked ? 6 : 7} className="py-4 text-center text-text-secondary">No variation orders yet.</td>
                </tr>
              ) : (
                voItems.map(vo => (
                  <tr key={vo.id} className="border-t border-border-subtle">
                    <td className="py-2 pr-3">
                      <input className="w-full border rounded px-2 py-1 text-sm" value={vo.number} onChange={e => setVoField(vo.id, { number: e.target.value })} disabled={header?.locked} />
                    </td>
                    <td className="py-2 pr-3">
                      <input className="w-full border rounded px-2 py-1 text-sm" value={vo.description} onChange={e => setVoField(vo.id, { description: e.target.value })} disabled={header?.locked} />
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {header?.locked ? (
                        <span>{formatR(vo.value)}</span>
                      ) : (
                        <input className="w-full border rounded px-2 py-1 text-sm text-right" inputMode="decimal" value={vo.value} onChange={e => setVoField(vo.id, { value: e.target.value })} />
                      )}
                    </td>
                    <td className="py-2 pr-3">
                      <select className="w-full border rounded px-2 py-1 text-sm" value={vo.status} onChange={e => setVoField(vo.id, { status: e.target.value })} disabled={header?.locked}>
                        <option value="Proposed">Proposed</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                      </select>
                    </td>
                    <td className="py-2 pr-3">
                      <input className="w-full border rounded px-2 py-1 text-sm" value={vo.dateRaised || ""} onChange={e => setVoField(vo.id, { dateRaised: e.target.value })} disabled={header?.locked} />
                    </td>
                    <td className="py-2 pr-3">
                      <input className="w-full border rounded px-2 py-1 text-sm" value={vo.dateApproved || ""} onChange={e => setVoField(vo.id, { dateApproved: e.target.value })} disabled={header?.locked} />
                    </td>
                    {!header?.locked && (
                      <td className="py-2 pr-3 text-right">
                        <button type="button" className="px-2 py-1 text-sm rounded border" title="Delete" onClick={() => removeVo(vo.id)}>Delete</button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
