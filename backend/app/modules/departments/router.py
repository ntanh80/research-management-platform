from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.exceptions import NotFoundException, DuplicateException
from app.common.pagination import PaginationParams, create_pagination
from app.common.responses import success_response, paginated_response
from app.models.department import Department
from app.models.lecturer import Lecturer
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# Schemas
class DepartmentCreate(BaseModel):
    code: str = Field(..., min_length=1, max_length=20)
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    head_lecturer_id: Optional[int] = None
    status: str = "ACTIVE"


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    head_lecturer_id: Optional[int] = None
    status: Optional[str] = None


class DepartmentResponse(BaseModel):
    id: int; code: str; name: str; description: Optional[str] = None
    head_lecturer_id: Optional[int] = None; status: str
    created_at: Optional[datetime] = None
    class Config: from_attributes = True


router = APIRouter(prefix="/api/v1/departments", tags=["Departments"])


@router.get("")
async def list_departments(
    page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=200),
    keyword: str = Query(None), status: str = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Department).filter(Department.deleted_at.is_(None))
    if keyword:
        query = query.filter(Department.name.ilike(f"%{keyword}%"))
    if status:
        query = query.filter(Department.status == status)
    total = query.count()
    pagination = PaginationParams(page, page_size)
    depts = query.order_by(Department.id.asc()).offset(pagination.offset).limit(pagination.limit).all()
    return paginated_response(
        data=[DepartmentResponse.model_validate(d).model_dump() for d in depts],
        pagination=create_pagination(page, page_size, total),
    )


@router.get("/{dept_id}")
async def get_department(dept_id: int, db: Session = Depends(get_db)):
    dept = db.query(Department).filter(Department.id == dept_id, Department.deleted_at.is_(None)).first()
    if not dept: raise NotFoundException("Department", dept_id)
    return success_response(data=DepartmentResponse.model_validate(dept).model_dump())


@router.post("")
async def create(request: DepartmentCreate, db: Session = Depends(get_db)):
    existing = db.query(Department).filter(Department.code == request.code, Department.deleted_at.is_(None)).first()
    if existing: raise DuplicateException("Department", "code", request.code)
    dept = Department(**request.model_dump()); db.add(dept); db.commit(); db.refresh(dept)
    return success_response(data=DepartmentResponse.model_validate(dept).model_dump(), message="Department created")


@router.put("/{dept_id}")
async def update(dept_id: int, request: DepartmentUpdate, db: Session = Depends(get_db)):
    dept = db.query(Department).filter(Department.id == dept_id, Department.deleted_at.is_(None)).first()
    if not dept: raise NotFoundException("Department", dept_id)
    for k, v in request.model_dump(exclude_unset=True).items():
        if v is not None: setattr(dept, k, v)
    db.commit(); db.refresh(dept)
    return success_response(data=DepartmentResponse.model_validate(dept).model_dump(), message="Department updated")


@router.delete("/{dept_id}")
async def delete(dept_id: int, db: Session = Depends(get_db)):
    dept = db.query(Department).filter(Department.id == dept_id, Department.deleted_at.is_(None)).first()
    if not dept: raise NotFoundException("Department", dept_id)
    dept.soft_delete(); db.commit()
    return success_response(message="Department deleted")


@router.get("/{dept_id}/lecturers")
async def get_department_lecturers(dept_id: int, db: Session = Depends(get_db)):
    lecturers = db.query(Lecturer).filter(Lecturer.department_id == dept_id, Lecturer.deleted_at.is_(None)).all()
    return success_response(data=[{"id": l.id, "code": l.code, "full_name": l.full_name} for l in lecturers])
