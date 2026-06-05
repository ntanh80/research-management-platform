from sqlalchemy.orm import Session
from app.models.lecturer import Lecturer
from app.models.publication_author import PublicationAuthor
from app.models.publication import Publication
from app.common.date_utils import years_ago


def check_supervisor_eligibility(db: Session, lecturer: Lecturer) -> dict:
    reasons = []
    is_eligible = True

    # (a) Có học vị Tiến sĩ trở lên
    if not lecturer.degree or "tiến sĩ" not in lecturer.degree.lower():
        is_eligible = False
        reasons.append("Requires PhD degree or higher")

    # (b) Có ≥ 2 bài ISI/Scopus trong 5 năm gần nhất
    five_years_ago = years_ago(5)
    recent_pubs = (
        db.query(Publication)
        .join(PublicationAuthor, PublicationAuthor.publication_id == Publication.id)
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
        reasons.append(f"Requires ≥ 2 ISI/Scopus publications in last 5 years (has {recent_pubs})")

    return {"is_eligible": is_eligible, "reasons": reasons, "recent_isi_scopus_count": recent_pubs}
