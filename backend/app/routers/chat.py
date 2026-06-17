from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Header

from app.database import get_supabase, get_user_id
from app.models.chat import (
    ConversationOut, ConversationList,
    ChatMessageOut, ChatMessageList,
    ChatSendIn, ChatSendOut,
)
from app.services.ai_service import generate_chat_response
from app.services.pdf_processor import extract_text, UPLOAD_DIR

router = APIRouter(prefix="/api/chat", tags=["chat"])


def _extract_token(authorization: str) -> str:
    if authorization.startswith("Bearer "):
        return authorization[7:]
    return authorization


@router.get("/conversations", response_model=ConversationList)
async def list_conversations(authorization: str = Header("")):
    token = _extract_token(authorization)
    user_id = get_user_id(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    supabase = get_supabase()
    resp = supabase.table("conversations").select("*").eq("user_id", user_id).order("updated_at", desc=True).execute()
    convs = [ConversationOut(**c) for c in resp.data] if resp.data else []
    return ConversationList(conversations=convs)


@router.get("/conversations/{conv_id}/messages", response_model=ChatMessageList)
async def get_messages(conv_id: str, authorization: str = Header("")):
    token = _extract_token(authorization)
    user_id = get_user_id(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    supabase = get_supabase()
    resp = supabase.table("chat_messages").select("*").eq("conversation_id", conv_id).order("created_at").execute()
    msgs = [ChatMessageOut(**m) for m in resp.data] if resp.data else []
    return ChatMessageList(messages=msgs)


@router.delete("/conversations/{conv_id}")
async def delete_conversation(conv_id: str, authorization: str = Header("")):
    token = _extract_token(authorization)
    user_id = get_user_id(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    supabase = get_supabase()
    supabase.table("conversations").delete().eq("id", conv_id).eq("user_id", user_id).execute()
    return {"message": "Conversation deleted"}


@router.post("/send", response_model=ChatSendOut)
async def send_message(body: ChatSendIn, authorization: str = Header("")):
    token = _extract_token(authorization)
    user_id = get_user_id(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    supabase = get_supabase()
    now = datetime.now(timezone.utc).isoformat()

    conv_id = body.conversation_id
    if not conv_id:
        conv_resp = supabase.table("conversations").insert({
            "user_id": user_id,
            "title": body.message[:50] + ("…" if len(body.message) > 50 else ""),
        }).execute()
        if not conv_resp.data:
            raise HTTPException(status_code=500, detail="Failed to create conversation")
        conv_id = conv_resp.data[0]["id"]

    user_msg_resp = supabase.table("chat_messages").insert({
        "conversation_id": conv_id,
        "role": "user",
        "content": body.message,
    }).execute()
    if not user_msg_resp.data:
        raise HTTPException(status_code=500, detail="Failed to save message")

    context = ""
    if body.document_id:
        doc_resp = supabase.table("documents").select("*").eq("id", body.document_id).eq("user_id", user_id).execute()
        if doc_resp.data:
            doc = doc_resp.data[0]
            filename = doc["file_path"].split("/")[-1]
            file_path = str(UPLOAD_DIR / filename)
            context = extract_text(file_path)

    ai_response = generate_chat_response(body.message, context=context)

    assistant_msg_resp = supabase.table("chat_messages").insert({
        "conversation_id": conv_id,
        "role": "assistant",
        "content": ai_response,
    }).execute()

    supabase.table("conversations").update({"updated_at": now}).eq("id", conv_id).execute()

    return ChatSendOut(
        conversation_id=conv_id,
        user_message=ChatMessageOut(**user_msg_resp.data[0]),
        assistant_message=ChatMessageOut(**assistant_msg_resp.data[0]) if assistant_msg_resp.data else ChatMessageOut(
            id="", conversation_id=conv_id, role="assistant", content=ai_response, created_at=now,
        ),
    )
