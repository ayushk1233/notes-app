from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from uuid import uuid4

app = FastAPI(title="Notes API", version="2.0.0")

# -------------------------------
# Pydantic Schemas
# -------------------------------
class NoteBase(BaseModel):
    title: str
    content: str

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class Note(NoteBase):
    id: str
    shared: bool = False
    share_token: Optional[str] = None

# -------------------------------
# In-memory storage
# -------------------------------
notes_db: List[Note] = []

# -------------------------------
# Routes
# -------------------------------
@app.get("/")
def root():
    return {
        "message": "🎉 Notes API is running!",
        "version": "2.0.0",
        "environment": "production",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "auth": ["/auth/signup", "/auth/login", "/auth/guest"],
            "notes": ["/notes/", "/notes/{id}", "/notes/{id}/share"],
            "shared": ["/shared/{token}"]
        }
    }

@app.get("/health")
def health():
    return {"status": "ok"}

# -------------------------------
# Notes CRUD
# -------------------------------
@app.get("/notes/", response_model=List[Note])
def get_all_notes():
    return notes_db

@app.get("/notes/{note_id}", response_model=Note)
def get_note(note_id: str):
    for note in notes_db:
        if note.id == note_id:
            return note
    raise HTTPException(status_code=404, detail="Note not found")

@app.post("/notes/", response_model=Note)
def create_note(note: NoteCreate):
    new_note = Note(id=str(uuid4()), title=note.title, content=note.content)
    notes_db.append(new_note)
    return new_note

@app.put("/notes/{note_id}", response_model=Note)
def update_note(note_id: str, note_update: NoteUpdate):
    for note in notes_db:
        if note.id == note_id:
            if note_update.title is not None:
                note.title = note_update.title
            if note_update.content is not None:
                note.content = note_update.content
            return note
    raise HTTPException(status_code=404, detail="Note not found")

@app.delete("/notes/{note_id}")
def delete_note(note_id: str):
    global notes_db
    for note in notes_db:
        if note.id == note_id:
            notes_db = [n for n in notes_db if n.id != note_id]
            return {"message": "Note deleted"}
    raise HTTPException(status_code=404, detail="Note not found")

@app.post("/notes/{note_id}/share", response_model=Note)
def share_note(note_id: str):
    for note in notes_db:
        if note.id == note_id:
            token = str(uuid4())
            note.shared = True
            note.share_token = token
            return note
    raise HTTPException(status_code=404, detail="Note not found")

@app.get("/shared/{token}", response_model=Note)
def get_shared_note(token: str):
    for note in notes_db:
        if note.share_token == token and note.shared:
            return note
    raise HTTPException(status_code=404, detail="Shared note not found")
