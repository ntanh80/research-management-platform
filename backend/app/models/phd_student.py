from sqlalchemy import Column, Integer, String, Date, Text
from app.models.base import BaseModel


class PhdStudent(BaseModel):
    __tablename__ = "phd_students"

    code = Column(String(20), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(10), nullable=True)
    email = Column(String(255), unique=True, nullable=True)
    phone = Column(String(20), nullable=True)
    organization = Column(String(255), nullable=True)
    major = Column(String(255), nullable=True)
    major_code = Column(String(20), nullable=True)
    cohort = Column(Integer, nullable=True)
    admission_decision_date = Column(Date, nullable=True)
    expected_defense_date = Column(Date, nullable=True)
    status = Column(String(20), default="STUDYING")
    avatar = Column(String(500), nullable=True)
    note = Column(Text, nullable=True)
