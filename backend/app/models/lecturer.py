from sqlalchemy import Column, Integer, String, Text, ForeignKey
from app.models.base import BaseModel


class Lecturer(BaseModel):
    __tablename__ = "lecturers"

    code = Column(String(20), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    academic_title = Column(String(50), nullable=True)
    degree = Column(String(50), nullable=True)
    position = Column(String(100), nullable=True)
    email = Column(String(255), unique=True, nullable=True)
    phone = Column(String(20), nullable=True)
    organization = Column(String(255), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    specialization = Column(Text, nullable=True)
    research_interests = Column(Text, nullable=True)
    scholar_url = Column(String(500), nullable=True)
    scholar_id = Column(String(50), nullable=True)
    orcid = Column(String(20), nullable=True)
    scopus_id = Column(String(20), nullable=True)
    avatar = Column(String(500), nullable=True)
    note = Column(Text, nullable=True)
    status = Column(String(20), default="ACTIVE")
