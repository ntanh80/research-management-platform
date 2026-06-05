FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN mkdir -p data/backups data/uploads data/imports data/exports data/temp

EXPOSE 8000

CMD ["sh", "-c", "alembic upgrade head && python scripts/init_roles.py && python scripts/init_permissions.py && python scripts/create_admin.py && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
