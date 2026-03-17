from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime
from ..database import get_db
from .. import models, schemas
from .auth import get_current_user

router = APIRouter()

def check_admin(user: models.User = Depends(get_current_user)):
    if user.role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return user

# --- Department Management ---
@router.post("/departments/", response_model=schemas.Department)
def create_department(dept: schemas.DepartmentCreate, db: Session = Depends(get_db), _admin: models.User = Depends(check_admin)):
    db_dept = models.Department(name=dept.name)
    db.add(db_dept)
    db.commit()
    db.refresh(db_dept)
    return db_dept

@router.get("/departments/", response_model=List[schemas.Department])
def list_departments(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    return db.query(models.Department).all()

# --- User Management & Approvals ---
@router.get("/users/pending", response_model=List[schemas.User])
def get_pending_users(db: Session = Depends(get_db), _admin: models.User = Depends(check_admin)):
    return db.query(models.User).filter(models.User.is_approved == False).all()

@router.post("/users/{user_id}/approve")
def approve_user(user_id: int, department_id: Optional[int] = None, db: Session = Depends(get_db), _admin: models.User = Depends(check_admin)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_approved = True
    user.approved_at = datetime.datetime.utcnow()
    if department_id:
        user.department_id = department_id
        
    db.commit()
    
    # Audit log
    log = models.AuditLog(
        user_id=_admin.id,
        action="APPROVE_USER",
        target_id=user_id,
        target_type="USER",
        details=f"Approved user {user.username} with department {department_id}"
    )
    db.add(log)
    db.commit()
    
    return {"message": f"User {user.username} approved"}

# --- Anomaly Alerts ---
@router.get("/alerts/", response_model=List[schemas.AnomalyAlert])
def get_anomaly_alerts(db: Session = Depends(get_db), _admin: models.User = Depends(check_admin)):
    return db.query(models.AnomalyAlert).filter(models.AnomalyAlert.resolved == False).order_by(models.AnomalyAlert.created_at.desc()).all()

@router.post("/alerts/{alert_id}/resolve")
def resolve_alert(alert_id: int, db: Session = Depends(get_db), _admin: models.User = Depends(check_admin)):
    alert = db.query(models.AnomalyAlert).filter(models.AnomalyAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.resolved = True
    db.commit()
    return {"message": "Alert resolved"}
