"""Run all initialization steps and start dev server."""
import subprocess
import sys
import os

os.chdir(os.path.join(os.path.dirname(__file__), ".."))

steps = [
    (["alembic", "upgrade", "head"], "Running database migrations..."),
    (["python", "scripts/init_roles.py"], "Initializing roles..."),
    (["python", "scripts/init_permissions.py"], "Initializing permissions..."),
    (["python", "scripts/create_admin.py"], "Creating admin user..."),
    (["python", "scripts/seed_data.py"], "Seeding sample data..."),
]

for cmd, msg in steps:
    print(f"\n{'='*60}")
    print(msg)
    print("=" * 60)
    result = subprocess.run(cmd, capture_output=True, text=True)
    print(result.stdout)
    if result.returncode != 0:
        print(f"ERROR: {result.stderr}")
        sys.exit(1)

print("\n" + "=" * 60)
print("Setup complete! Starting server at http://localhost:8000")
print("Swagger docs: http://localhost:8000/api/v1/docs")
print("Admin login: admin / Admin@123")
print("=" * 60)

subprocess.run(["uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"])
