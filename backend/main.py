from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List

import models
import schemas
import auth
import database

# Configuration
FRONTEND_URL = "http://localhost:3000"  # Frontend URL configuration

app = FastAPI(title="Notes API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://127.0.0.1:3000"],  # Using the configured frontend URL
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
    expose_headers=["Content-Type"]
)

# Initialize database on startup
database.init_db()

# Authentication routes
@app.post("/auth/signup", response_model=schemas.User)
async def signup(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
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
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Login error: {str(e)}")  # For debugging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during login"
        )

@app.post("/auth/guest", response_model=schemas.Token)
async def guest_login(db: Session = Depends(database.get_db)):
    try:
        # Generate random credentials for guest
        username = auth.generate_random_username()
        password = auth.generate_random_username()  # Using same function for random password
        
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
        print(f"Error creating guest account: {str(e)}")  # For debugging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create guest account"
        )

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Notes API is running!"}

# Notes routes
@app.post("/notes/", response_model=schemas.Note)
async def create_note(
    note: schemas.NoteCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    current_time = datetime.utcnow()
    db_note = models.Note(
        title=note.title,
        content=note.content,
        user_id=current_user.id,
        created_at=current_time,
        updated_at=current_time  # Set both timestamps to the same value for new notes
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

@app.get("/notes/", response_model=List[schemas.Note])
async def get_notes(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    notes = db.query(models.Note).filter(models.Note.user_id == current_user.id).all()
    return notes

@app.get("/notes/{note_id}", response_model=schemas.Note)
async def get_note(
    note_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
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

@app.put("/notes/{note_id}", response_model=schemas.Note)
async def update_note(
    note_id: int,
    note_update: schemas.NoteUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    note = db.query(models.Note).filter(
        models.Note.id == note_id,
        models.Note.user_id == current_user.id
    ).first()
    
    if note is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    if note_update.title is not None:
        note.title = note_update.title
    if note_update.content is not None:
        note.content = note_update.content
        
    db.commit()
    db.refresh(note)
    return note

@app.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
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

@app.post("/notes/{note_id}/share", response_model=schemas.NoteShareResponse)
async def share_note(
    note_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
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
    
    # Create response with share URL, including note title in URL
    share_url = f"{FRONTEND_URL}/shared/{note.share_token}"  # Using the configured frontend URL
    response_dict = {
        **note.__dict__,
        'share_url': share_url
    }
    return schemas.NoteShareResponse(**response_dict)

@app.get("/shared/{share_token}", response_model=schemas.Note)
async def get_shared_note(share_token: str, db: Session = Depends(database.get_db)):
    note = db.query(models.Note).filter(
        models.Note.share_token == share_token,
        models.Note.is_shared == True
    ).first()
    
    if note is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared note not found"
        )
    return note
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)