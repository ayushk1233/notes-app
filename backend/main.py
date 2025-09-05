from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
import os, random, string

# ======================================================
# App lifecycle + config
# ======================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🏁 Application startup")
    yield
    print("👋 Application shutdown")

app = FastAPI(
    title="Notes API",
    description="FastAPI backend for Notes App",
    version="2.0.0",
    lifespan=lifespan
)

# Frontend URL (important for share URLs)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Allow frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: restrict to frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================================================
# In-memory "database" for notes (temporary)
# ======================================================
NOTES = {
    1: {
        "id": 1,
        "title": "Welcome to Notes API!",
        "content": "This is your first note. The API is working correctly!",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "is_shared": False,
        "share_token": None,
    }
}
NEXT_ID = 2

# Helper: generate random share token
def generate_share_token():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=12))


# ======================================================
# Health & Meta Routes
# ======================================================
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
def health_check():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


# ======================================================
# Auth Routes (very basic mock)
# ======================================================
@app.post("/auth/signup")
def signup(user: dict):
    # TODO: implement DB-backed signup
    return {"message": "User registered successfully (mock)"}

@app.post("/auth/login")
def login(credentials: dict):
    # TODO: implement JWT-based login
    return {"access_token": "mock-token", "token_type": "bearer"}

@app.post("/auth/guest")
def guest_login():
    return {"access_token": "guest-token", "token_type": "bearer"}


# ======================================================
# Notes CRUD Routes
# ======================================================
@app.get("/notes/")
def get_notes():
    return list(NOTES.values())

@app.post("/notes/")
def create_note(note_data: dict):
    global NEXT_ID
    note_id = NEXT_ID
    NEXT_ID += 1

    new_note = {
        "id": note_id,
        "title": note_data.get("title", "Untitled"),
        "content": note_data.get("content", ""),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "is_shared": False,
        "share_token": None,
    }
    NOTES[note_id] = new_note
    return new_note

@app.get("/notes/{note_id}")
def get_note(note_id: int):
    note = NOTES.get(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note

@app.put("/notes/{note_id}")
def update_note(note_id: int, note_data: dict):
    note = NOTES.get(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    note["title"] = note_data.get("title", note["title"])
    note["content"] = note_data.get("content", note["content"])
    note["updated_at"] = datetime.utcnow().isoformat()
    NOTES[note_id] = note
    return note

@app.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: int):
    if note_id not in NOTES:
        raise HTTPException(status_code=404, detail="Note not found")
    del NOTES[note_id]
    return  # FastAPI sends 204 No Content automatically


# ======================================================
# Sharing Routes
# ======================================================
@app.post("/notes/{note_id}/share")
def share_note(note_id: int):
    note = NOTES.get(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    token = generate_share_token()
    note["is_shared"] = True
    note["share_token"] = token
    NOTES[note_id] = note

    return {
        "id": note_id,
        "share_token": token,
        "share_url": f"{FRONTEND_URL}/shared/{token}",
        "is_shared": True,
    }

@app.get("/shared/{share_token}")
def get_shared_note(share_token: str):
    for note in NOTES.values():
        if note.get("share_token") == share_token:
            return note
    raise HTTPException(status_code=404, detail="Shared note not found")
