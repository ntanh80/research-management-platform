"""Manual database backup."""
import os
import shutil
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "qlncs.db")
BACKUP_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "backups")

if not os.path.exists(DB_PATH):
    print(f"Database not found at {DB_PATH}")
    exit(1)

os.makedirs(BACKUP_DIR, exist_ok=True)
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup_path = os.path.join(BACKUP_DIR, f"qlncs_{timestamp}.db")
shutil.copy2(DB_PATH, backup_path)
print(f"Backup created: {backup_path}")
