"""Restore database from backup."""
import os
import shutil
import sys

if len(sys.argv) < 2:
    print("Usage: python restore_db.py <backup_file>")
    exit(1)

backup_file = sys.argv[1]
DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "qlncs.db")

if not os.path.exists(backup_file):
    print(f"Backup file not found: {backup_file}")
    exit(1)

shutil.copy2(backup_file, DB_PATH)
print(f"Database restored from: {backup_file}")
