from app.models.base import BaseModel
from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission
from app.models.role_permission import RolePermission
from app.models.user_role import UserRole
from app.models.department import Department
from app.models.lecturer import Lecturer
from app.models.phd_student import PhdStudent
from app.models.phd_topic import PhdTopic
from app.models.phd_topic_history import PhdTopicHistory
from app.models.student_supervisor import StudentSupervisor
from app.models.external_author import ExternalAuthor
from app.models.publication import Publication
from app.models.publication_index import PublicationIndex
from app.models.publication_author import PublicationAuthor
from app.models.scholar_profile import ScholarProfile
from app.models.scholar_sync_log import ScholarSyncLog
from app.models.research_project import ResearchProject
from app.models.audit_log import AuditLog

__all__ = [
    "BaseModel",
    "User",
    "Role",
    "Permission",
    "RolePermission",
    "UserRole",
    "Department",
    "Lecturer",
    "PhdStudent",
    "PhdTopic",
    "PhdTopicHistory",
    "StudentSupervisor",
    "ExternalAuthor",
    "Publication",
    "PublicationIndex",
    "PublicationAuthor",
    "ScholarProfile",
    "ScholarSyncLog",
    "ResearchProject",
    "AuditLog",
]
