from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import User, RiskAssessment, Alert, ChatMessage, KnowledgeDocument
from app.api.auth import get_current_user
from app.rag.vector_store import rag_store

router = APIRouter(prefix="/api/admin", tags=["Admin"])

def require_admin(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@router.get("/analytics")
def get_analytics(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    total_users = db.query(func.count(User.id)).scalar()
    total_chats = db.query(func.count(ChatMessage.id)).scalar()
    total_alerts = db.query(func.count(Alert.id)).scalar()
    return {
        "total_users": total_users,
        "total_chat_messages": total_chats,
        "total_alerts": total_alerts,
        "rag_documents": rag_store.collection.count() if rag_store.collection else 0,
        "system_status": "operational"
    }

@router.get("/users")
def list_users(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.created_at.desc()).limit(50).all()
    return [{"id": u.id, "name": u.name, "email": u.email, "profile_type": u.profile_type, "preferred_language": u.preferred_language, "created_at": u.created_at.isoformat()} for u in users]

@router.post("/knowledge")
def add_knowledge_document(title: str, content: str, hazard_type: str, language: str = "en", source: str = "Admin Upload", admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    doc = KnowledgeDocument(title=title, content=content, hazard_type=hazard_type, language=language, source=source)
    db.add(doc)
    db.commit()
    doc_id = f"admin_{doc.id}_{hazard_type}"
    rag_store.add_document(doc_id, content, hazard_type, language, source)
    return {"message": "Knowledge document added successfully", "id": doc.id}

@router.get("/health")
def system_health():
    return {"status": "healthy", "service": "ClimateGuard AI", "version": "1.0.0"}
