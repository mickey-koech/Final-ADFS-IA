from fastapi import APIRouter, Depends  # type: ignore
from sqlalchemy.orm import Session  # type: ignore
from sqlalchemy import func  # type: ignore
from .. import models  # type: ignore
from ..database import get_db  # type: ignore
from .auth import get_current_user  # type: ignore
from datetime import datetime

router = APIRouter()

@router.get("/")
def get_analytics(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """
    Analytics endpoint — aggregates system-wide statistics.

    Logic flow:
    - Queries all files, folders, users and audit logs from Supabase PostgreSQL.
    - Uses dictionary-based multidimensional grouping to compute type breakdown.
    - Builds monthly upload timeline by parsing audit log timestamps.
    - Returns flat structure optimised for frontend Recharts consumption.

    Precondition:  Authenticated user with valid JWT.
    Postcondition: JSON body with total_files, total_folders, total_users,
                   total_size_kb, files_by_type[], files_by_month[], recent_actions[].
    """
    # Security: Admins see everything, Teachers see only their data
    if current_user.role == "Admin":
        files   = db.query(models.File).all()
        folders = db.query(models.Folder).all()
        users   = db.query(models.User).all()
        uploads = db.query(models.AuditLog).filter(models.AuditLog.action == "UPLOAD").order_by(models.AuditLog.timestamp.asc()).all()
        recent  = db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).limit(10).all()
    else:
        # Teacher: Filter by current_user.id
        folders = db.query(models.Folder).filter(models.Folder.owner_id == current_user.id).all()
        folder_ids = [f.id for f in folders]
        files   = db.query(models.File).filter(models.File.folder_id.in_(folder_ids)).all()
        users   = [current_user] # Teachers only see themselves
        uploads = (
            db.query(models.AuditLog)
            .filter(models.AuditLog.user_id == current_user.id, models.AuditLog.action == "UPLOAD")
            .order_by(models.AuditLog.timestamp.asc())
            .all()
        )
        recent = (
            db.query(models.AuditLog)
            .filter(models.AuditLog.user_id == current_user.id)
            .order_by(models.AuditLog.timestamp.desc())
            .limit(10)
            .all()
        )

    # --- Basic KPIs ---
    total_files   = len(files)
    total_folders = len(folders)
    total_users   = len(users)
    total_size_kb = round(sum(f.size for f in files), 2)

    # --- Multidimensional grouping: files by type (hash map) ---
    type_map = {}
    for f in files:
        key = (f.type or "unknown").split("/")[-1].upper()
        type_map[key] = type_map.get(key, 0) + 1
    files_by_type = [{"name": k, "value": v} for k, v in type_map.items()]

    # --- Monthly upload timeline from audit logs ---
    month_map = {}
    for u in uploads:
        key = u.timestamp.strftime("%b %Y") if u.timestamp else "Unknown"
        month_map[key] = month_map.get(key, 0) + 1
    files_by_month = [{"month": k, "count": v} for k, v in month_map.items()]

    # --- Recent audit actions ---
    recent_actions = [
        {
            "action": r.action,
            "target_type": r.target_type,
            "target_id": r.target_id,
            "timestamp": r.timestamp.isoformat() if r.timestamp else None,
        }
        for r in recent
    ]

    return {
        "total_files": total_files,
        "total_folders": total_folders,
        "total_users": total_users,
        "total_size_kb": total_size_kb,
        "files_by_type": files_by_type,
        "files_by_month": files_by_month,
        "upload_activity": files_by_month,
        "recent_actions": recent_actions,
    }
