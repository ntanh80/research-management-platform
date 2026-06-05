import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base, get_db
from app.main import app
from app.core.security import hash_password

SQLALCHEMY_DATABASE_URL = "sqlite:///./data/test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def admin_headers(client):
    """Create admin user, login, return auth headers."""
    from app.models.user import User
    from app.models.role import Role
    from app.models.user_role import UserRole

    db = TestingSessionLocal()
    # Create admin role with permissions
    role = Role(code="system_admin", name="System Admin", status="ACTIVE")
    db.add(role)
    db.flush()

    user = User(
        username="admin",
        email="admin@test.com",
        hashed_password=hash_password("Admin@123"),
        full_name="Admin",
        is_active=True,
        is_superuser=True,
    )
    db.add(user)
    db.flush()

    ur = UserRole(user_id=user.id, role_id=role.id)
    db.add(ur)
    db.commit()
    db.close()

    response = client.post("/api/v1/auth/login", json={"username": "admin", "password": "Admin@123"})
    token = response.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}
