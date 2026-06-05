"""Seed sample data for development."""
import sys
sys.path.insert(0, ".")
from datetime import date
from app.core.database import SessionLocal
from app.models.department import Department
from app.models.lecturer import Lecturer
from app.models.phd_student import PhdStudent

db = SessionLocal()

# Create departments
depts_data = [
    {"code": "KHMT", "name": "Khoa học Máy tính"},
    {"code": "HTTT", "name": "Hệ thống Thông tin"},
    {"code": "KTPM", "name": "Kỹ thuật Phần mềm"},
    {"code": "MMTT", "name": "Mạng máy tính và Truyền thông"},
    {"code": "KHDL", "name": "Khoa học Dữ liệu"},
]
depts = {}
for d in depts_data:
    existing = db.query(Department).filter(Department.code == d["code"]).first()
    if not existing:
        dept = Department(**d); db.add(dept); db.flush()
        depts[d["code"]] = dept
        print(f"Created department: {d['code']}")
    else:
        depts[d["code"]] = existing

# Create lecturers (4 per department, 20 total)
lecturers_data = []
for dept_code, dept in depts.items():
    for i in range(1, 5):
        lecturers_data.append({
            "code": f"GV_{dept_code}_{i:02d}",
            "full_name": f"Nguyễn Văn {chr(64+i)}-{dept_code}",
            "academic_title": "PGS.TS" if i <= 2 else "TS",
            "degree": "Tiến sĩ" if i <= 3 else "Thạc sĩ",
            "email": f"gv{i}.{dept_code.lower()}@rmp.edu.vn",
            "department_id": dept.id,
            "specialization": f"Chuyên ngành {dept.name}",
            "research_interests": "Trí tuệ nhân tạo, Học máy, Khoa học dữ liệu",
        })

for l in lecturers_data:
    existing = db.query(Lecturer).filter(Lecturer.code == l["code"]).first()
    if not existing:
        db.add(Lecturer(**l))
print(f"Created {len(lecturers_data)} lecturers")

# Create PhD students (30 total, mixed cohorts and statuses)
cohorts = [2020, 2021, 2022, 2023, 2024, 2025]
statuses = ["STUDYING"] * 15 + ["DEFENDED"] * 5 + ["LEAVE"] * 3 + ["EXTENDED"] * 4 + ["DROPPED"] * 3
majors = ["Khoa học Máy tính", "Hệ thống Thông tin", "Kỹ thuật Phần mềm", "Mạng máy tính", "Khoa học Dữ liệu"]
for i in range(30):
    code = f"NCS{i+1:04d}"
    existing = db.query(PhdStudent).filter(PhdStudent.code == code).first()
    if not existing:
        db.add(PhdStudent(
            code=code,
            full_name=f"Nghiên cứu sinh {i+1}",
            cohort=cohorts[i % len(cohorts)],
            major=majors[i % len(majors)],
            major_code=f"62{majors[i % len(majors)][:4].upper()}",
            status=statuses[i],
            gender="Nam" if i % 2 == 0 else "Nữ",
            email=f"ncs{i+1}@rmp.edu.vn",
        ))
print(f"Created 30 PhD students")

db.commit()
db.close()
print("Seed data creation complete.")
