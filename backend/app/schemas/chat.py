from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field

# Shared assistant response schema (stored in content_json for assistant messages)
class ChatAction(BaseModel):
    id: str
    label: str
    params: Optional[Dict[str, Any]] = None

class ChatItemText(BaseModel):
    kind: Literal["text"]
    content: str

class ChatItemCode(BaseModel):
    kind: Literal["code"]
    content: str
    language: Optional[str] = None

class ChatItemList(BaseModel):
    kind: Literal["list"]
    content: List[str]

ChatItem = ChatItemText | ChatItemCode | ChatItemList

class ChatSection(BaseModel):
    key: str
    title: str
    collapsed: Optional[bool] = None
    items: List[ChatItem]

class ChatAssistantMessage(BaseModel):
    version: Literal["v1"] = "v1"
    summary: Optional[str] = None
    sections: List[ChatSection] = Field(default_factory=list)
    groups: Optional[List[Dict[str, Any]]] = None
    actions: Optional[List[ChatAction]] = None
    meta: Optional[Dict[str, Any]] = None

# Config per-domain
class NewChatField(BaseModel):
    key: str
    label: str
    type: Literal["text", "select", "tags"]
    required: bool = False
    options: Optional[List[Dict[str, str]]] = None  # for selects

class ChatConfig(BaseModel):
    domain_id: str
    new_chat_fields: List[NewChatField] = Field(default_factory=list)
    policy: Dict[str, Any] = Field(default_factory=dict)
    response_schema_version: Literal["v1"] = "v1"

# API payloads
class CreateSessionRequest(BaseModel):
    domain_id: str
    title: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None

class ChatSessionOut(BaseModel):
    id: int
    domain_id: str
    title: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None

class ChatMessageOut(BaseModel):
    id: int
    role: Literal["user", "assistant", "system"]
    content_json: Optional[Dict[str, Any]] = None
    content_text: Optional[str] = None

class PostMessageRequest(BaseModel):
    content: str
    meta: Optional[Dict[str, Any]] = None
    attachments: Optional[List[Dict[str, Any]]] = None
