from sqlalchemy import Column, Integer, String, Text
from app.models.base import BaseModel


class ExternalAuthor(BaseModel):
    __tablename__ = "external_authors"

    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    organization = Column(String(255), nullable=True)
    orcid = Column(String(20), nullable=True)
    scholar_url = Column(String(500), nullable=True)
    scholar_id = Column(String(50), nullable=True)
    note = Column(Text, nullable=True)
