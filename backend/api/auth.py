from fastapi import APIRouter, Depends, HTTPException, status  # type: ignore
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm  # type: ignore
from sqlalchemy.orm import Session  # type: ignore
from .. import models, schemas  # type: ignore
from ..database import get_db  # type: ignore
from jose import jwt, JWTError
from ..core.security import verify_password, get_password_hash, create_access_token, SECRET_KEY, ALGORITHM  # type: ignore
from passlib.context import CryptContext  # type: ignore

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid auth credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid auth credentials")
    
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = models.User(username=user.username, hashed_password=hashed_password, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Audit Log
    log = models.AuditLog(user_id=new_user.id, action="REGISTER", target_id=new_user.id, target_type="USER", details="New user registration")
    db.add(log)
    db.commit()
    
    return new_user

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        if user:
            # Audit log for failed attempt
            log = models.AuditLog(
                user_id=user.id,
                action="UNAUTHORIZED_ACCESS",
                details=f"Failed login attempt for user: {user.username}"
            )
            db.add(log)
            db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_approved and user.role != "Admin":
         # Audit log for unapproved access attempt
         log = models.AuditLog(
             user_id=user.id,
             action="UNAUTHORIZED_ACCESS",
             details=f"Unapproved login attempt for user: {user.username}"
         )
         db.add(log)
         db.commit()
         raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account pending approval by administrator",
        )
    
    access_token = create_access_token(data={"sub": user.username, "role": user.role})
    
    # Audit Log
    log = models.AuditLog(user_id=user.id, action="LOGIN", target_id=user.id, target_type="USER", details="User Login")
    db.add(log)
    db.commit()
    
    return {"access_token": access_token, "token_type": "bearer", "role": user.role, "user_id": user.id, "username": user.username}

@router.get("/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user
