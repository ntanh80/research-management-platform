from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, UniqueConstraint
from app.core.database import Base


class PublicationIndex(Base):
    __tablename__ = "publication_indexes"
    __table_args__ = (UniqueConstraint("publication_id", "index_type"),)

    id = Column(Integer, primary_key=True, autoincrement=True)
    publication_id = Column(Integer, ForeignKey("publications.id", ondelete="CASCADE"), nullable=False)
    index_type = Column(String(50), nullable=False)
    quartile = Column(String(5), nullable=True)
    impact_factor = Column(Float, nullable=True)
    indexed_at = Column(DateTime, nullable=True)
