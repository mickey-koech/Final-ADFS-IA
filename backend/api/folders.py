from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks  # type: ignore
from sqlalchemy.orm import Session  # type: ignore
from typing import List
from .. import models, schemas  # type: ignore
from ..database import get_db, redis_client  # type: ignore
from .auth import get_current_user  # type: ignore
from ..utils.algorithms import get_all_subfolders_recursive  # type: ignore
import json

router = APIRouter()

@router.post("/", response_model=schemas.Folder)
def create_folder(folder: schemas.FolderCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Check parent exists if provided
    if folder.parent_id:
        parent = db.query(models.Folder).filter(models.Folder.id == folder.parent_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent folder not found")
        
    new_folder = models.Folder(name=folder.name, parent_id=folder.parent_id, owner_id=current_user.id)
    db.add(new_folder)
    db.commit()
    db.refresh(new_folder)
    
    # Audit log
    db.add(models.AuditLog(user_id=current_user.id, action="CREATE", target_id=new_folder.id, target_type="FOLDER"))
    db.commit()
    
    # Invalidate cache if exists
    if redis_client:
        redis_client.delete(f"folders_user_{current_user.id}")
        
    return new_folder

@router.get("/")
def get_folders(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """
    Get all folders for a user.
    Demonstrates Redis caching for fast retrieval.
    """
    cache_key = f"folders_user_{current_user.id}"
    if redis_client:
        cached = redis_client.get(cache_key)
        if cached:
            return json.loads(cached)
            
    folders = db.query(models.Folder).filter(models.Folder.owner_id == current_user.id).all()
    # Serialize manually for quick cache
    result = [{"id": f.id, "name": f.name, "parent_id": f.parent_id} for f in folders]
    
    if redis_client:
        redis_client.setex(cache_key, 300, json.dumps(result)) # 5 min cache
        
    return result

@router.get("/{folder_id}/descendants")
def get_folder_descendants(folder_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """
    Demonstrates IB HL Recursive Algorithm: get_all_subfolders_recursive
    """
    # Fetch all folders and build a parent map
    all_folders = db.query(models.Folder).filter(models.Folder.owner_id == current_user.id).all()
    folder_map = {}
    for f in all_folders:
        if f.parent_id not in folder_map:
            folder_map[f.parent_id] = []
        folder_map[f.parent_id].append(f)
        
    descendants = get_all_subfolders_recursive(folder_id, folder_map)
    return [{"id": d.id, "name": d.name} for d in descendants]

@router.delete("/{folder_id}")
def delete_folder(folder_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    folder = db.query(models.Folder).filter(models.Folder.id == folder_id, models.Folder.owner_id == current_user.id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
        
    # Simplified delete for now (without cascading children)
    db.delete(folder)
    db.add(models.AuditLog(user_id=current_user.id, action="DELETE", target_id=folder_id, target_type="FOLDER"))
    db.commit()
    
    if redis_client:
        redis_client.delete(f"folders_user_{current_user.id}")
        
    return {"message": "Folder deleted"}
