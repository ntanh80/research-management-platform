"""Initialize default roles in the system."""
import sys
sys.path.insert(0, ".")
from app.core.database import SessionLocal
from app.models.role import Role

ROLES = [
    {"code": "system_admin", "name": "System Admin", "description": "Full system access"},
    {"code": "dean", "name": "Dean", "description": "Faculty dean"},
    {"code": "vice_dean", "name": "Vice Dean", "description": "Vice dean"},
    {"code": "dept_head", "name": "Department Head", "description": "Department head"},
    {"code": "lecturer", "name": "Lecturer", "description": "Lecturer"},
    {"code": "supervisor", "name": "Supervisor", "description": "PhD supervisor"},
    {"code": "academic_staff", "name": "Academic Staff", "description": "Academic affairs staff"},
    {"code": "viewer", "name": "Viewer", "description": "Read-only access"},
]

db = SessionLocal()
for role_data in ROLES:
    existing = db.query(Role).filter(Role.code == role_data["code"]).first()
    if not existing:
        role = Role(**role_data)
        db.add(role)
        print(f"Created role: {role_data['code']}")
    else:
        print(f"Role already exists: {role_data['code']}")
db.commit()
db.close()
print("Roles initialization complete.")
