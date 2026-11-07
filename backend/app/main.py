"""
SkillSwap AI - FastAPI Backend Application
Software Construction & Development (SCD) Academic Project
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Set
import json

from backend.app.core.config import settings
from backend.app.routers import auth, profiles, skills, swaps, chat, ai_assistant, exchanges, stats

app = FastAPI(
    title="SkillSwap AI API",
    description="Production-grade AI-powered skill exchange platform backend.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST API Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(profiles.router, prefix="/api/profile", tags=["User Profiles"])
app.include_router(skills.router, prefix="/api", tags=["Skills & Discovery"])
app.include_router(swaps.router, prefix="/api/swaps", tags=["Swap Requests"])
app.include_router(chat.router, prefix="/api/conversations", tags=["Conversations & Chat"])
app.include_router(ai_assistant.router, prefix="/api/ai", tags=["AI Skill Assistant"])
app.include_router(exchanges.router, prefix="/api/exchanges", tags=["Exchange History"])
app.include_router(stats.router, prefix="/api/stats", tags=["Dashboard Statistics"])

# Real-time WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)

    def disconnect(self, user_id: str, websocket: WebSocket):
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            payload = json.dumps(message)
            for connection in self.active_connections[user_id]:
                await connection.send_text(payload)

manager = ConnectionManager()

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message_obj = json.loads(data)
            # Handle typing indicators & instant broadcasts
            if message_obj.get("type") == "typing":
                partner_id = message_obj.get("partner_id")
                if partner_id:
                    await manager.send_personal_message({
                        "type": "partner_typing",
                        "user_id": user_id,
                        "conversation_id": message_obj.get("conversation_id"),
                        "is_typing": message_obj.get("is_typing", False)
                    }, partner_id)
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "SkillSwap AI FastAPI Service"}
