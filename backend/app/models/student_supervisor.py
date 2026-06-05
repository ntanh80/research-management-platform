from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey
from app.models.base import BaseModel


class StudentSupervisor(BaseModel):
    __tablename__ = "student_supervisors"

    phd_student_id = Column(Integer, ForeignKey("phd_students.id"), nullable=False, index=True)
    lecturer_id = Column(Integer, ForeignKey("lecturers.id"), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # CHINH / PHU
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    status = Column(String(20), default="ACTIVE")
    note = Column(Text, nullable=True)
