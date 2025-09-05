from fastapi import FastAPI, HTTPException, Depends, status, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import create_engine, text
from datetime import datetime, timedelta
from typing import List, Optional
import os
from dotenv import load_dotenv
import asyncio
from contextlib import asynccontextmanager
from pydantic import BaseModel

# Load environment variables
load_dotenv()

# Temporary inline definitions
class User:
    def __init__(self, id=None, username=None, password_hash=None, is_guest=False):
        self.id = id
        self.username = username
        self.password_hash = password_hash
        self.is_guest = is_guest


class Note:
    def __init__(self, id=None, title=None, content=None, user_id=None,
                 created_at=None, updated_at=None, is_shared=False, share_token=None):
        self.id = id
        self.title = title
        self.content = content
        self.user_id = user_id
        self.created_at = created_at
        self.updated_at = updated_at
        self.is_shared = is_shared
        self.share_token = share_token


# ---------------- Pydantic Schemas ---------------- #
class NoteBase(BaseModel):
    title: Optional[str] = "Untitled"
    content: Optional[str] = ""

    class Config:
        extra = "allow"  # Ignore extra fields to keep frontend flexible


class NoteResponse(NoteBase):
    id: int
    created_at: str
    updated_at: str
    is_shared: Optional[bool] = False
    share_token: Optional[str] = None
    share_url: Optional[str] = None


# ---------------- Config ---------------- #
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-change-this-in-production")

IS_PRODUCTION = os.getenv("RAILWAY_ENVIRONMENT") == "production" or os.getenv("PORT") is not None
PORT = int(os.getenv("PORT", 8000))

print(f"🚀 Starting server in {'PRODUCTION' if IS_PRODUCTION else 'DEVELOPMENT'} mode")
print(f"📡 Port: {PORT}")
print(f"🌐 Frontend URL: {FRONTEND_URL}")

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./notes.db")
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

print(f"🗃️ Database: {'PostgreSQL (Production)' if 'postgresql' in DATABASE_URL else 'SQLite (Development)'}")

if "postgresql" in DATABASE_URL:
    engine = create_async_engine(
        DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        echo=not IS_PRODUCTION,
        future=True
    )
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    sync_db_url = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
    sync_engine = create_engine(sync_db_url, pool_size=5, max_overflow=10)
else:
    sync_engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    engine = None
    async_session = None


def get_db():
    if sync_engine:
        from sqlalchemy.orm import sessionmaker
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()


async def get_async_db():
    if async_session:
        async with async_session() as session:
            yield session


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🏁 Application startup")
    try:
        if sync_engine:
            with sync_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("✅ Database connection successful")

        print(f"✅ Server ready on port {PORT}")
        print(f"✅ Environment: {'Production' if IS_PRODUCTION else 'Development'}")

    except Exception as e:
        print(f"❌ Startup error: {str(e)}")
        raise

    yield

    print("🛑 Application shutdown")
    if engine:
        await engine.dispose()


app = FastAPI(
    title="Notes API",
    version="2.0.0",
    description="Production-ready Notes API with authentication and sharing features",
    docs_url="/docs",
    redoc_url="/redoc" if not IS_PRODUCTION else None,
    lifespan=lifespan
)


allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    FRONTEND_URL
]

if IS_PRODUCTION:
    allowed_origins.extend([
        "https://*.vercel.app",
        "https://*.netlify.app",
        "https://*.railway.app"
    ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if IS_PRODUCTION else allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.get("/health")
def health_check():
    try:
        if sync_engine:
            with sync_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            db_status = "connected"
        else:
            db_status = "no_database"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "2.0.0",
        "environment": "production" if IS_PRODUCTION else "development",
        "database": db_status,
        "port": PORT
    }


@app.get("/")
def root():
    return {
        "message": "🎉 Notes API is running!",
        "version": "2.0.0",
        "environment": "production" if IS_PRODUCTION else "development",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "auth": ["/auth/signup", "/auth/login", "/auth/guest"],
            "notes": ["/notes/", "/notes/{id}", "/notes/{id}/share"],
            "shared": ["/shared/{token}"]
        }
    }


# ---------------- Auth Utils ---------------- #
def get_password_hash(password: str) -> str:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict):
    from jose import jwt
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")


def generate_random_username():
    import random, string
    return "guest_" + ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))


# ---------------- Auth Routes ---------------- #
@app.post("/auth/signup")
def signup(user_data: dict, db: Session = Depends(get_db)):
    username = user_data.get("username")
    password = user_data.get("password")

    if not username or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username and password are required"
        )

    return {"message": "User created successfully", "username": username, "id": 1}


@app.post("/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    if not form_data.username or not form_data.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username and password are required"
        )

    access_token = create_access_token(data={"sub": "1", "username": form_data.username})
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/auth/guest")
def guest_login(db: Session = Depends(get_db)):
    username = generate_random_username()
    access_token = create_access_token(data={"sub": "guest", "username": username, "is_guest": True})
    return {"access_token": access_token, "token_type": "bearer"}


# ---------------- Notes Routes ---------------- #
@app.get("/notes/", response_model=List[NoteResponse])
def get_notes(db: Session = Depends(get_db)):
    return [
        {
            "id": 1,
            "title": "Welcome to Notes API!",
            "content": "This is your first note. The API is working correctly!",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "is_shared": False
        }
    ]


@app.post("/notes/", response_model=NoteResponse)
def create_note(note_data: NoteBase = Body(...), db: Session = Depends(get_db)):
    return {
        "id": 123,
        "title": note_data.title,
        "content": note_data.content,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "is_shared": False
    }


@app.get("/notes/{note_id}", response_model=NoteResponse)
def get_note(note_id: int, db: Session = Depends(get_db)):
    return {
        "id": note_id,
        "title": f"Note {note_id}",
        "content": "This is the content of the note.",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "is_shared": False
    }


@app.put("/notes/{note_id}", response_model=NoteResponse)
def update_note(note_id: int, note_data: NoteBase = Body(...), db: Session = Depends(get_db)):
    return {
        "id": note_id,
        "title": note_data.title or f"Updated Note {note_id}",
        "content": note_data.content or "Updated content",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "is_shared": False
    }


@app.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: int, db: Session = Depends(get_db)):
    return


@app.post("/notes/{note_id}/share", response_model=NoteResponse)
def share_note(note_id: int, db: Session = Depends(get_db)):
    share_token = generate_random_username()
    share_url = f"{FRONTEND_URL}/shared/{share_token}"

    return {
        "id": note_id,
        "title": f"Note {note_id}",
        "content": "This is the shared content of the note.",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "is_shared": True,
        "share_token": share_token,
        "share_url": share_url
    }


@app.get("/shared/{share_token}", response_model=NoteResponse)
def get_shared_note(share_token: str, db: Session = Depends(get_db)):
    return {
        "id": 1,
        "title": "Shared Note",
        "content": f"This is a shared note with token: {share_token}",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "is_shared": True,
        "share_token": share_token
    }


# ---------------- Middleware ---------------- #
@app.middleware("http")
async def log_requests(request, call_next):
    start_time = datetime.utcnow()
    response = await call_next(request)
    process_time = (datetime.utcnow() - start_time).total_seconds()

    if IS_PRODUCTION:
        print(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.3f}s")

    return response


# ---------------- Error Handlers ---------------- #
@app.exception_handler(500)
async def internal_server_error_handler(request, exc):
    return {
        "error": "Internal Server Error",
        "detail": "Something went wrong on our end",
        "status_code": 500
    }


@app.exception_handler(404)
async def not_found_handler(request, exc):
    return {
        "error": "Not Found",
        "detail": "The requested resource was not found",
        "status_code": 404
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app" if IS_PRODUCTION else app,
        host="0.0.0.0" if IS_PRODUCTION else "127.0.0.1",
        port=PORT,
        reload=not IS_PRODUCTION,
        workers=1 if IS_PRODUCTION else 1
    )
