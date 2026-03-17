import os
from dotenv import load_dotenv  # type: ignore
from sqlalchemy import create_engine  # type: ignore
from sqlalchemy.orm import declarative_base  # type: ignore
from sqlalchemy.orm import sessionmaker  # type: ignore
import redis  # type: ignore

load_dotenv() # Load variables from .env file

# Connect to Supabase PostgreSQL database
# Get this from your Supabase Dashboard: Project Settings -> Database -> Connection string -> URI
# Format: postgresql://[user]:[password]@[host]:5432/[db]
# Example: "postgresql://postgres.xxxxxx:your-password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

SQLALCHEMY_DATABASE_URL = os.getenv("SUPABASE_DB_URL", "sqlite:///./adfs.db") 

# If using sqlite (local fallback), we need check_same_thread. If Postgres (Supabase), we don't.
connect_args = {"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Redis Configuration for Caching
try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
except Exception as e:
    redis_client = None
    print(f"Warning: Redis not connected. {e}")
