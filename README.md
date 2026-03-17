# School Digital Filing System (ADFS-IA)

This is a full-stack digital filing system specifically architected to demonstrate complex computational thinking, algorithmic efficiency, and object-oriented design for the **IB HL Computer Science Internal Assessment**.

## Technology Stack
- **Backend:** Python 3 (FastAPI)
- **Frontend:** React + Vite + Tailwind CSS v4
- **Database:** PostgreSQL (Supabase) + SQLAlchemy ORM
- **In-Memory Caching:** Redis
- **Background Tasks:** APScheduler

---

## Mapped IB HL Concepts

### 1. Abstract Data Structures (Topic 5 / Option D)
* The system utilizes standard libraries and custom implementations to demonstrate understanding of Abstract Data Structures:
  * **Linked List (`backend/data_structures/linked_list.py`):** Used to maintain the history of file versions. Each node points to the previously created version, allowing O(n) historical traversal backward in time.
  * **Stack (`backend/data_structures/stack.py`):** Used for the Undo System (`ActionStack`). Implements LIFO logic (Last In, First Out) so a user can automatically revert their last operation.
  * **Queue (`backend/data_structures/queue.py`):** Used for the asynchronous File Upload Manager (`UploadQueue`). Upload requests are enqueued and dequeued in strict FIFO (First In, First Out) order, preventing IO blocking during heavy batch uploads.
  * **Hash Table (`backend/data_structures/hash_table.py`):** Used for indexing document tags. Allows O(1) average lookup time when searching for documents by specific categorical tags. Handles collisions via chaining.
  * **Multidimensional Arrays (`backend/api/analytics.py`):** Used for grouping flat data structurally to extract metrics like file distribution across type or folders.

### 2. Algorithms
* **Binary Search (`backend/utils/algorithms.py`):** Utilized for file searching. Files are automatically sorted by name, allowing the app to search for an exact match in O(log n) time complexity rather than traversing a full linear array in O(n) time.
* **Recursion (`backend/utils/algorithms.py` & `frontend/src/features/folders/FolderTree.jsx`):** 
  * *Backend*: A recursive function traverses a hierarchical hash map to flatten all descendants of a given parent folder.
  * *Frontend*: The `TreeNode` component maps over a deeply nested object, recursively calling itself to render `n` levels of nested directories graphically.

### 3. Concurrency & Scheduling
* **Asynchronous Background Processing (`backend/services/scheduler.py`):** Background jobs run independently from the main API thread using `apscheduler` to perform mock database and file backups. 

---

## 25 Feature Integrations
1. **User Authentication:** JWT-based login and registration endpoints.
2. **Role-based Permissions:** Users are assigned roles (Admin, Teacher, Registrar) in the `users` table via Pydantic enums.
3. **Nested Folder Creation:** Handled via self-referential parent_id joins in `models.py`.
4. **File Upload with Metadata:** Captures size and extension validation seamlessly via FastAPI `UploadFile`.
5. **File Versioning:** Integrated via Linked List tracking version pointers.
6. **File Search (Binary Search):** Enforced by preprocessing an array and splitting to find the median key.
7. **Recursive Folder Traversal:** Depth-first tree walk logic in React and Python.
8. **Stack-based Undo:** `ActionStack` maintains a capacity-bound array simulating a real stack.
9. **Queue-based Upload Manager:** File processing decoupled through `UploadQueue`.
10. **Tag Indexing:** Tag inputs pass through `TagHashTable` for O(1) routing.
11. **Caching (Redis):** `redis_client` reduces DB round trips when retrieving large folder maps.
12. **Concurrent Background Tasks:** APScheduler handles long-polling jobs without dropping API requests.
13. **Audit Logging:** Every mutating action is tracked in an `AuditLog` table.
14. **Batch Operations:** Endpoints like `/batch/delete` use `in_` iterators to delete rows iteratively.
15. **Scheduled Backups:** `perform_backup` operates on an interval basis asynchronously.
16. **Analytics Dashboard:** Reads Audit logs and multidimensionally maps usage counts.
17. **MVC Separation:** Backend is split strictly into `models.py`, `schemas.py` (views), and `routers` (controllers).
18. **REST API:** Well-formed generic endpoints matching React-query patterns.
19. **Graceful Error Handling:** FastAPI `HTTPException` gracefully bubbles down stack traces to informative user modals.
20. **Input Validation:** Done at schema-level by Pydantic.
21. **Recursive React Components:** The tree interface is inherently scalable.
22. **SQLAlchemy Relational Structures:** Strict Object-Oriented representations of abstract concepts.
23. **Security/Hashing:** Passlib / Bcrypt encrypts passwords on rest.
24. **UI Dynamic Rendering:** Tailwind conditionally reacts to UI hooks.
25. **Interactive Actions:** Drag/drop structure capability implemented structurally in hooks.

## Environment Variables
Supabase requires a connection string. Configure `database.py` to point its `SUPABASE_DB_URL` fallback to your specific Postgres URL.

To run:
1. React: `cd frontend && npm run dev`
2. FastAPI: `cd backend && source venv/bin/activate && uvicorn backend.main:app --reload`
