from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, func
from app.core.database import Base


class ScholarSyncLog(Base):
    __tablename__ = "scholar_sync_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    scholar_profile_id = Column(Integer, ForeignKey("scholar_profiles.id"), nullable=False)
    data_source = Column(String(50), nullable=True)
    sync_time = Column(DateTime, nullable=False)
    status = Column(String(20), nullable=True)
    message = Column(Text, nullable=True)
    total_publications_found = Column(Integer, default=0)
    total_publications_imported = Column(Integer, default=0)
    total_skipped = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
