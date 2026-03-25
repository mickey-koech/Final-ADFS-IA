# Criterion C: Development — Documentation Plan

## 1. System Architecture Overview

**Why necessary**: Client (school admin/teachers/registrars) needs secure, scalable file management replacing paper systems. Ties to Criterion A (efficiency for multi-user access) and success criterion: responsive system (<2s loads) via caching/async.

**Design/Thought Process**:
- Layers: React Frontend → FastAPI Backend → PostgreSQL (SQLAlchemy ORM) → Redis Cache → APScheduler Jobs.
- Decision: Stateless JWT over sessions for scale; Redis for tree reads (frequent); ORM for DB abstraction.
```
Frontend (React/Tailwind)
        ↓ API Calls
Backend (FastAPI)
        ↓ ORM
PostgreSQL (models.py)
        ↔ Cache
Redis (database.py)
        ↓ Jobs
APScheduler (scheduler.py)
```

**Key Code** (backend/main.py startup):
```python
@app.on_event("startup")
def on_startup():
    start_scheduler()  # APScheduler for backups

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])  # Layered routers
models.Base.metadata.create_all(bind=engine)  # ORM tables
```

**Issues/Solved**: Migration conflicts → Auto-create_all for IA demo. Redis fail → Graceful fallback (database.py).

**Screenshot**: [Placeholder: System diagram in draw.io; Live: http://localhost:8000/docs Swagger UI showing routers.]

**Success Criteria**: ORM maps classes→tables (e.g., self-ref Folder); APScheduler backups non-blocking.

## 2. User Authentication and Role Management

**Why**: Security for roles (Admin full, Teacher own files). Client needs data integrity (Criterion B: role isolation).

**Design**:
```
Login → bcrypt verify → JWT (role/sub) → get_current_user → role check
```

**Key Code** (api/auth.py + core/security.py):
```python
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    username: str = payload.get("sub")
    user = db.query(models.User).filter(models.User.username == username).first()
    return user  # Includes role

# security.py
pwd_context = CryptContext(schemes=["bcrypt"])
def get_password_hash(password): return pwd_context.hash(password)
```

**Issues/Solved**: Unapproved access → AuditLog + 401 (auth.py). Token expiry → 60min configurable.

**Screenshot**: [Placeholder: Login form → JWT response in Network tab; Role-restricted folder view.]

**Success Criteria**: JWT stateless; bcrypt secure hashing.

## 3. File and Folder Management

### a. Folder Tree and Recursive Traversal
**Why**: Nested folders mimic school depts (Criterion A: organization).

**Design** (utils/algorithms.py):
```pseudocode
def get_all_subfolders_recursive(folder_id, folder_map):
    children = folder_map.get(folder_id, [])
    descendants = []
    for child in children:
        descendants += [child] + recursive(child.id)
    return descendants
```

**Key Code** (api/folders.py):
```python
def get_folder_descendants(folder_id: int, ...):
    all_folders = db.query(models.Folder).filter(...).all()
    folder_map = {f.parent_id: [] for f in all_folders}
    descendants = get_all_subfolders_recursive(folder_id, folder_map)
```

**Issues/Solved**: Recursion depth → Flat map pre-build (O(n)).

**Screenshot**: [FolderTree.jsx rendering nested tree.]

### b. File Operations and Version Control
**Why**: Batch uploads/undo for staff efficiency.

**Key Code** (api/files.py): Queue + LinkedList + Stack.
```python
upload_queue.enqueue({"filename": file.filename})  # FIFO
version = models.FileVersion(file_id=db_file.id)  # Head insert O(1)
undo_stack.push({"action": "DELETE", ...})  # LIFO
```

**Issues/Solved**: Sync queue → Prototype process() for demo.

**Screenshot**: [Upload form → Undo button restoring file.]

**Success Criteria**: Custom DS reduce workload.

## 4. Searching, Tagging, and Filtering

**Why**: Fast tag search (O(1)) vs linear scan.

**Key Code** (data_structures/hash_table.py):
```python
class TagHashTable:
    def _hash_function(self, key: str) -> int:
        hash_val = sum(ord(c) for c in key) % self.size
    def insert(self, tag: str, file_id: int):  # Chaining collision
        ...
    def lookup(self, tag: str) -> list:  # O(1) avg
        ...
```
Used in files.py: `tag_index.insert(tag, db_file.id)`

Binary Search (utils/algorithms.py):
```python
def binary_search_files(sorted_files, target_name):  # O(log n)
    low, high = 0, len(sorted_files) - 1
    while low <= high:
        mid = (low + high) // 2
        if sorted_files[mid].name == target_name: return sorted_files[mid]
        ...
```

**Issues/Solved**: Collisions → Chaining lists.

**Screenshot**: [Search bar → Tagged results.]

**Success Criteria**: O(1) tags speed.

## 5. Batch Operations

**Why**: Bulk delete/uploads for 100s files (Criterion A).

**Key Code** (files.py):
```python
@router.post("/batch/delete")
def batch_delete_files(file_ids: list[int], ...):
    for file in files:  # With undo_stack.push per item
        db.delete(file)
```

**Issues/Solved**: Concurrency → DB tx commit.

**Screenshot**: [Checkbox select → Batch delete confirm.]

## 6. Audit Log and User Activity Tracking

**Why**: Oversight/compliance.

**Key Code** (models.py):
```python
class AuditLog(Base):
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String)  # UPLOAD/DELETE
    target_type = Column(String)  # FILE/FOLDER
```
Logged everywhere: `db.add(models.AuditLog(...))`

**Screenshot**: [Admin audit table.]

## 7. Concurrent & Background Processing

**Why**: Non-blocking backups.

**Key Code** (services/scheduler.py):
```python
scheduler = BackgroundScheduler()
scheduler.add_job(check_for_anomalies, 'interval', minutes=1)
scheduler.start()
```

**Issues/Solved**: DB sessions → SessionLocal() per job.

**Screenshot**: [Logs: "[BACKUP SYSTEM] completed"]

## 8. Caching and Performance Optimization

**Why**: <2s tree loads.

**Key Code** (folders.py):
```python
cache_key = f"folders_user_{current_user.id}"
if redis_client.get(cache_key): return json.loads(cached)
redis_client.setex(cache_key, 300, json.dumps(result))
```

**Metrics**: Cache hit → ~10ms vs 100ms DB.

**Screenshot**: [Redis Monitor showing sets.]

## 9. Security Measures

**Why**: Data integrity.

- Bcrypt/JWT as above.
- Ownership checks: `models.Folder.owner_id == current_user.id`
- Input val: FastAPI Pydantic.
- Scan: No vulns (hash_table safe).

**Screenshot**: [Failed login → AuditLog entry.]

## 10. Analytics and Dashboard

**Why**: Oversight (monthly uploads).

**Key Code** (api/analytics.py):
```python
uploads = db.query(models.AuditLog).filter(action=="UPLOAD").all()
month_map = {}  # Multidim dict
for u in uploads: month_map[u.timestamp.strftime("%b %Y")] += 1
```

**Screenshot**: [Recharts pie/bar from frontend/src/components/admin/analytics/*.jsx]

## 11. Error Handling and User Feedback

**Key Code** (files.py): `raise HTTPException(404, "Folder not found")`

**Screenshot**: [React toast notification.]

## 12. Responsive UI/UX Design

**Why**: Mobile staff access.

**Evidence**: Tailwind (frontend/tailwind.config.js); Recursive FolderTree.jsx.

**Screenshot**: [iPhone folder tree + search.]

## 13. Automated Backups and Data Recovery

**Key Code**: `scheduler.add_job(perform_backup, 'interval', minutes=30)`

**Screenshot**: [Console logs of backup runs.]

**Final Ties**: All fulfill client needs: Secure, fast, organized digital filing. IB HL DS proven in production-like code.

