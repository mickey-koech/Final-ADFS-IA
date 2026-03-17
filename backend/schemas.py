from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- Department Schemas ---
class DepartmentBase(BaseModel):
    name: str
    is_active: bool = True

class DepartmentCreate(DepartmentBase):
    pass

class Department(DepartmentBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- User Schemas ---
class UserBase(BaseModel):
    username: str
    full_name: Optional[str] = None
    role: str = "Teacher"
    is_approved: bool = False
    department_id: Optional[int] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    approved_at: Optional[datetime] = None
    class Config:
        from_attributes = True

# --- Folder Schemas ---
class FolderBase(BaseModel):
    name: str
    parent_id: Optional[int] = None

class FolderCreate(FolderBase):
    pass

class Folder(FolderBase):
    id: int
    owner_id: int
    class Config:
        from_attributes = True

# --- File Schemas ---
class FileBase(BaseModel):
    name: str
    size: float
    type: str
    folder_id: int
    tags: str = ""
    is_deleted: bool = False
    is_archived: bool = False
    ocr_status: str = "pending"

class FileCreate(FileBase):
    pass

class File(FileBase):
    id: int
    current_version_id: Optional[int] = None
    deleted_at: Optional[datetime] = None
    archived_at: Optional[datetime] = None
    ocr_text: Optional[str] = None
    language: Optional[str] = None
    class Config:
        from_attributes = True

# --- Audit & Analytics ---
class AuditLogBase(BaseModel):
    user_id: int
    action: str
    target_id: Optional[int] = None
    target_type: Optional[str] = None
    details: Optional[str] = None

class AuditLogCreate(AuditLogBase):
    pass

class AuditLog(AuditLogBase):
    id: int
    timestamp: datetime
    class Config:
        from_attributes = True

class AnomalyAlertBase(BaseModel):
    alert_type: str
    severity: str
    description: str
    resolved: bool = False
    user_id: Optional[int] = None

class AnomalyAlert(AnomalyAlertBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True
