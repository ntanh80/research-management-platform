from sqlalchemy import Column, Integer, String, Date, Text, DateTime, ForeignKey, func
from app.core.database import Base


class PhdTopicHistory(Base):
    __tablename__ = "phd_topic_histories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    phd_student_id = Column(Integer, ForeignKey("phd_students.id"), nullable=False)
    old_topic_title = Column(String(500), nullable=True)
    new_topic_title = Column(String(500), nullable=True)
    changed_date = Column(Date, nullable=True)
    reason = Column(Text, nullable=True)
    attachment_file = Column(String(500), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
