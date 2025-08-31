import { apiFetch } from "@/app/api/client";

// Cost Header
export async function getCostHeader(wpId: string) {
  return apiFetch(`/api/v1/turnarounds/work-packages/${wpId}/cost/header`);
}

export async function updateCostHeader(
  wpId: string,
  body: Partial<{ rto_number: string; po_number: string; status: string; locked: boolean }>
) {
  return apiFetch(`/api/v1/turnarounds/work-packages/${wpId}/cost/header`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

// Contract Summary
export async function getContractSummary(wpId: string) {
  return apiFetch(`/api/v1/turnarounds/work-packages/${wpId}/cost/summary`);
}

export async function updateContractSummary(
  wpId: string,
  body: Partial<{ original_contract_price: number; allowances: number }>
) {
  return apiFetch(`/api/v1/turnarounds/work-packages/${wpId}/cost/summary`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}
