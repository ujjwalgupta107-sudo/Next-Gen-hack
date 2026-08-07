from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from enum import Enum
from datetime import datetime

class RoleEnum(str, Enum):
    creator = "creator"
    enterprise = "enterprise"
    admin = "admin"

class UserRegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    fullName: str = Field(..., min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: Optional[RoleEnum] = RoleEnum.creator

class UserLoginRequest(BaseModel):
    loginIdentifier: str
    password: str

class SIWELoginRequest(BaseModel):
    message: str
    signature: str
    walletAddress: str

class TokenResponse(BaseModel):
    accessToken: str
    tokenType: str = "Bearer"
    expiresIn: int = 3600
    user: dict

class UserProfileResponse(BaseModel):
    id: str
    username: str
    fullName: str
    email: Optional[str] = None
    walletAddress: Optional[str] = None
    role: RoleEnum
    reputationScore: int = 100
    verified: bool = False
    createdAt: Optional[datetime] = None
