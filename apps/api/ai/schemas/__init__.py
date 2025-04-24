"""
Pydantic schemas for AI function parameters.
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict

class Issue(BaseModel):
    issue_id: str = Field(..., description="Unique identifier for the issue")
    status: str = Field(..., description="Current status of the issue")
    severity: int = Field(..., description="Severity level of the issue")
    description: Optional[str] = Field(None, description="Detailed description of the issue")
    location: Dict[str, float] = Field(..., description="Geographical location {'latitude':..., 'longitude':...}")

class Maintained(BaseModel):
    issue_id: str = Field(..., description="Unique identifier for the issue to be marked as maintained")
    maintainedAt: str = Field(..., description="Timestamp when maintenance occurred")

__all__ = ["Issue", "Maintained"]