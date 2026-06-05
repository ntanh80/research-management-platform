from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.exceptions import (
    NotFoundException,
    DuplicateException,
    BusinessRuleException,
)
from app.common.pagination import PaginationParams, create_pagination
from app.common.responses import success_response, paginated_response
from app.common.query_builder import (
    apply_search,
    apply_sorting,
    apply_pagination,
    apply_soft_delete_filter,
)
from app.models.phd_student import PhdStudent
from app.models.phd_topic import PhdTopic
from app.models.student_supervisor import StudentSupervisor
from app.models.publication_author import PublicationAuthor
from app.models.publication import Publication
from app.models.lecturer import Lecturer
from app.modules.phd_students.summary_service import get_phd_student_summary
from app.modules.phd_students.service import (
    validate_supervisor_limit,
    validate_supervisor_degree,
    validate_supervisor_publications,
    validate_supervisor_capacity,
    validate_status_transition,
    validate_study_duration,
    validate_defense_requirements,
)
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date


# Schemas
class PhDStudentCreate(BaseModel):
    code: str = Field(..., max_length=20); full_name: str = Field(..., max_length=255)
    date_of_birth: Optional[date] = None; gender: Optional[str] = None
    email: Optional[str] = None; phone: Optional[str] = None
    organization: Optional[str] = None; major: Optional[str] = None
    major_code: Optional[str] = None; cohort: Optional[int] = None
    admission_decision_date: Optional[date] = None
    expected_defense_date: Optional[date] = None
    status: str = "STUDYING"; note: Optional[str] = None


class PhDStudentUpdate(BaseModel):
    full_name: Optional[str] = None; date_of_birth: Optional[date] = None
    gender: Optional[str] = None; email: Optional[str] = None
    phone: Optional[str] = None; organization: Optional[str] = None
    major: Optional[str] = None; major_code: Optional[str] = None
    cohort: Optional[int] = None; admission_decision_date: Optional[date] = None
    expected_defense_date: Optional[date] = None
    status: Optional[str] = None; note: Optional[str] = None


class PhDStudentResponse(BaseModel):
    id: int; code: str; full_name: str; date_of_birth: Optional[date] = None
    gender: Optional[str] = None; email: Optional[str] = None; phone: Optional[str] = None
    organization: Optional[str] = None; major: Optional[str] = None
    major_code: Optional[str] = None; cohort: Optional[int] = None
    admission_decision_date: Optional[date] = None
    expected_defense_date: Optional[date] = None
    status: str; note: Optional[str] = None
    created_at: Optional[datetime] = None
    class Config: from_attributes = True


class SupervisorAssignment(BaseModel):
    lecturer_id: int
    role: str = "CHINH"  # CHINH or PHU
    start_date: Optional[date] = None
    note: Optional[str] = None


class PhdTopicCreate(BaseModel):
    topic_title: str = Field(..., max_length=500)
    research_direction: Optional[str] = None
    research_objectives: Optional[str] = None
    research_methods: Optional[str] = None
    approval_date: Optional[date] = None
    note: Optional[str] = None


router = APIRouter(prefix="/api/v1/phd-students", tags=["PhD Students"])


@router.get("")
async def list_phd_students(
    page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=200),
    keyword: str = Query(None), cohort: int = Query(None),
    major: str = Query(None), status: str = Query(None),
    sort_by: str = Query("id"), sort_order: str = Query("ASC"),
    db: Session = Depends(get_db),
):
    query = db.query(PhdStudent)
    query = apply_soft_delete_filter(query, PhdStudent)
    if keyword:
        query = apply_search(query, PhdStudent, keyword, ["full_name", "email", "code", "major"])
    if cohort: query = query.filter(PhdStudent.cohort == cohort)
    if major: query = query.filter(PhdStudent.major.ilike(f"%{major}%"))
    if status: query = query.filter(PhdStudent.status == status)
    total = query.count()
    pagination = PaginationParams(page, page_size)
    query = apply_sorting(query, PhdStudent, sort_by, sort_order)
    query = apply_pagination(query, pagination)
    students = query.all()
    return paginated_response(
        data=[PhDStudentResponse.model_validate(s).model_dump() for s in students],
        pagination=create_pagination(page, page_size, total),
    )


@router.get("/summary")
async def summary(db: Session = Depends(get_db)):
    return success_response(data=get_phd_student_summary(db))


@router.get("/{student_id}")
async def get_phd_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(PhdStudent).filter(PhdStudent.id == student_id, PhdStudent.deleted_at.is_(None)).first()
    if not student: raise NotFoundException("PhD Student", student_id)
    result = PhDStudentResponse.model_validate(student).model_dump()
    # Add topic info
    topic = db.query(PhdTopic).filter(PhdTopic.phd_student_id == student_id, PhdTopic.deleted_at.is_(None)).first()
    result["topic"] = {"topic_title": topic.topic_title, "status": topic.status} if topic else None
    return success_response(data=result)


@router.post("")
async def create(request: PhDStudentCreate, db: Session = Depends(get_db)):
    existing = db.query(PhdStudent).filter(PhdStudent.code == request.code, PhdStudent.deleted_at.is_(None)).first()
    if existing: raise DuplicateException("PhD Student", "code", request.code)
    student = PhdStudent(**request.model_dump()); db.add(student); db.commit(); db.refresh(student)
    return success_response(data=PhDStudentResponse.model_validate(student).model_dump(), message="PhD Student created")


@router.put("/{student_id}")
async def update(student_id: int, request: PhDStudentUpdate, db: Session = Depends(get_db)):
    student = db.query(PhdStudent).filter(PhdStudent.id == student_id, PhdStudent.deleted_at.is_(None)).first()
    if not student: raise NotFoundException("PhD Student", student_id)
    update_data = request.model_dump(exclude_unset=True)
    # Validate status transition
    if "status" in update_data and update_data["status"] != student.status:
        validate_status_transition(student.status, update_data["status"])
        validate_study_duration(student, update_data["status"])
        if update_data["status"] == "DEFENDED":
            validate_defense_requirements(db, student_id)
    for k, v in update_data.items():
        if v is not None: setattr(student, k, v)
    db.commit(); db.refresh(student)
    return success_response(data=PhDStudentResponse.model_validate(student).model_dump(), message="PhD Student updated")


@router.delete("/{student_id}")
async def delete(student_id: int, db: Session = Depends(get_db)):
    student = db.query(PhdStudent).filter(PhdStudent.id == student_id, PhdStudent.deleted_at.is_(None)).first()
    if not student: raise NotFoundException("PhD Student", student_id)
    student.soft_delete(); db.commit()
    return success_response(message="PhD Student deleted")


@router.get("/{student_id}/topic")
async def get_topic(student_id: int, db: Session = Depends(get_db)):
    topic = db.query(PhdTopic).filter(PhdTopic.phd_student_id == student_id, PhdTopic.deleted_at.is_(None)).first()
    return success_response(data={"topic_title": topic.topic_title, "status": topic.status} if topic else None)


@router.get("/{student_id}/publications")
async def get_publications(student_id: int, db: Session = Depends(get_db)):
    pubs = db.query(Publication).join(PublicationAuthor, PublicationAuthor.publication_id == Publication.id).filter(
        PublicationAuthor.phd_student_id == student_id, Publication.deleted_at.is_(None)
    ).all()
    return success_response(data=[{"id": p.id, "title": p.title, "year": p.publication_year, "index": p.index_type} for p in pubs])


@router.get("/{student_id}/supervisors")
async def get_supervisors(student_id: int, db: Session = Depends(get_db)):
    sups = db.query(StudentSupervisor).filter(
        StudentSupervisor.phd_student_id == student_id, StudentSupervisor.deleted_at.is_(None)
    ).all()
    result = []
    for s in sups:
        lecturer = db.query(Lecturer).filter(Lecturer.id == s.lecturer_id).first()
        result.append({"id": s.id, "lecturer_id": s.lecturer_id, "lecturer_name": lecturer.full_name if lecturer else None, "role": s.role, "status": s.status})
    return success_response(data=result)


@router.post("/{student_id}/supervisors")
async def assign_supervisor(student_id: int, request: SupervisorAssignment, db: Session = Depends(get_db)):
    student = db.query(PhdStudent).filter(PhdStudent.id == student_id, PhdStudent.deleted_at.is_(None)).first()
    if not student: raise NotFoundException("PhD Student", student_id)
    # Apply business rules
    validate_supervisor_limit(db, student_id)
    validate_supervisor_degree(db, request.lecturer_id, request.role)
    validate_supervisor_publications(db, request.lecturer_id)
    validate_supervisor_capacity(db, request.lecturer_id)
    supervisor = StudentSupervisor(phd_student_id=student_id, lecturer_id=request.lecturer_id, role=request.role, start_date=request.start_date, note=request.note)
    db.add(supervisor); db.commit(); db.refresh(supervisor)
    return success_response(data={"id": supervisor.id, "role": supervisor.role}, message="Supervisor assigned")


@router.get("/{student_id}/graph")
async def get_graph(student_id: int, db: Session = Depends(get_db)):
    return success_response(data={"nodes": [], "edges": [], "message": "Graph data will be available in Sprint 3"})
