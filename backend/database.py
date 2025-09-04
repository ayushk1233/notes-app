from sqlalchemy.orm import sessionmaker
import models

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
    models.Base.metadata.create_all(bind=models.engine)
