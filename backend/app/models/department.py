from sqlalchemy import Column, Integer, String, Text, ForeignKey
from app.models.base import BaseModel


class Department(BaseModel):
    __tablename__ = "departments"

    code = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    head_lecturer_id = Column(Integer, ForeignKey("lecturers.id"), nullable=True)
    status = Column(String(20), default="ACTIVE")
