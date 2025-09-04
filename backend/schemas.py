from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class UserLogin(UserBase):
    password: str

class User(UserBase):
    id: int
    is_guest: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    is_guest: Optional[bool] = None

class NoteBase(BaseModel):
    title: str
    content: Optional[str] = ""

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class NoteShareResponse(BaseModel):
    id: int
    is_shared: bool
    share_token: str
    share_url: str
    title: str
    content: Optional[str] = ""
    created_at: datetime
    updated_at: datetime
    user_id: int

    class Config:
        from_attributes = True

class Note(NoteBase):
    id: int
    is_shared: bool
    share_token: Optional[str]
    created_at: datetime
    updated_at: datetime
    user_id: int

    class Config:
        from_attributes = True
