from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, func
from app.core.database import Base


class PublicationAuthor(Base):
    __tablename__ = "publication_authors"

    id = Column(Integer, primary_key=True, autoincrement=True)
    publication_id = Column(Integer, ForeignKey("publications.id", ondelete="CASCADE"), nullable=False)
    author_type = Column(String(20), nullable=False)
    lecturer_id = Column(Integer, ForeignKey("lecturers.id"), nullable=True)
    phd_student_id = Column(Integer, ForeignKey("phd_students.id"), nullable=True)
    external_author_id = Column(Integer, ForeignKey("external_authors.id"), nullable=True)
    author_order = Column(Integer, nullable=True)
    is_first_author = Column(Boolean, default=False)
    is_corresponding_author = Column(Boolean, default=False)
    contribution_rate = Column(Float, nullable=True)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
