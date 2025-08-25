import { apiFetch } from "@/app/api/client";

export type ChatAction = { id: string; label: string; params?: Record<string, unknown> };
export type ChatItem =
  | { kind: "text"; content: string }
  | { kind: "code"; content: string; language?: string }
  | { kind: "list"; content: string[] };
export type ChatSection = { key: string; title: string; collapsed?: boolean; items: ChatItem[] };
export type ChatAssistantMessage = {
  version: "v1";
  summary?: string;
  sections: ChatSection[];
  groups?: Array<{ id: string; title: string; sectionKeys: string[] }>;
  actions?: ChatAction[];
  meta?: Record<string, unknown>;
};

export type NewChatField = {
  key: string;
  label: string;
  type: "text" | "select" | "tags";
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
};

export type ChatConfig = {
  domain_id: string;
  new_chat_fields: NewChatField[];
  policy: Record<string, unknown>;
  response_schema_version: "v1";
};

export type ChatSession = {
  id: number;
  domain_id: string;
  title?: string;
  meta?: Record<string, unknown>;
  tags?: string[];
};

export type ChatMessage = {
  id: number;
  role: "user" | "assistant" | "system";
  content_json?: ChatAssistantMessage;
  content_text?: string;
};

export async function getChatConfig(domainId: string): Promise<ChatConfig> {
  return apiFetch(`/api/v1/chat/config/${encodeURIComponent(domainId)}`);
}

export async function listChatSessions(domainId?: string): Promise<ChatSession[]> {
  const qs = domainId ? `?domain_id=${encodeURIComponent(domainId)}` : "";
  return apiFetch(`/api/v1/chat/sessions${qs}`);
}

export async function createChatSession(payload: {
  domain_id: string;
  title?: string;
  meta?: Record<string, unknown>;
  tags?: string[];
}): Promise<ChatSession> {
  return apiFetch(`/api/v1/chat/sessions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listMessages(sessionId: number): Promise<ChatMessage[]> {
  return apiFetch(`/api/v1/chat/sessions/${sessionId}/messages`);
}

export async function postMessage(sessionId: number, content: string): Promise<ChatMessage> {
  return apiFetch(`/api/v1/chat/sessions/${sessionId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}
