from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class UserSkillSchema(BaseModel):
    id: str
    name: str
    category: str
    level: str # 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
    experienceYears: Optional[int] = 1
    description: Optional[str] = None

class UserProfileSchema(BaseModel):
    id: str
    name: str
    email: Optional[EmailStr] = None
    avatar: str
    location: str
    title: str
    bio: str
    skillsToTeach: List[UserSkillSchema] = []
    skillsToLearn: List[str] = []
    experience: Optional[str] = ""
    education: Optional[str] = ""
    interests: List[str] = []
    availability: Optional[str] = ""
    learningGoals: Optional[str] = ""
    joinedDate: str
    rating: Optional[float] = 5.0
    exchangesCompleted: Optional[int] = 0

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=6)
    location: str = Field(..., min_length=2)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: Optional[EmailStr] = None
    location: str
    createdAt: str
    profile: UserProfileSchema

class TokenResponse(BaseModel):
    token: str
    user: UserResponse
    message: str

class SwapRequestCreate(BaseModel):
    receiverId: str
    offeredSkill: str
    requestedSkill: str
    message: str

class SwapRequestResponse(BaseModel):
    id: str
    senderId: str
    senderName: str
    senderAvatar: str
    senderLocation: str
    receiverId: str
    receiverName: str
    receiverAvatar: str
    receiverLocation: str
    offeredSkill: str
    requestedSkill: str
    message: str
    status: str
    createdAt: str
    updatedAt: str

class MeetingSchema(BaseModel):
    provider: str
    url: str
    title: Optional[str] = None

class MessageCreate(BaseModel):
    content: str
    meeting: Optional[MeetingSchema] = None

class MessageResponse(BaseModel):
    id: str
    conversationId: str
    senderId: str
    senderName: str
    senderAvatar: str
    content: str
    meeting: Optional[MeetingSchema] = None
    createdAt: str
    read: bool

class AIChatRequest(BaseModel):
    prompt: str
    conversationHistory: Optional[List[dict]] = []

class AIChatResponse(BaseModel):
    reply: str
