# SQLAlchemy models for Turnarounds Cost Tab
from __future__ import annotations

from datetime import date, datetime
from enum import Enum
from typing import Optional

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
    Index,
    Numeric,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid

from app.models import Base


# Enums
class WorkPackageCostStatus(str, Enum):
    AWAITING_SCOPING = "Awaiting Scoping"
    AWAITING_TENDER_PACK = "Awaiting Tender Pack"
    AWAITING_BID_SUBMISSIONS = "Awaiting Bid Submissions"
    PENDING_AWARD = "Pending Award"
    AWARDED = "Awarded"


class VariationOrderStatus(str, Enum):
    PROPOSED = "Proposed"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"


# Portable UUID storage: use 36-char string (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
UUIDCol = String(36)


class WorkPackageCost(Base):
    __tablename__ = "work_package_costs"

    id: Mapped[str] = mapped_column(UUIDCol, primary_key=True, default=lambda: str(uuid.uuid4()))
    work_package_id: Mapped[str] = mapped_column(UUIDCol, nullable=False, index=True)

    rto_number: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    po_number: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    status: Mapped[WorkPackageCostStatus] = mapped_column(
        SAEnum(WorkPackageCostStatus, name="work_package_cost_status_enum", native_enum=False),
        default=WorkPackageCostStatus.AWAITING_SCOPING,
        nullable=False,
    )

    original_contract_price: Mapped[float] = mapped_column(Numeric(18, 2), default=0, nullable=False)
    allowances: Mapped[float] = mapped_column(Numeric(18, 2), default=0, nullable=False)

    locked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    breakdown_items: Mapped[list[CostBreakdownItem]] = relationship(
        back_populates="work_package_cost",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    variation_orders: Mapped[list[VariationOrder]] = relationship(
        back_populates="work_package_cost",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    rto: Mapped[Optional[RequisitionToOrder]] = relationship(
        back_populates="work_package_cost",
        cascade="all, delete-orphan",
        uselist=False,
        lazy="selectin",
    )

    __table_args__ = (
        UniqueConstraint("work_package_id", name="uq_costs_wp_id"),
        Index("idx_costs_wp_id", "work_package_id"),
    )


class CostBreakdownItem(Base):
    __tablename__ = "cost_breakdown_items"

    id: Mapped[str] = mapped_column(UUIDCol, primary_key=True, default=lambda: str(uuid.uuid4()))
    work_package_cost_id: Mapped[str] = mapped_column(
        UUIDCol, ForeignKey("work_package_costs.id", ondelete="CASCADE"), nullable=False
    )

    item: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    value_amount: Mapped[float] = mapped_column(Numeric(18, 2), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    work_package_cost: Mapped[WorkPackageCost] = relationship(back_populates="breakdown_items")

    __table_args__ = (
        CheckConstraint("value_amount >= 0", name="ck_breakdown_value_nonneg"),
    )


class VariationOrder(Base):
    __tablename__ = "variation_orders"

    id: Mapped[str] = mapped_column(UUIDCol, primary_key=True, default=lambda: str(uuid.uuid4()))
    work_package_cost_id: Mapped[str] = mapped_column(
        UUIDCol, ForeignKey("work_package_costs.id", ondelete="CASCADE"), nullable=False
    )

    vo_number: Mapped[str] = mapped_column(String(64), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    value_amount: Mapped[float] = mapped_column(Numeric(18, 2), nullable=False)
    status: Mapped[VariationOrderStatus] = mapped_column(
        SAEnum(VariationOrderStatus, name="variation_order_status_enum", native_enum=False),
        default=VariationOrderStatus.PENDING,
        nullable=False,
    )
    date_raised: Mapped[date] = mapped_column(Date, nullable=False)
    date_approved: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    work_package_cost: Mapped[WorkPackageCost] = relationship(back_populates="variation_orders")

    __table_args__ = (
        CheckConstraint("value_amount >= 0", name="ck_vo_value_nonneg"),
    )


class RequisitionToOrder(Base):
    __tablename__ = "requisitions_to_order"

    id: Mapped[str] = mapped_column(UUIDCol, primary_key=True, default=lambda: str(uuid.uuid4()))
    work_package_cost_id: Mapped[str] = mapped_column(
        UUIDCol, ForeignKey("work_package_costs.id", ondelete="CASCADE"), nullable=False, unique=True
    )

    rto_number: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, unique=True)
    supplier: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)
    contact_person: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    subtotal_amount: Mapped[float] = mapped_column(Numeric(18, 2), default=0, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    work_package_cost: Mapped[WorkPackageCost] = relationship(back_populates="rto")
    selected_items: Mapped[list[RtoSelectedItem]] = relationship(
        back_populates="rto", cascade="all, delete-orphan", lazy="selectin"
    )


class RtoSelectedItem(Base):
    __tablename__ = "rto_selected_items"

    id: Mapped[str] = mapped_column(UUIDCol, primary_key=True, default=lambda: str(uuid.uuid4()))
    rto_id: Mapped[str] = mapped_column(UUIDCol, ForeignKey("requisitions_to_order.id", ondelete="CASCADE"), nullable=False)
    breakdown_item_id: Mapped[Optional[str]] = mapped_column(
        UUIDCol, ForeignKey("cost_breakdown_items.id", ondelete="SET NULL"), nullable=True
    )
    included: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    rto: Mapped[RequisitionToOrder] = relationship(back_populates="selected_items")

    __table_args__ = (
        UniqueConstraint("rto_id", "breakdown_item_id", name="uq_rto_breakdown_item"),
    )
