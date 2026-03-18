from sqlmodel import SQLModel, create_engine, Session
import os
import time
from dotenv import load_dotenv
from sqlalchemy.exc import OperationalError

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/employee_db")

engine = create_engine(DATABASE_URL, echo=True)


def get_session():
    with Session(engine) as session:
        yield session


def create_db_and_tables(max_retries: int = 10, retry_delay: int = 3) -> None:
    """
    Ensure all SQLModel tables are created.

    When running in Docker, the Postgres container may not be ready the
    first time the backend starts. This adds a simple retry loop so that
    table creation does not silently fail and leave the database empty.
    """
    attempt = 0
    while True:
        try:
            SQLModel.metadata.create_all(engine)
            print("Database: all tables ensured successfully.")
            break
        except OperationalError as exc:
            attempt += 1
            if attempt >= max_retries:
                print(f"Database error after {attempt} attempts: {exc}")
                raise
            print(f"Database not ready (attempt {attempt}/{max_retries}), retrying in {retry_delay}s...")
            time.sleep(retry_delay)
