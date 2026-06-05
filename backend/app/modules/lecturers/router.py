from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.exceptions import NotFoundException, DuplicateException
from app.common.pagination import PaginationParams, create_pagination
from app.common.responses import success_response, paginated_response
from app.common.query_builder import apply_search, apply_sorting, apply_pagination, apply_soft_delete_filter
from app.models.lecturer import Lecturer
from app.models.publication_author import PublicationAuthor
from app.models.student_supervisor import StudentSupervisor
from app.modules.lecturers.service import check_supervisor_eligibility
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date


class LecturerCreate(BaseModel):
    code: str = Field(..., max_length=20); full_name: str = Field(..., max_length=255)
    academic_title: Optional[str] = None; degree: Optional[str] = None
    position: Optional[str] = None; email: Optional[str] = None; phone: Optional[str] = None
    organization: Optional[str] = None; department_id: Optional[int] = None
    specialization: Optional[str] = None; research_interests: Optional[str] = None
    scholar_url: Optional[str] = None; scholar_id: Optional[str] = None
    orcid: Optional[str] = None; scopus_id: Optional[str] = None
    note: Optional[str] = None; status: str = "ACTIVE"

class LecturerUpdate(BaseModel):
    full_name: Optional[str] = None; academic_title: Optional[str] = None
    degree: Optional[str] = None; position: Optional[str] = None; email: Optional[str] = None
    phone: Optional[str] = None; organization: Optional[str] = None; department_id: Optional[int] = None
    specialization: Optional[str] = None; research_interests: Optional[str] = None
    scholar_url: Optional[str] = None; scholar_id: Optional[str] = None
    orcid: Optional[str] = None; scopus_id: Optional[str] = None
    note: Optional[str] = None; status: Optional[str] = None

class LecturerResponse(BaseModel):
    id: int; code: str; full_name: str; academic_title: Optional[str] = None
    degree: Optional[str] = None; position: Optional[str] = None; email: Optional[str] = None
    phone: Optional[str] = None; department_id: Optional[int] = None
    specialization: Optional[str] = None; scholar_url: Optional[str] = None
    orcid: Optional[str] = None; status: str; created_at: Optional[datetime] = None
    class Config: from_attributes = True

router = APIRouter(prefix="/api/v1/lecturers", tags=["Lecturers"])


@router.get("")
async def list_lecturers(
    page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=200),
    keyword: str = Query(None), department_id: int = Query(None),
    status: str = Query(None), sort_by: str = Query("id"), sort_order: str = Query("ASC"),
    db: Session = Depends(get_db),
):
    query = db.query(Lecturer)
    query = apply_soft_delete_filter(query, Lecturer)
    if keyword:
        query = apply_search(query, Lecturer, keyword, ["full_name", "email", "code", "specialization"])
    if department_id: query = query.filter(Lecturer.department_id == department_id)
    if status: query = query.filter(Lecturer.status == status)
    total = query.count()
    pagination = PaginationParams(page, page_size)
    query = apply_sorting(query, Lecturer, sort_by, sort_order)
    query = apply_pagination(query, pagination)
    lecturers = query.all()
    return paginated_response(
        data=[LecturerResponse.model_validate(l).model_dump() for l in lecturers],
        pagination=create_pagination(page, page_size, total),
    )


@router.get("/summary")
async def get_summary(db: Session = Depends(get_db)):
    total = db.query(Lecturer).filter(Lecturer.deleted_at.is_(None)).count()
    active = db.query(Lecturer).filter(Lecturer.deleted_at.is_(None), Lecturer.status == "ACTIVE").count()
    return success_response(data={"total": total, "active": active})


@router.get("/{lecturer_id}")
async def get_lecturer(lecturer_id: int, db: Session = Depends(get_db)):
    lecturer = db.query(Lecturer).filter(Lecturer.id == lecturer_id, Lecturer.deleted_at.is_(None)).first()
    if not lecturer: raise NotFoundException("Lecturer", lecturer_id)
    eligibility = check_supervisor_eligibility(db, lecturer)
    result = LecturerResponse.model_validate(lecturer).model_dump()
    result["is_eligible_supervisor"] = eligibility
    return success_response(data=result)


@router.post("")
async def create(request: LecturerCreate, db: Session = Depends(get_db)):
    existing = db.query(Lecturer).filter(Lecturer.code == request.code, Lecturer.deleted_at.is_(None)).first()
    if existing: raise DuplicateException("Lecturer", "code", request.code)
    lecturer = Lecturer(**request.model_dump()); db.add(lecturer); db.commit(); db.refresh(lecturer)
    return success_response(data=LecturerResponse.model_validate(lecturer).model_dump(), message="Lecturer created")


@router.put("/{lecturer_id}")
async def update(lecturer_id: int, request: LecturerUpdate, db: Session = Depends(get_db)):
    lecturer = db.query(Lecturer).filter(Lecturer.id == lecturer_id, Lecturer.deleted_at.is_(None)).first()
    if not lecturer: raise NotFoundException("Lecturer", lecturer_id)
    for k, v in request.model_dump(exclude_unset=True).items():
        if v is not None: setattr(lecturer, k, v)
    db.commit(); db.refresh(lecturer)
    return success_response(data=LecturerResponse.model_validate(lecturer).model_dump(), message="Lecturer updated")


@router.delete("/{lecturer_id}")
async def delete(lecturer_id: int, db: Session = Depends(get_db)):
    lecturer = db.query(Lecturer).filter(Lecturer.id == lecturer_id, Lecturer.deleted_at.is_(None)).first()
    if not lecturer: raise NotFoundException("Lecturer", lecturer_id)
    lecturer.soft_delete(); db.commit()
    return success_response(message="Lecturer deleted")


@router.get("/{lecturer_id}/publications")
async def get_publications(lecturer_id: int, db: Session = Depends(get_db)):
    pubs = db.query(PublicationAuthor).filter(PublicationAuthor.lecturer_id == lecturer_id).all()
    return success_response(data=[{"publication_id": p.publication_id, "author_order": p.author_order} for p in pubs])


@router.get("/{lecturer_id}/students")
async def get_students(lecturer_id: int, db: Session = Depends(get_db)):
    sups = db.query(StudentSupervisor).filter(StudentSupervisor.lecturer_id == lecturer_id, StudentSupervisor.deleted_at.is_(None)).all()
    return success_response(data=[{"phd_student_id": s.phd_student_id, "role": s.role} for s in sups])


@router.get("/{lecturer_id}/graph")
async def get_graph(lecturer_id: int, db: Session = Depends(get_db)):
    return success_response(data={"nodes": [], "edges": [], "message": "Graph data will be available in Sprint 3"})
