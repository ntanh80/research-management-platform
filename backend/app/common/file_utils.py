import os
import shutil
from pathlib import Path
from typing import Optional
from fastapi import UploadFile
from app.core.config import settings

ALLOWED_EXTENSIONS = {"pdf", "docx", "xlsx", "csv", "png", "jpg", "jpeg"}
MAX_FILE_SIZE = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


def validate_file(file: UploadFile) -> tuple:
    if file.size and file.size > MAX_FILE_SIZE:
        return False, f"File size exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit"
    ext = file.filename.split(".")[-1].lower() if file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        return False, f"File type .{ext} not allowed"
    return True, None


def save_upload(file: UploadFile, sub_dir: str = "") -> str:
    Path(settings.UPLOAD_DIR, sub_dir).mkdir(parents=True, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, sub_dir, file.filename)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return file_path


def delete_file(file_path: str) -> bool:
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
    except OSError:
        pass
    return False


def get_file_path(sub_dir: str, filename: str) -> str:
    return os.path.join(settings.UPLOAD_DIR, sub_dir, filename)
