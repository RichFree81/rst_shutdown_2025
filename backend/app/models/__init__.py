# backend/app/models/__init__.py
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

# Import models so they register on Base.metadata
from .item import Item  # noqa: F401
from app.Domains.users.models import User, Invite, PasswordReset  # noqa: F401
from .chat_session import ChatSession  # noqa: F401
from .chat_message import ChatMessage  # noqa: F401
from app.Domains.turnarounds.cost_models import (  # noqa: F401
    WorkPackageCost,
    CostBreakdownItem,
    VariationOrder,
    RequisitionToOrder,
    RtoSelectedItem,
)
