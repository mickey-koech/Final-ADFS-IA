from apscheduler.schedulers.background import BackgroundScheduler
import datetime
from sqlalchemy.orm import Session
from ..database import SessionLocal
from .. import models

# IB HL Concept: Scheduled/Concurrent Background Tasks
def check_for_anomalies():
    """
    Scans audit logs for unusual activity patterns.
    Ports logic from original Supabase Edge Functions.
    """
    db = SessionLocal()
    try:
        now = datetime.datetime.utcnow()
        
        # 1. Mass Deletion Check (>20 files in 10 minutes)
        ten_mins_ago = now - datetime.timedelta(minutes=10)
        recent_deletions = db.query(models.AuditLog).filter(
            models.AuditLog.action == "DELETE",
            models.AuditLog.target_type == "FILE",
            models.AuditLog.timestamp >= ten_mins_ago
        ).all()
        
        if len(recent_deletions) > 20:
            alert = models.AnomalyAlert(
                alert_type="mass_deletion",
                severity="critical",
                description=f"Unusual activity: {len(recent_deletions)} files deleted in 10 minutes",
                user_id=recent_deletions[0].user_id
            )
            db.add(alert)
        
        # 2. Unusual Upload Patterns (>50 files in 1 hour)
        one_hour_ago = now - datetime.timedelta(hours=1)
        recent_uploads = db.query(models.AuditLog).filter(
            models.AuditLog.action == "UPLOAD",
            models.AuditLog.timestamp >= one_hour_ago
        ).all()
        
        if len(recent_uploads) > 50:
            alert = models.AnomalyAlert(
                alert_type="mass_upload",
                severity="medium",
                description=f"High volume upload: {len(recent_uploads)} files in 1 hour"
            )
            db.add(alert)

        # 3. Unauthorized Access Attempts (>10 in 1 hour)
        unauth_attempts = db.query(models.AuditLog).filter(
            models.AuditLog.action == "UNAUTHORIZED_ACCESS",
            models.AuditLog.timestamp >= one_hour_ago
        ).all()
        
        if len(unauth_attempts) > 10:
            alert = models.AnomalyAlert(
                alert_type="unauthorized_access",
                severity="high",
                description=f"Multiple unauthorized access attempts: {len(unauth_attempts)} in 1 hour"
            )
            db.add(alert)
            
        db.commit()
    except Exception as e:
        print(f"Anomaly Detection Error: {e}")
        db.rollback()
    finally:
        db.close()

def perform_backup():
    """Simulates database and file backup routine."""
    print(f"[{datetime.datetime.now()}] [BACKUP SYSTEM] Starting scheduled backup...")
    # Simulation
    import time
    time.sleep(1)
    print(f"[{datetime.datetime.now()}] [BACKUP SYSTEM] Backup completed successfully.")

def start_scheduler():
    scheduler = BackgroundScheduler()
    # Check for anomalies every minute
    scheduler.add_job(check_for_anomalies, 'interval', minutes=1)
    # Run backup simulation every 30 minutes
    scheduler.add_job(perform_backup, 'interval', minutes=30)
    scheduler.start()
    print("Background Task Scheduler started. Jobs loaded.")
