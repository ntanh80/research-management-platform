"""Initialize default permissions and assign all to System Admin."""
import sys
sys.path.insert(0, ".")
from app.core.database import SessionLocal
from app.models.permission import Permission
from app.models.role import Role
from app.models.role_permission import RolePermission
from app.modules.permissions.permissions import PERMISSIONS_CATALOG

db = SessionLocal()

# Create permissions
for module, actions in PERMISSIONS_CATALOG.items():
    for action in actions:
        code = f"{module}.{action}"
        name = f"{action.capitalize()} {module}"
        existing = db.query(Permission).filter(Permission.code == code).first()
        if not existing:
            perm = Permission(code=code, name=name, module=module, action=action)
            db.add(perm)
            print(f"Created permission: {code}")

db.commit()

# Assign all permissions to System Admin
admin_role = db.query(Role).filter(Role.code == "system_admin").first()
if admin_role:
    all_permissions = db.query(Permission).all()
    for perm in all_permissions:
        existing_rp = db.query(RolePermission).filter(
            RolePermission.role_id == admin_role.id,
            RolePermission.permission_id == perm.id,
        ).first()
        if not existing_rp:
            rp = RolePermission(role_id=admin_role.id, permission_id=perm.id)
            db.add(rp)
    print(f"Assigned {len(all_permissions)} permissions to System Admin")

db.commit()
db.close()
print("Permissions initialization complete.")
