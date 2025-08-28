from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID, uuid4
from datetime import date
from enum import Enum

class WorkPackageStatus(str, Enum):
    NOT_STARTED = "Not Started"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    ON_HOLD = "On Hold"

class Discipline(str, Enum):
    MECHANICAL = "Mechanical"
    ELECTRICAL = "Electrical"
    INSTRUMENTATION = "Instrumentation"
    CIVIL = "Civil"

class WorkPackage(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    title: str
    description: Optional[str] = None
    status: WorkPackageStatus = WorkPackageStatus.NOT_STARTED
    discipline: Discipline
    start_date: Optional[date] = None
    end_date: Optional[date] = None

    class Config:
        use_enum_values = True
