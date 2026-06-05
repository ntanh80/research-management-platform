from datetime import datetime, timezone
from sqlalchemy import Column, Integer, DateTime, func
from app.core.database import Base as CoreBase


class TimestampMixin:
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)


class SoftDeleteMixin:
    deleted_at = Column(DateTime, nullable=True)

    def soft_delete(self):
        self.deleted_at = datetime.now(timezone.utc)

    def restore(self):
        self.deleted_at = None

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None


class BaseModel(CoreBase, TimestampMixin, SoftDeleteMixin):
    __abstract__ = True
    id = Column(Integer, primary_key=True, autoincrement=True)
