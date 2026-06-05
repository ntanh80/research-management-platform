from sqlalchemy.orm import Session
from app.models.phd_student import PhdStudent
from app.models.publication_author import PublicationAuthor


def get_phd_student_summary(db: Session) -> dict:
    students = db.query(PhdStudent).filter(PhdStudent.deleted_at.is_(None)).all()
    total = len(students)
    studying = sum(1 for s in students if s.status == "STUDYING")
    leave = sum(1 for s in students if s.status == "LEAVE")
    extended = sum(1 for s in students if s.status == "EXTENDED")
    defended = sum(1 for s in students if s.status == "DEFENDED")
    dropped = sum(1 for s in students if s.status == "DROPPED")

    # Count students with publications
    student_ids = [s.id for s in students]
    students_with_pubs = (
        db.query(PublicationAuthor.phd_student_id)
        .filter(PublicationAuthor.phd_student_id.in_(student_ids))
        .distinct()
        .count()
    )
    students_without_pubs = total - students_with_pubs

    return {
        "total": total,
        "studying": studying,
        "leave": leave,
        "extended": extended,
        "defended": defended,
        "dropped": dropped,
        "has_publications": students_with_pubs,
        "no_publications": students_without_pubs,
    }
