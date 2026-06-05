from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from app.models.base import BaseModel


class ResearchProject(BaseModel):
    __tablename__ = "research_projects"

    code = Column(String(50), unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    project_level = Column(String(50), nullable=True)
    project_type = Column(String(50), nullable=True)
    research_field = Column(String(255), nullable=True)
    principal_investigator_id = Column(Integer, ForeignKey("lecturers.id"), nullable=True)
    host_organization = Column(String(255), nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    total_budget = Column(Float, nullable=True)
    funding_source = Column(String(255), nullable=True)
    status = Column(String(20), default="PROPOSED")
    acceptance_result = Column(String(50), nullable=True)
    acceptance_grade = Column(String(20), nullable=True)
