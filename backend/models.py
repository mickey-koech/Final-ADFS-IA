from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float, Text
from sqlalchemy.orm import relationship
import datetime
from .database import Base

class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    users = relationship("User", back_populates="department")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String, nullable=True)
    role = Column(String, default="Teacher") # Admin, Teacher, Secretary, Registrar
    
    # Approval workflow features from original repo
    is_approved = Column(Boolean, default=False)
    approved_at = Column(DateTime, nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    
    department = relationship("Department", back_populates="users")
    folders = relationship("Folder", back_populates="owner")
    logs = relationship("AuditLog", back_populates="user")
    alerts = relationship("AnomalyAlert", back_populates="user")

class Folder(Base):
    __tablename__ = "folders"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    parent_id = Column(Integer, ForeignKey("folders.id"), nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    owner = relationship("User", back_populates="folders")
    subfolders = relationship("Folder", backref="parent", remote_side=[id])
    files = relationship("File", back_populates="folder")

class File(Base):
    __tablename__ = "files"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    size = Column(Float)
    type = Column(String)
    folder_id = Column(Integer, ForeignKey("folders.id"))
    current_version_id = Column(Integer, nullable=True)
    tags = Column(String, default="") # comma-separated tags
    
    # Ported from original repo
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime, nullable=True)
    is_archived = Column(Boolean, default=False)
    archived_at = Column(DateTime, nullable=True)
    
    # AI Fields
    ocr_text = Column(Text, nullable=True)
    ocr_status = Column(String, default="pending") # pending, processing, done, failed
    language = Column(String, nullable=True)
    
    folder = relationship("Folder", back_populates="files")
    versions = relationship("FileVersion", back_populates="file")

class FileVersion(Base):
    __tablename__ = "file_versions"
    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"))
    file_path = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    prev_version_id = Column(Integer, ForeignKey("file_versions.id"), nullable=True)
    
    file = relationship("File", back_populates="versions")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String) # CREATE, UPLOAD, DELETE, LOGIN, etc.
    target_id = Column(Integer, nullable=True)
    target_type = Column(String, nullable=True) # FILE, FOLDER, USER
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    details = Column(Text, nullable=True)
    
    user = relationship("User", back_populates="logs")

class AnomalyAlert(Base):
    __tablename__ = "anomaly_alerts"
    id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(String) # mass_deletion, mass_upload, etc.
    severity = Column(String) # low, medium, high, critical
    description = Column(Text)
    resolved = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Target user if applicable
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="alerts")
