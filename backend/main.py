from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List
import os
from dotenv import load_dotenv

import models
import schemas
import auth
import database

# Load environment variables
load_dotenv()

# Configuration - Production ready
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
PRODUCTION_FRONTEND_URLS = [
    "https://*.vercel.app",  # Vercel deployments
    "https://*.netlify.app",  # Netlify deployments
    "https://your-custom-domain.com",  # Replace with your custom domain
]

# Determine environment
IS_PRODUCTION = os.getenv("RAILWAY_ENVIRONMENT") == "production" or os.getenv("RENDER") is not None
PORT = int(os.getenv("PORT", 8000))

app = FastAPI(
    title="Notes API", 
    version="1.0.0",
    description="Production-ready Notes API with authentication and sharing features",
    docs_url="/docs" if not IS_PRODUCTION else "/docs",  # Keep docs in production for now
    redoc_url="/redoc" if not IS_PRODUCTION else None
)

# CORS Configuration - Production ready
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    FRONTEND_URL
]

# Add production URLs if in production
if IS_PRODUCTION:
    frontend_url = os.getenv("FRONTEND_URL")
    if frontend_url:
        allowed_origins.append(frontend_url)
    
    # Add common deployment platforms
    allowed_origins.extend([
        "https://*.vercel.app",
        "https://*.netlify.app",
        "https://*.railway.app"
    ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
    expose_headers=["Content-Type"],
    max_age=86400,  # Cache preflight requests for 24 hours
)

# Health check endpoint for deployment platforms
@app.get("/health")
async def health_check():
    """Health check endpoint for deployment monitoring"""
    try:
        # Test database connection
        db = next(database.get_db())
        db.execute("SELECT 1")
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "environment": "production" if IS_PRODUCTION else "development",
        "database": db_status,
        "port": PORT
    }

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database and perform startup tasks"""
    try:
        database.init_db()
        print(f"✅ Database initialized successfully")
        print(f"✅ Server starting on port {PORT}")
        print(f"✅ Environment: {'Production' if IS_PRODUCTION else 'Development'}")
        print(f"✅ Frontend URL: {FRONTEND_URL}")
        print(f"✅ CORS Origins: {allowed_origins}")
    except Exception as e:
        print(f"❌ Startup error: {str(e)}")
        raise

# Authentication routes
@app.post("/auth/signup", response_model=schemas.User)
async def signup(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    try:
        # Check if username already exists
        db_user = db.query(models.User).filter(models.User.username == user.username).first()
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        
        # Create new user
        hashed_password = auth.get_password_hash(user.password)
        db_user = models.User(username=user.username, password_hash=hashed_password)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Signup error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user account"
        )

@app.post("/auth/login", response_model=schemas.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    try:
        if not form_data.username or not form_data.password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username and password are required"
            )

        user = auth.authenticate_user(db, form_data.username, form_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token = auth.create_access_token(
            data={"sub": str(user.id), "is_guest": user.is_guest}
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during login"
        )

@app.post("/auth/guest", response_model=schemas.Token)
async def guest_login(db: Session = Depends(database.get_db)):
    try:
        # Generate random credentials for guest
        username = auth.generate_random_username()
        password = auth.generate_random_username()
        
        # Create guest user
        hashed_password = auth.get_password_hash(password)
        guest_user = models.User(
            username=username,
            password_hash=hashed_password,
            is_guest=True
        )
        db.add(guest_user)
        db.commit()
        db.refresh(guest_user)
        
        # Create access token
        access_token = auth.create_access_token(
            data={"sub": str(guest_user.id), "is_guest": True}
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        db.rollback()
        print(f"Error creating guest account: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create guest account"
        )

# Root endpoint with API information
@app.get("/")
async def root():
    return {
        "message": "Notes API is running!",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "environment": "production" if IS_PRODUCTION else "development"
    }

# Notes routes with enhanced error handling
@app.post("/notes/", response_model=schemas.Note)
async def create_note(
    note: schemas.NoteCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    try:
        current_time = datetime.utcnow()
        db_note = models.Note(
            title=note.title,
            content=note.content,
            user_id=current_user.id,
            created_at=current_time,
            updated_at=current_time
        )
        db.add(db_note)
        db.commit()
        db.refresh(db_note)
        return db_note
    except Exception as e:
        db.rollback()
        print(f"Error creating note: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create note"
        )

@app.get("/notes/", response_model=List[schemas.Note])
async def get_notes(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    try:
        notes = db.query(models.Note).filter(models.Note.user_id == current_user.id).order_by(models.Note.updated_at.desc()).all()
        return notes
    except Exception as e:
        print(f"Error fetching notes: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch notes"
        )

@app.get("/notes/{note_id}", response_model=schemas.Note)
async def get_note(
    note_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    try:
        note = db.query(models.Note).filter(
            models.Note.id == note_id,
            models.Note.user_id == current_user.id
        ).first()
        
        if note is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note not found"
            )
        return note
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching note {note_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch note"
        )

@app.put("/notes/{note_id}", response_model=schemas.Note)
async def update_note(
    note_id: int,
    note_update: schemas.NoteUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    try:
        note = db.query(models.Note).filter(
            models.Note.id == note_id,
            models.Note.user_id == current_user.id
        ).first()
        
        if note is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note not found"
            )
        
        # Update fields if provided
        if note_update.title is not None:
            note.title = note_update.title
        if note_update.content is not None:
            note.content = note_update.content
        
        # Update timestamp
        note.updated_at = datetime.utcnow()
            
        db.commit()
        db.refresh(note)
        return note
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error updating note {note_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update note"
        )

@app.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    try:
        note = db.query(models.Note).filter(
            models.Note.id == note_id,
            models.Note.user_id == current_user.id
        ).first()
        
        if note is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note not found"
            )
            
        db.delete(note)
        db.commit()
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error deleting note {note_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete note"
        )

@app.post("/notes/{note_id}/share", response_model=schemas.NoteShareResponse)
async def share_note(
    note_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    try:
        note = db.query(models.Note).filter(
            models.Note.id == note_id,
            models.Note.user_id == current_user.id
        ).first()
        
        if note is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note not found"
            )
        
        note.is_shared = True
        note.share_token = auth.generate_share_token()
        db.commit()
        db.refresh(note)
        
        # Create response with share URL
        share_url = f"{FRONTEND_URL}/shared/{note.share_token}"
        response_dict = {
            **note.__dict__,
            'share_url': share_url
        }
        return schemas.NoteShareResponse(**response_dict)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error sharing note {note_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to share note"
        )

@app.get("/shared/{share_token}", response_model=schemas.Note)
async def get_shared_note(share_token: str, db: Session = Depends(database.get_db)):
    try:
        note = db.query(models.Note).filter(
            models.Note.share_token == share_token,
            models.Note.is_shared == True
        ).first()
        
        if note is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shared note not found or no longer available"
            )
        return note
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching shared note {share_token}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch shared note"
        )

# Add middleware for request logging in production
@app.middleware("http")
async def log_requests(request, call_next):
    start_time = datetime.utcnow()
    
    # Process the request
    response = await call_next(request)
    
    # Log request details (you can customize this)
    process_time = (datetime.utcnow() - start_time).total_seconds()
    
    # Only log in production or if debugging is enabled
    if IS_PRODUCTION or os.getenv("DEBUG_LOGGING", "false").lower() == "true":
        print(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.3f}s")
    
    return response

# Error handlers
@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return {"error": "Internal server error", "detail": "Something went wrong on our end"}

@app.exception_handler(404)
async def not_found_handler(request, exc):
    return {"error": "Not found", "detail": "The requested resource was not found"}

# Main execution
if __name__ == "__main__":
    import uvicorn
    
    # Configuration for different environments
    if IS_PRODUCTION:
        # Production configuration
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=PORT,
            workers=1,  # Railway/Render work better with 1 worker
            access_log=True,
            use_colors=False
        )
    else:
        # Development configuration
        uvicorn.run(
            app,
            host="127.0.0.1",
            port=8000,
            reload=True,
            access_log=True
        )