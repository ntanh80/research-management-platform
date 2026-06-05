from sqlalchemy import Column, Integer, String, Text
from app.models.base import BaseModel


class Role(BaseModel):
    __tablename__ = "roles"

    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(20), default="ACTIVE")
