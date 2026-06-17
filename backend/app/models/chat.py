from datetime import datetime
from pydantic import BaseModel


class ConversationOut(BaseModel):
    id: str
    user_id: str
    title: str
    created_at: str
    updated_at: str


class ConversationList(BaseModel):
    conversations: list[ConversationOut]


class ChatMessageOut(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    created_at: str


class ChatMessageList(BaseModel):
    messages: list[ChatMessageOut]


class ChatSendIn(BaseModel):
    conversation_id: str | None = None
    message: str
    document_id: str | None = None


class ChatSendOut(BaseModel):
    conversation_id: str
    user_message: ChatMessageOut
    assistant_message: ChatMessageOut
