from sqlalchemy.orm import Session
from datetime import date, timedelta
from app.models.phd_student import PhdStudent
from app.models.lecturer import Lecturer
from app.models.student_supervisor import StudentSupervisor
from app.models.publication_author import PublicationAuthor
from app.models.publication import Publication
from app.core.constants import (
    PhdStudentStatus,
    SupervisorRole,
    VALID_TRANSITIONS,
)
from app.core.exceptions import BusinessRuleException, NotFoundException, ValidationException
from app.common.date_utils import years_ago


# R1.1: NCS có tối đa 2 GVHD (1 chính + 1 phụ)
def validate_supervisor_limit(db: Session, phd_student_id: int) -> None:
    supervisors = (
        db.query(StudentSupervisor)
        .filter(
            StudentSupervisor.phd_student_id == phd_student_id,
            StudentSupervisor.deleted_at.is_(None),
            StudentSupervisor.status == "ACTIVE",
        )
        .all()
    )
    if len(supervisors) >= 2:
        raise BusinessRuleException(
            "PhD student can have at most 2 supervisors (1 main + 1 co-supervisor)"
        )


# R1.2: GVHD chính phải có học vị ≥ Tiến sĩ
def validate_supervisor_degree(db: Session, lecturer_id: int, role: str) -> None:
    if role != SupervisorRole.CHINH.value:
        return
    lecturer = (
        db.query(Lecturer)
        .filter(Lecturer.id == lecturer_id, Lecturer.deleted_at.is_(None))
        .first()
    )
    if not lecturer:
        raise NotFoundException("Lecturer", lecturer_id)
    if not lecturer.degree or "tiến sĩ" not in lecturer.degree.lower():
        raise BusinessRuleException(
            f"Main supervisor must have a PhD degree or higher. "
            f"Lecturer {lecturer.full_name} has degree: {lecturer.degree or 'N/A'}"
        )


# R1.3: GVHD phải có ≥ 2 bài ISI/Scopus trong 5 năm gần nhất
def validate_supervisor_publications(
    db: Session, lecturer_id: int
) -> None:
    five_years_ago = years_ago(5)
    count = (
        db.query(Publication)
        .join(
            PublicationAuthor,
            PublicationAuthor.publication_id == Publication.id,
        )
        .filter(
            PublicationAuthor.lecturer_id == lecturer_id,
            Publication.publication_year >= five_years_ago.year,
            Publication.index_type.in_(["ISI", "SCIE", "SCOPUS"]),
            Publication.deleted_at.is_(None),
        )
        .count()
    )
    if count < 2:
        raise BusinessRuleException(
            f"Supervisor must have ≥ 2 ISI/Scopus publications in the last 5 years. "
            f"This lecturer has {count}."
        )


# R1.4: 1 GV hướng dẫn tối đa 5 NCS cùng lúc
def validate_supervisor_capacity(db: Session, lecturer_id: int) -> None:
    active_count = (
        db.query(StudentSupervisor)
        .join(PhdStudent, PhdStudent.id == StudentSupervisor.phd_student_id)
        .filter(
            StudentSupervisor.lecturer_id == lecturer_id,
            StudentSupervisor.deleted_at.is_(None),
            StudentSupervisor.status == "ACTIVE",
            PhdStudent.status.in_(
                [
                    PhdStudentStatus.STUDYING.value,
                    PhdStudentStatus.LEAVE.value,
                    PhdStudentStatus.EXTENDED.value,
                ]
            ),
            PhdStudent.deleted_at.is_(None),
        )
        .count()
    )
    if active_count >= 5:
        raise BusinessRuleException(
            "A lecturer can supervise at most 5 PhD students at the same time"
        )


# R1.6: Validate status transition
def validate_status_transition(
    current_status: str, new_status: str
) -> None:
    if current_status == new_status:
        return
    current = PhdStudentStatus(current_status)
    new = PhdStudentStatus(new_status)
    allowed = VALID_TRANSITIONS.get(current, [])
    if new not in allowed:
        raise BusinessRuleException(
            f"Cannot transition from '{current_status}' to '{new_status}'. "
            f"Allowed transitions: {[s.value for s in allowed]}"
        )


# R1.7: Max 4 years + 2 extensions × 1 year
def validate_study_duration(
    phd_student: PhdStudent, new_status: str
) -> None:
    if new_status != PhdStudentStatus.EXTENDED.value:
        return
    if not phd_student.admission_decision_date:
        return
    today = date.today()
    years_studying = (today - phd_student.admission_decision_date).days / 365.0
    max_years = 6.0  # 4 years + 2 extensions × 1 year
    if years_studying > max_years:
        raise BusinessRuleException(
            f"Study duration exceeded maximum of 6 years ({years_studying:.1f} years elapsed)"
        )


# R1.5: NCS cần ≥ 2 công trình để bảo vệ (≥ 1 ISI/Scopus)
def validate_defense_requirements(
    db: Session, phd_student_id: int
) -> None:
    pubs = (
        db.query(Publication)
        .join(
            PublicationAuthor,
            PublicationAuthor.publication_id == Publication.id,
        )
        .filter(
            PublicationAuthor.phd_student_id == phd_student_id,
            Publication.deleted_at.is_(None),
        )
        .all()
    )
    if len(pubs) < 2:
        raise BusinessRuleException(
            f"PhD student needs at least 2 publications to defend (has {len(pubs)})"
        )
    isi_scopus_count = sum(
        1 for p in pubs if p.index_type in ["ISI", "SCIE", "SCOPUS"]
    )
    if isi_scopus_count < 1:
        raise BusinessRuleException(
            "At least 1 ISI/Scopus publication required to defend"
        )


# R4.1: Check full supervisor eligibility
def check_supervisor_eligibility(db: Session, lecturer: Lecturer) -> dict:
    reasons = []
    is_eligible = True

    if not lecturer.degree or "tiến sĩ" not in lecturer.degree.lower():
        is_eligible = False
        reasons.append("Requires PhD degree or higher")

    five_years_ago = years_ago(5)
    recent_pubs = (
        db.query(Publication)
        .join(
            PublicationAuthor,
            PublicationAuthor.publication_id == Publication.id,
        )
        .filter(
            PublicationAuthor.lecturer_id == lecturer.id,
            Publication.publication_year >= five_years_ago.year,
            Publication.index_type.in_(["ISI", "SCIE", "SCOPUS"]),
            Publication.deleted_at.is_(None),
        )
        .count()
    )
    if recent_pubs < 2:
        is_eligible = False
        reasons.append(
            f"Requires ≥ 2 ISI/Scopus publications in last 5 years (has {recent_pubs})"
        )

    return {
        "is_eligible": is_eligible,
        "reasons": reasons,
        "recent_isi_scopus_count": recent_pubs,
    }
