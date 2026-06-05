from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class RoleCreate(BaseModel):
    code: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    status: str = "ACTIVE"


class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class RoleResponse(BaseModel):
    id: int
    code: str
    name: str
    description: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RoleDetailResponse(RoleResponse):
    permissions: List[dict] = []


class AssignPermissionsRequest(BaseModel):
    permission_ids: List[int]
