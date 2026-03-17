import sys
import os

# Add the parent directory to the path so we can import backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import SessionLocal, engine
from backend import models
from backend.core.security import get_password_hash

def seed():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    users = [
        {"username": "admin", "password": "password123", "role": "Admin"},
        {"username": "teacher", "password": "password123", "role": "Teacher"},
        {"username": "registrar", "password": "password123", "role": "Registrar"},
    ]
    
    for user_data in users:
        db_user = db.query(models.User).filter(models.User.username == user_data["username"]).first()
        if not db_user:
            print(f"Creating user: {user_data['username']}")
            new_user = models.User(
                username=user_data["username"],
                hashed_password=get_password_hash(user_data["password"]),
                role=user_data["role"]
            )
            db.add(new_user)
        else:
            print(f"User {user_data['username']} already exists.")
            
    db.commit()
    db.close()
    print("Seeding complete.")

if __name__ == "__main__":
    seed()
