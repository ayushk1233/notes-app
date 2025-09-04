from sqlalchemy.orm import sessionmaker
import models
import os

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=models.engine)

def get_db():
    """Dependency to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables."""
    # Remove the existing database if it's corrupted
    if os.path.exists("notes.db"):
        try:
            # Try to create a session to test if the database is working
            db = SessionLocal()
            db.execute("SELECT 1")
            db.close()
        except Exception:
            # If there's an error, remove the corrupted database
            os.remove("notes.db")
    
    # Create all tables
    models.Base.metadata.create_all(bind=models.engine)
