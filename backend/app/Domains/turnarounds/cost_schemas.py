from __future__ import annotations
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field
from app.Domains.turnarounds.cost_models import WorkPackageCostStatus, VariationOrderStatus  # noqa: F401


# ---------- Header ----------
class CostHeaderRead(BaseModel):
    rto_number: Optional[str] = None
    po_number: Optional[str] = None
    status: WorkPackageCostStatus
    locked: bool


class CostHeaderUpdate(BaseModel):
    rto_number: Optional[str] = None
    po_number: Optional[str] = None
    status: Optional[WorkPackageCostStatus] = None
    locked: Optional[bool] = None


# ---------- Contract Summary ----------
class ContractSummaryRead(BaseModel):
    original_contract_price: Decimal = Field(..., ge=0)
    allowances: Decimal = Field(..., ge=0)
    approved_variations: Decimal = Field(..., ge=0)
    pending_variations: Decimal = Field(..., ge=0)
    revised_contract_price: Decimal = Field(..., ge=0)
    estimate_final_contract_price: Decimal = Field(..., ge=0)


class ContractSummaryUpdate(BaseModel):
    original_contract_price: Optional[Decimal] = Field(None, ge=0)
    allowances: Optional[Decimal] = Field(None, ge=0)
