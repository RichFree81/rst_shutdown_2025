from __future__ import annotations
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.Domains.turnarounds.cost_models import (
    WorkPackageCost,
    VariationOrder,
    VariationOrderStatus,
)
from app.Domains.turnarounds.cost_schemas import (
    CostHeaderRead,
    CostHeaderUpdate,
    ContractSummaryRead,
    ContractSummaryUpdate,
)

router = APIRouter(tags=["turnarounds: cost"])


# ---------- Utilities ----------
def _ensure_cost_row(db: Session, wp_id: str) -> WorkPackageCost:
    cost: Optional[WorkPackageCost] = (
        db.query(WorkPackageCost).filter(WorkPackageCost.work_package_id == wp_id).first()
    )
    if cost is None:
        cost = WorkPackageCost(work_package_id=wp_id)
        db.add(cost)
        db.commit()
        db.refresh(cost)
    return cost


def _to_header_read(cost: WorkPackageCost) -> CostHeaderRead:
    return CostHeaderRead(
        rto_number=cost.rto_number,
        po_number=cost.po_number,
        status=cost.status,
        locked=cost.locked,
    )


def _compute_summary(db: Session, cost: WorkPackageCost) -> ContractSummaryRead:
    original = Decimal(cost.original_contract_price or 0)
    allowances = Decimal(cost.allowances or 0)

    approved_sum = (
        db.query(func.coalesce(func.sum(VariationOrder.value_amount), 0))
        .filter(
            VariationOrder.work_package_cost_id == cost.id,
            VariationOrder.status == VariationOrderStatus.APPROVED,
        )
        .scalar()
    )
    pending_sum = (
        db.query(func.coalesce(func.sum(VariationOrder.value_amount), 0))
        .filter(
            VariationOrder.work_package_cost_id == cost.id,
            VariationOrder.status.in_(
                [
                    VariationOrderStatus.PROPOSED,
                    VariationOrderStatus.PENDING,
                    VariationOrderStatus.IN_PROGRESS,
                ]
            ),
        )
        .scalar()
    )

    approved = Decimal(approved_sum or 0)
    pending = Decimal(pending_sum or 0)
    revised = original + approved
    efc = revised + pending

    return ContractSummaryRead(
        original_contract_price=original,
        allowances=allowances,
        approved_variations=approved,
        pending_variations=pending,
        revised_contract_price=revised,
        estimate_final_contract_price=efc,
    )


# ---------- Header ----------
@router.get("/work-packages/{wp_id}/cost/header", response_model=CostHeaderRead)
def get_cost_header(wp_id: str, db: Session = Depends(get_db)):
    cost = _ensure_cost_row(db, wp_id)
    return _to_header_read(cost)


@router.put("/work-packages/{wp_id}/cost/header", response_model=CostHeaderRead)
def update_cost_header(wp_id: str, payload: CostHeaderUpdate, db: Session = Depends(get_db)):
    cost = _ensure_cost_row(db, wp_id)

    # Lock enforcement
    if cost.locked:
        # Allow only unlocking
        if payload.locked is False:
            cost.locked = False
        else:
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail="Cost header is locked. Unlock before editing.",
            )
    else:
        if payload.locked is True:
            cost.locked = True
        if payload.rto_number is not None:
            cost.rto_number = payload.rto_number
        if payload.po_number is not None:
            cost.po_number = payload.po_number
        if payload.status is not None:
            cost.status = payload.status

    db.add(cost)
    db.commit()
    db.refresh(cost)
    return _to_header_read(cost)


# ---------- Contract Summary ----------
@router.get("/work-packages/{wp_id}/cost/summary", response_model=ContractSummaryRead)
def get_contract_summary(wp_id: str, db: Session = Depends(get_db)):
    cost = _ensure_cost_row(db, wp_id)
    return _compute_summary(db, cost)


@router.put("/work-packages/{wp_id}/cost/summary", response_model=ContractSummaryRead)
def update_contract_summary(wp_id: str, payload: ContractSummaryUpdate, db: Session = Depends(get_db)):
    cost = _ensure_cost_row(db, wp_id)

    if cost.locked:
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail="Cost summary is locked. Unlock header before editing.",
        )

    if payload.original_contract_price is not None:
        cost.original_contract_price = payload.original_contract_price
    if payload.allowances is not None:
        cost.allowances = payload.allowances

    db.add(cost)
    db.commit()
    db.refresh(cost)
    return _compute_summary(db, cost)
