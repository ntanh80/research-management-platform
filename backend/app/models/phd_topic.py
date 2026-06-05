from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey
from app.models.base import BaseModel


class PhdTopic(BaseModel):
    __tablename__ = "phd_topics"

    phd_student_id = Column(Integer, ForeignKey("phd_students.id"), nullable=False, index=True)
    topic_title = Column(String(500), nullable=False)
    research_direction = Column(Text, nullable=True)
    research_objectives = Column(Text, nullable=True)
    research_methods = Column(Text, nullable=True)
    approval_date = Column(Date, nullable=True)
    adjustment_date = Column(Date, nullable=True)
    status = Column(String(20), nullable=True)
    attachment_file = Column(String(500), nullable=True)
    note = Column(Text, nullable=True)
