import os
import sys


sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import tempfile

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.models import Base
from app.routers.team import get_db


# Use a temporary file-based SQLite database for each test function
@pytest.fixture(scope="function", autouse=True)
def _setup_database():
    with tempfile.NamedTemporaryFile(suffix=".db") as tmp:
        TEST_DATABASE_URL = f"sqlite:///{tmp.name}"
        engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
        TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

        def override_get_db():
            db = TestingSessionLocal()
            try:
                yield db
            finally:
                db.close()

        app.dependency_overrides = {}
        app.dependency_overrides[get_db] = override_get_db
        yield
        # Tables and file are cleaned up automatically
