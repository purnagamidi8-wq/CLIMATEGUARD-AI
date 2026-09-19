from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ChatRequest, ChatResponse
from app.agents.climate_agent import climate_agent
from app.api.auth import get_current_user, security
from app.models import User, ChatMessage
from fastapi.security import HTTPAuthorizationCredentials
import uuid

router = APIRouter(prefix="/api/chat", tags=["AI Chat"])

@router.post("/", response_model=ChatResponse)
async def chat_with_agent(request: ChatRequest, credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    user = None
    if credentials:
        try:
            user = get_current_user(credentials, db)
        except Exception:
            pass

    session_id = request.session_id or str(uuid.uuid4())
    result = await climate_agent.chat(
        message=request.message,
        location=request.location,
        language=request.language or "en",
        profile_type=request.profile_type or "general"
    )

    if user:
        db.add(ChatMessage(user_id=user.id, session_id=session_id, role="user", message=request.message))
        db.add(ChatMessage(user_id=user.id, session_id=session_id, role="assistant", message=result["response"], metadata_json={"sources": result.get("sources", []), "hazards": result.get("hazards_detected", [])}))
        db.commit()

    result["session_id"] = session_id
    return result

@router.get("/history")
def get_chat_history(session_id: str = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id)
    if session_id:
        query = query.filter(ChatMessage.session_id == session_id)
    messages = query.order_by(ChatMessage.created_at.desc()).limit(50).all()
    return [{"role": m.role, "message": m.message, "created_at": m.created_at.isoformat(), "session_id": m.session_id} for m in reversed(messages)]
