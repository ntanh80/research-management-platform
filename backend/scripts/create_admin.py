"""Create default admin user."""
import sys
sys.path.insert(0, ".")
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User
from app.models.role import Role
from app.models.user_role import UserRole

db = SessionLocal()

existing = db.query(User).filter(User.username == "admin").first()
if existing:
    print("Admin user already exists.")
else:
    admin = User(
        username="admin",
        email="admin@rmp.edu.vn",
        hashed_password=hash_password("Admin@123"),
        full_name="System Administrator",
        is_active=True,
        is_superuser=True,
    )
    db.add(admin)
    db.flush()

    admin_role = db.query(Role).filter(Role.code == "system_admin").first()
    if admin_role:
        ur = UserRole(user_id=admin.id, role_id=admin_role.id)
        db.add(ur)
        print(f"Created admin user (username: admin, password: Admin@123) with System Admin role")
    else:
        print("Created admin user but System Admin role not found. Run init_roles.py first.")

db.commit()
db.close()
