from sqlalchemy import Column, Integer, String, Float, Text
from app.models.base import BaseModel


class Publication(BaseModel):
    __tablename__ = "publications"

    title = Column(Text, nullable=False)
    publication_year = Column(Integer, nullable=True)
    publication_type = Column(String(50), nullable=True)
    journal_or_conference_name = Column(String(500), nullable=True)
    publisher = Column(String(255), nullable=True)
    doi = Column(String(255), unique=True, nullable=True)
    issn = Column(String(20), nullable=True)
    isbn = Column(String(20), nullable=True)
    url = Column(String(500), nullable=True)
    volume = Column(String(20), nullable=True)
    issue = Column(String(20), nullable=True)
    pages = Column(String(50), nullable=True)
    index_type = Column(String(50), nullable=True)
    quartile = Column(String(5), nullable=True)
    score = Column(Float, nullable=True)
    evidence_file = Column(String(500), nullable=True)
    note = Column(Text, nullable=True)
