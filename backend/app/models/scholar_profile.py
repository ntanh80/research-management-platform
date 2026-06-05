from sqlalchemy import Column, Integer, String, DateTime, Text
from app.models.base import BaseModel


class ScholarProfile(BaseModel):
    __tablename__ = "scholar_profiles"

    person_type = Column(String(20), nullable=False)
    person_id = Column(Integer, nullable=False)
    orcid = Column(String(20), unique=True, nullable=True)
    openalex_id = Column(String(50), nullable=True)
    scopus_id = Column(String(20), nullable=True)
    scholar_url = Column(String(500), nullable=True)
    scholar_id = Column(String(50), nullable=True)
    display_name = Column(String(255), nullable=True)
    affiliation = Column(String(500), nullable=True)
    total_citations = Column(Integer, nullable=True)
    h_index = Column(Integer, nullable=True)
    i10_index = Column(Integer, nullable=True)
    data_source = Column(String(50), nullable=True)
    last_sync_at = Column(DateTime, nullable=True)
    sync_status = Column(String(20), default="never")
