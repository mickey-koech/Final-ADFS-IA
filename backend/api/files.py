from fastapi import APIRouter, Depends, HTTPException, UploadFile, File as FastAPIFile, Form  # type: ignore
from sqlalchemy.orm import Session  # type: ignore
from .. import models, schemas  # type: ignore
from ..database import get_db, redis_client  # type: ignore
from .auth import get_current_user  # type: ignore
from ..data_structures.queue import UploadQueue  # type: ignore
from ..data_structures.stack import ActionStack  # type: ignore
from ..data_structures.linked_list import FileVersionList  # type: ignore
from ..data_structures.hash_table import TagHashTable  # type: ignore
from ..utils.algorithms import binary_search_files  # type: ignore
import os
import shutil
import uuid

router = APIRouter()

# Global IB HL Data Structures initialized
upload_queue = UploadQueue() 
undo_stack = ActionStack(capacity=50)
tag_index = TagHashTable(size=200)

UPLOAD_DIR = "./uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# --- Background Task Processor ---
def process_upload_queue(db: Session):
    """Processes items in the FIFO queue."""
    while not upload_queue.is_empty():
        task = upload_queue.dequeue()
        # In a real async environment, we'd save the file to disk/S3 here
        # For this prototype, saving is synchronous to simplify the demo,
        # but the queue validates the concept.
        print(f"Processed upload task in queue: {task['filename']}")

@router.post("/upload")
async def upload_file(
    file: UploadFile = FastAPIFile(...),
    folder_id: int = Form(...),
    tags: str = Form(""),
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    """File upload mimicking queue offloading and hashing tags."""
    # Verify folder ownership
    folder = db.query(models.Folder).filter(models.Folder.id == folder_id, models.Folder.owner_id == current_user.id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found or access denied")

    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    file_size = os.path.getsize(file_path) / 1024 # KB
    
    # Enqueue task (IB Concept: Queue)
    upload_queue.enqueue({"filename": file.filename, "size": file_size, "path": file_path})
    process_upload_queue(db) # Trigger sync for demo purposes
    
    db_file = models.File(name=file.filename, size=file_size, type=file.content_type, folder_id=folder_id, tags=tags)
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    
    # Add Initial Version (IB Concept: Linked List creation point)
    version = models.FileVersion(file_id=db_file.id, file_path=file_path)
    db.add(version)
    db.commit()
    db.refresh(version)
    
    db_file.current_version_id = version.id
    db.add(models.AuditLog(user_id=current_user.id, action="UPLOAD", target_id=db_file.id, target_type="FILE"))
    db.commit()
    
    # Index tags (IB Concept: Hash Table insertion)
    for tag in [t.strip() for t in tags.split(",") if t.strip()]:
        tag_index.insert(tag, db_file.id)
    
    # Add to Undo Stack (IB Concept: Stack push)
    undo_stack.push({"action": "UPLOAD", "file_id": db_file.id, "user_id": current_user.id})
    
    return {"message": "File uploaded successfully", "file": {"id": db_file.id, "name": db_file.name}}

@router.get("/")
def list_files(folder_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Security: Verify folder ownership
    folder = db.query(models.Folder).filter(models.Folder.id == folder_id, models.Folder.owner_id == current_user.id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found or access denied")
        
    files = db.query(models.File).filter(models.File.folder_id == folder_id).all()
    # Simple sorting required for Binary Search demo later on frontend or backend
    sorted_files = sorted(files, key=lambda f: f.name)
    return sorted_files

@router.delete("/{file_id}")
def delete_file(file_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Soft delete or hard delete with Undo Stack tracking"""
    file = db.query(models.File).filter(models.File.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404)
        
    # Push to undo stack before deleting (storing metadata for full restoration)
    undo_stack.push({
        "action": "DELETE", 
        "file_data": {
            "id": file.id, 
            "name": file.name, 
            "folder_id": file.folder_id,
            "size": file.size,
            "type": file.type,
            "tags": file.tags
        }, 
        "user_id": current_user.id
    })
    
    db.delete(file)
    db.add(models.AuditLog(user_id=current_user.id, action="DELETE", target_id=file_id, target_type="FILE"))
    db.commit()
    return {"message": "File deleted"}

@router.post("/undo")
def undo_last_action(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """IB Concept: Stack Pop"""
    if undo_stack.is_empty():
        return {"message": "Nothing to undo"}
        
    last_act = undo_stack.pop()
    
    if last_act["action"] == "DELETE":
        # Restore file
        f = last_act["file_data"]
        restored = models.File(
            id=f["id"], 
            name=f["name"], 
            folder_id=f["folder_id"], 
            size=f["size"], 
            type=f["type"],
            tags=f["tags"]
        )
        db.add(restored)
        db.commit()
        return {"message": "File deletion undone"}
        
    return {"message": f"Undo for {last_act['action']} not fully implemented in demo"}

@router.get("/search")
def search_files(query: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """IB Concept: Binary Search - Securely limited to user's folders"""
    # Security: Filter files belonging to a folder owned by this user
    all_user_files = (
        db.query(models.File)
        .join(models.Folder)
        .filter(models.Folder.owner_id == current_user.id)
        .all()
    )
    
    # Sort files to satisfy binary search prerequisite
    sorted_files = sorted(all_user_files, key=lambda f: f.name)
    
    # For demo, strict binary search looks for exact name
    exact_match = binary_search_files(sorted_files, query)
    return [exact_match] if exact_match else []

@router.post("/batch/delete")
def batch_delete_files(file_ids: list[int], db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """IB HL Concept: Batch Operations"""
    files = db.query(models.File).filter(models.File.id.in_(file_ids)).all()
    count = 0
    for file in files:
        undo_stack.push({"action": "DELETE", "file": {"id": file.id, "name": file.name, "folder_id": file.folder_id}, "user_id": current_user.id})
        db.delete(file)
        db.add(models.AuditLog(user_id=current_user.id, action="BATCH_DELETE", target_id=file.id, target_type="FILE"))
        count += 1
        
    db.commit()
    return {"message": f"Successfully deleted {count} files in batch"}

