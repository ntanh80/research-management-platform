from sqlalchemy import Column, Integer, String
from app.models.base import BaseModel


class Permission(BaseModel):
    __tablename__ = "permissions"

    code = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    module = Column(String(50), nullable=False)
    action = Column(String(20), nullable=False)
