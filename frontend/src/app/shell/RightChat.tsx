import { useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { getChatConfig, type ChatConfig, createChatSession, listMessages, postMessage as apiPostMessage, listChatSessions, type ChatSession as ApiSession } from "@/app/api/chat";

type Msg = { role: "user" | "assistant"; text: string; at: number };
type Turn = { topic: string; user: Msg; replies: Msg[] };
type ChatMeta = Record<string, string>;
type ChatSession = { id: string; title: string; createdAt: number; updatedAt: number; messages: Msg[]; meta?: ChatMeta; closed: boolean };

export default function RightChat({ domainId }: { domainId?: string }) {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", text: "Hi! Ask me anything about the current context.", at: Date.now() },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [showHistory, setShowHistory] = useState(false);
  const [histories, setHistories] = useState<ChatSession[]>([]);
  // Remote sessions (API-backed history)
  const [sessions, setSessions] = useState<ApiSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [expandAllMode, setExpandAllMode] = useState(false);
  // Metadata / gating state
  const [activeChatMeta, setActiveChatMeta] = useState<ChatMeta | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatForm, setNewChatForm] = useState<ChatMeta>({});
  const [chatConfig, setChatConfig] = useState<ChatConfig | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  // Attachments state
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // Guard against duplicate saves
  const lastSavedSigRef = useRef<string | null>(null);
  const saveSeqRef = useRef(0);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  // Auto-resize input to fit content
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, window.innerHeight * 0.4) + "px"; // cap at ~40vh
  }, [input]);

  // Build "turns": a user message followed by one or more assistant replies
  const turns: Turn[] = useMemo(() => {
    const out: Turn[] = [];
    let current: Turn | null = null;
    for (const m of messages) {
      if (m.role === "user") {
        // finalize previous turn
        if (current) out.push(current);
        current = { topic: summarizeTopic(m.text), user: m, replies: [] };
      } else {
        if (!current) {
          // skip any leading assistant messages until first user message
          continue;
        }
        current.replies.push(m);
      }
    }
    if (current) out.push(current);
    return out;
  }, [messages]);

  function summarizeTopic(text: string): string {
    // Take first 4–5 words, strip punctuation, capitalize first letter
    const words = text
      .replace(/[\n\r]+/g, " ")
      .trim()
      .split(/\s+/)
      .slice(0, 5)
      .map(w => w.replace(/^[^\w]+|[^\w]+$/g, ""))
      .filter(Boolean);
    const topic = words.join(" ");
    if (!topic) return "Your prompt";
    return topic.charAt(0).toUpperCase() + topic.slice(1);
  }

  // Render assistant feedback with one-level sections (lines starting with "## ")
  function renderAssistantSections(text: string) {
    const lines = text.split(/\r?\n/);
    type Sec = { title: string; lines: string[] };
    const sections: Sec[] = [];
    let current: Sec | null = null;
    for (const raw of lines) {
      const line = raw.trimEnd();
      const m = line.match(/^##\s+(.*)$/);
      if (m) {
        if (current) sections.push(current);
        current = { title: m[1].trim(), lines: [] };
      } else {
        if (!current) current = { title: "", lines: [] };
        current.lines.push(line);
      }
    }
    if (current) sections.push(current);

    const renderBlock = (blockLines: string[], keyBase: string) => {
      const nodes: JSX.Element[] = [];
      let para: string[] = [];
      let list: string[] = [];
      const flushPara = () => {
        if (para.length) {
          nodes.push(
            <p key={`${keyBase}-p-${nodes.length}`} className="mb-2 whitespace-pre-wrap">
              {para.join(" ")}
            </p>
          );
          para = [];
        }
      };
      const flushList = () => {
        if (list.length) {
          nodes.push(
            <ul key={`${keyBase}-ul-${nodes.length}`} className="mb-2 list-disc pl-5">
              {list.map((li, i) => (
                <li key={`${keyBase}-li-${i}`}>{li}</li>
              ))}
            </ul>
          );
          list = [];
        }
      };
      for (const l of blockLines) {
        if (!l.trim()) {
          flushPara();
          flushList();
          continue;
        }
        if (/^[-*]\s+/.test(l)) {
          flushPara();
          list.push(l.replace(/^[-*]\s+/, ""));
        } else {
          flushList();
          para.push(l);
        }
      }
      flushPara();
      flushList();
      return nodes;
    };

    return (
      <div className="space-y-2">
        {sections.map((s, i) => (
          <div key={`sec-${i}`}>
            {s.title && <div className="text-xs font-semibold text-gray-700 mb-1">{s.title}</div>}
            <div>{renderBlock(s.lines, `sec-${i}`)}</div>
          </div>
        ))}
      </div>
    );
  }

  async function send(overrideText?: string) {
    const raw = overrideText ?? input;
    if (!raw.trim()) return;
    if (!sessionId) return; // must have an active session
    const now = Date.now();
    const userText = raw.trim();
    try {
      await apiPostMessage(sessionId, userText);
      // Refresh history from backend
      const msgs = await listMessages(sessionId);
      const mapped: Msg[] = msgs.map(m => ({
        role: m.role as "user" | "assistant",
        text: m.content_text || (m.content_json?.summary ?? ""),
        at: now, // backend currently doesn't return timestamps; use now for ordering
      }));
      setMessages(mapped);
      setOptions((prev) => (prev.length ? prev : defaultNextActions()));
    } catch (e) {
      console.error("Failed to send message", e);
    }
    setInput("");
    // Auto-collapse previous card behavior is now driven by refreshed history
  }

  function chooseOption(opt: string) {
    // Clicking only: send the option text directly
    send(opt);
  }

  function defaultNextActions(): string[] {
    return [
      "Expand further on task generation",
      "Create table of tasks",
      "Not sure – give more context or simpler explanation",
      "Give requirements for review",
    ];
  }

  function buildAssistantStubResponse(userText: string): string {
    // Example structured feedback with one grouping level using markdown-like sections
    // Do not echo back the user's request.
    return [
      `## Suggestions`,
      `- We can break this into tasks and estimates`,
      `- Identify any constraints or unknowns`,
    ].join("\n");
  }

  // no timestamp rendering per design

  // Header actions
  async function newChat() {
    if (!domainId) {
      console.warn("New chat disabled: no domainId provided");
      return;
    }
    // Save existing chat before resetting and opening metadata modal
    saveCurrentToHistory(true);
    setMessages([{ role: "assistant", text: "Hi! Ask me anything about the current context.", at: Date.now() }]);
    setOptions([]);
    setExpanded({});
    setInput("");
    setShowHistory(false);
    setExpandAllMode(false);
    setActiveChatMeta(null);
    setAttachments([]);
    setSessionId(null);
    try {
      const cfg = await getChatConfig(domainId);
      setChatConfig(cfg);
      // initialize form from fields
      const init: Record<string, string> = {};
      for (const f of cfg.new_chat_fields) init[f.key] = "";
      setNewChatForm(init);
    } catch (e) {
      console.error("Failed to load chat config", e);
      setChatConfig(null);
    }
    setShowNewChatModal(true);
  }

  // Removed: explicit closeCurrentChat. Chats are saved and reset when selecting New chat or opening History.

  async function toggleHistory() {
    if (!domainId) {
      console.warn("History disabled: no domainId provided");
      setShowHistory(true);
      setSessions([]);
      return;
    }
    // Open-only behavior: if already showing history, keep it open.
    setShowHistory((prev) => {
      if (prev) return true;
      // Opening history: save current chat if it has user messages, then clear chat area
      saveCurrentToHistory(true);
      setMessages([{ role: "assistant", text: "Hi! Ask me anything about the current context.", at: Date.now() }]);
      setOptions([]);
      setExpanded({});
      setInput("");
      setExpandAllMode(false);
      setActiveChatMeta(null); // while in history, no active chat
      setAttachments([]);
      return true;
    });
    // Fetch sessions for current domain
    try {
      setSessionsLoading(true);
      setSessionsError(null);
      const data = await listChatSessions(domainId);
      setSessions(data);
    } catch (e) {
      console.error("Failed to load sessions", e);
      setSessionsError("Failed to load sessions");
    } finally {
      setSessionsLoading(false);
    }
  }

  // --- History helpers ---
  function deriveTitle(msgs: Msg[], meta?: ChatMeta): string {
    const maybe = meta && (meta["title"] || meta["topic"]);
    if (maybe && maybe.trim()) return maybe.trim();
    const firstUser = msgs.find(m => m.role === "user");
    if (firstUser) return summarizeTopic(firstUser.text);
    const firstAssistant = msgs.find(m => m.role === "assistant");
    return firstAssistant ? summarizeTopic(firstAssistant.text) : "Chat";
  }

  function saveCurrentToHistory(closed: boolean = false) {
    // Only save if there is at least one user message
    const hasUser = messages.some(m => m.role === "user");
    if (!hasUser) return;
    // Build a simple signature of the conversation to avoid duplicate saves
    const sig = JSON.stringify(messages.map(m => [m.role, m.text, m.at]));
    if (lastSavedSigRef.current === sig) return;
    const now = Date.now();
    const session: ChatSession = {
      id: `${now}-${++saveSeqRef.current}`,
      title: deriveTitle(messages, activeChatMeta || undefined),
      createdAt: now,
      updatedAt: now,
      messages: [...messages],
      meta: activeChatMeta || undefined,
      closed,
    };
    setHistories(prev => [session, ...prev].slice(0, 50)); // keep recent 50 locally
    lastSavedSigRef.current = sig;
  }

  async function openSession(s: ApiSession) {
    try {
      const msgs = await listMessages(s.id);
      const mapped: Msg[] = msgs.map(m => ({
        role: m.role as "user" | "assistant",
        text: m.content_text || (m.content_json?.summary ?? ""),
        at: Date.now(),
      }));
      setMessages(mapped.length ? mapped : [{ role: "assistant", text: "Hi! Ask me anything about the current context.", at: Date.now() }]);
      setSessionId(s.id);
      setOptions([]);
      setExpanded({});
      setInput("");
      setShowHistory(false);
      setExpandAllMode(false);
      setActiveChatMeta((s.meta as Record<string, string>) || {});
      setAttachments([]);
    } catch (e) {
      console.error("Failed to open session", e);
    }
  }

  // Removed: closeHistory. Sessions are considered closed when saved via New chat/History.

  function deleteHistory(id: string) {
    setHistories(prev => prev.filter(h => h.id !== id));
  }

  // Add a subtle top gap when role changes to group user input with following assistant output
  const withBoundaries = useMemo(() =>
    messages.map((m, i) => ({
      ...m,
      newTurn: i === 0 || messages[i - 1].role !== m.role,
    })), [messages]);

  // Bulk expand/collapse for all turn cards
  function expandAll() {
    // Clear overrides to default open
    setExpanded({});
    setExpandAllMode(true);
  }

  function collapseAll() {
    // Set all indices to false (collapsed)
    const next: Record<number, boolean> = {};
    for (let i = 0; i < turns.length; i++) next[i] = false;
    setExpanded(next);
    setExpandAllMode(false);
  }

  function onScrollWheel(e: React.WheelEvent<HTMLDivElement>) {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const atTop = scrollTop <= 0;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1;
    if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  // capture-phase handlers are inlined in JSX to avoid identifier resolution issues

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden">
      {showNewChatModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30">
          <div className="w-[520px] max-w-[92vw] rounded-lg border border-gray-200 bg-white shadow-xl p-4">
            <div className="text-sm font-semibold text-gray-800 mb-3">Start a new chat</div>
            <div className="space-y-3">
              {(chatConfig?.new_chat_fields ?? []).map((f) => (
                <div key={f.key}>
                  <label className="block text-xs text-gray-600 mb-1">
                    {f.label}{f.required ? " *" : ""}
                  </label>
                  {f.type === "select" ? (
                    <select
                      value={(newChatForm as any)[f.key] ?? ""}
                      onChange={(e) => setNewChatForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    >
                      <option value="">Select...</option>
                      {(f.options ?? []).map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={(newChatForm as any)[f.key] ?? ""}
                      onChange={(e) => setNewChatForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
                      placeholder={f.label}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 text-xs"
                onClick={() => { setShowNewChatModal(false); /* remain disabled until new chat started */ }}
              >Cancel</button>
              <button
                className="px-3 py-1.5 rounded bg-sky-600 text-white hover:bg-sky-700 text-xs"
                onClick={async () => {
                  // Validate required fields
                  const missing = (chatConfig?.new_chat_fields ?? []).filter(f => f.required && !String((newChatForm as any)[f.key] ?? "").trim());
                  if (missing.length) return; // TODO: show inline validation
                  try {
                    if (!domainId) return; // safety: require domain
                    const titleCandidate = (newChatForm as any).topic || (newChatForm as any).project || (newChatForm as any).title || "";
                    const payload: any = {
                      domain_id: chatConfig?.domain_id ?? domainId,
                      meta: { ...newChatForm },
                    };
                    if (String(titleCandidate).trim()) payload.title = String(titleCandidate).trim();
                    const session = await createChatSession(payload);
                    setSessionId(session.id);
                    setActiveChatMeta({ ...newChatForm });
                    setShowNewChatModal(false);
                    // reset message area to fresh greeting
                    setMessages([{ role: "assistant", text: "Hi! Ask me anything about the current context.", at: Date.now() }]);
                    setOptions([]);
                    setExpanded({});
                    setInput("");
                  } catch (e) {
                    console.error("Failed to create chat session", e);
                  }
                }}
              >Start chat</button>
            </div>
          </div>
        </div>
      )}
      <div className="px-3 py-2 border-b border-border-subtle">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-ui font-semibold text-gray-800">AI Agent Chat</h3>
          <div className="relative" onKeyDown={(e) => { if (e.key === 'Escape') setShowMenu(false); }}>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={showMenu}
              className="p-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50"
              onClick={() => setShowMenu(v => !v)}
              onBlur={(e) => {
                // Close if focus leaves the menu container
                if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) setShowMenu(false);
              }}
            >
              {/* Hamburger icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-700">
                <path d="M3 5.5h14a.5.5 0 000-1H3a.5.5 0 000 1zm0 5h14a.5.5 0 000-1H3a.5.5 0 000 1zm0 5h14a.5.5 0 000-1H3a.5.5 0 000 1z" />
              </svg>
            </button>
            {showMenu && (
              <div
                role="menu"
                className="absolute right-0 mt-1 z-20 w-40 rounded-md border border-gray-200 bg-white shadow-lg py-1"
              >
                <button role="menuitem" className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50"
                  onClick={() => { newChat(); setShowMenu(false); }}>New chat</button>
                <button role="menuitem" className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50"
                  onClick={() => { toggleHistory(); setShowMenu(false); }}>History</button>
                <div className="my-1 h-px bg-gray-200" />
                <button role="menuitem" className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50"
                  onClick={() => { expandAll(); setShowMenu(false); }}>Expand all</button>
                <button role="menuitem" className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50"
                  onClick={() => { collapseAll(); setShowMenu(false); }}>Collapse all</button>
              </div>
            )}
          </div>
        </div>
      </div>
      {showHistory && (
        <div className="px-3 py-2 border-b border-border-subtle bg-neutral-50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">History</div>
            <div className="text-[11px] text-gray-500">Select a chat to continue</div>
          </div>
          <div className="mt-2">
            {sessionsLoading && <div className="text-[11px] text-gray-500">Loading…</div>}
            {sessionsError && <div className="text-[11px] text-red-600">{sessionsError}</div>}
            {!sessionsLoading && !sessionsError && (
              <div className="max-h-56 overflow-auto divide-y divide-gray-200 bg-white border border-gray-200 rounded">
                {sessions.length === 0 && (
                  <div className="px-3 py-2 text-[11px] text-gray-500">No sessions yet.</div>
                )}
                {sessions.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center justify-between"
                    onClick={() => openSession(s)}
                  >
                    <span className="truncate mr-2">
                      {(!s.title || ["chat", "my first chat"].includes(String(s.title).toLowerCase())) ? "Untitled" : s.title}
                    </span>
                    <span className="text-[10px] text-gray-400">#{s.id}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <div
        ref={scrollRef}
        onWheel={onScrollWheel}
        onWheelCapture={(e) => { e.stopPropagation(); }}
        onTouchMoveCapture={(e) => { (e as any).stopPropagation?.(); e.stopPropagation(); }}
        className="flex-1 min-h-0 overflow-auto overscroll-contain pl-3 pr-1 py-2 space-y-3 [contain:content]"
        style={{ overscrollBehavior: "contain" }}
      >
        {turns.map((t, idx) => (
          <div key={idx} className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
            <div className="flex items-center justify-between gap-2 border-l-4 border-l-sky-500 pl-3 mb-2">
              <div className="text-xs font-semibold text-gray-700 truncate">{t.topic}</div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="text-[11px] px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50"
                  onClick={() => setExpanded((s) => ({ ...s, [idx]: !(s[idx] ?? true) }))}
                >
                  {(expanded[idx] ?? true) ? "Collapse" : "Expand"}
                </button>
              </div>
            </div>
            {(expanded[idx] ?? true) && (
              <>
                {/* User row */}
                <div className="flex justify-start w-full">
                  <div className="flex items-start gap-2 w-full">
                    <div className="h-7 w-7 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold bg-sky-600 text-white">You</div>
                    <div className="flex-1 min-w-0">
                      <div className="w-full px-3 py-2 rounded-2xl text-sm break-words border border-gray-300 bg-transparent text-gray-900">{t.user.text}</div>
                    </div>
                  </div>
                </div>
                {/* Assistant replies */}
                {t.replies.map((r, i) => (
                  <div key={i} className="mt-2 flex justify-start w-full">
                    <div className="flex items-start gap-2 w-full">
                      <div className="h-7 w-7 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold bg-gray-200 text-gray-800">AI</div>
                      <div className="flex-1 min-w-0">
                        <div className="w-full px-3 py-2 rounded-2xl text-sm break-words border border-gray-300 bg-transparent text-gray-900">
                          {renderAssistantSections(r.text)}
                        </div>
                        {idx === turns.length - 1 && i === t.replies.length - 1 && options.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">Optional actions</div>
                            <div className="flex flex-wrap gap-2">
                              {options.map((opt, n) => (
                                <button
                                  key={n}
                                  type="button"
                                  onClick={() => chooseOption(opt)}
                                  className="text-xs px-2 py-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-left whitespace-normal break-words"
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      {/* Attachments chips (if any) */}
      {attachments.length > 0 && (
        <div className="px-2 pt-2 flex flex-wrap gap-1 border-t border-border-subtle bg-white">
          {attachments.slice(0, 5).map((f, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-100 text-[11px] text-neutral-700 border border-neutral-200" title={f.name}>
              <svg viewBox="0 0 20 20" className="w-3 h-3" fill="currentColor"><path d="M8 4a3 3 0 00-3 3v6a4 4 0 008 0V8a2 2 0 10-4 0v5a1 1 0 102 0V8h2v5a3 3 0 11-6 0V7a4 4 0 118 0v6h1V7a5 5 0 10-10 0v6a5 5 0 0010 0V8h-1v5a4 4 0 11-8 0V7a3 3 0 016 0v6a2 2 0 11-4 0V8h1v5a1 1 0 102 0V7a3 3 0 10-6 0v6a4 4 0 108 0V7h1v6a5 5 0 11-10 0V7a6 6 0 1112 0v6a6 6 0 11-12 0V7a7 7 0 1114 0v6a7 7 0 11-14 0V7A8 8 0 0116 7v6a8 8 0 11-16 0V7A9 9 0 1117 7v6a9 9 0 11-18 0V7A10 10 0 1118 7v6a10 10 0 11-20 0V7A11 11 0 1119 7v6a11 11 0 11-22 0V7A12 12 0 1120 7v6a12 12 0 11-24 0"/></svg>
              <span className="truncate max-w-[120px]">{f.name}</span>
            </span>
          ))}
          {attachments.length > 5 && (
            <span className="text-[11px] text-neutral-600">+{attachments.length - 5} more</span>
          )}
        </div>
      )}

      <form
        className="p-2 border-t border-border-subtle flex items-start gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (showHistory || !activeChatMeta) return; // block unless active chat started
          send();
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length) setAttachments((prev) => [...prev, ...files].slice(0, 10));
            // reset input value so the same file can be selected again if needed
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
        />
        <button
          type="button"
          className="p-2 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Add files/photos"
          aria-label="Add files/photos"
          onClick={() => fileInputRef.current?.click()}
          disabled={showHistory || !activeChatMeta}
        >
          <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor"><path d="M10 4a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V5a1 1 0 011-1z"/></svg>
        </button>
        <textarea
          ref={inputRef}
          className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none overflow-auto placeholder:text-xs placeholder:text-neutral-500"
          placeholder={
            showHistory
              ? "Viewing history — start a new chat or select one"
              : (!activeChatMeta ? "Start a new chat from the menu, or open History to continue" : "Ask for help...")
          }
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (showHistory || !activeChatMeta) return; // ignore typing shortcuts while disabled
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          disabled={showHistory || !activeChatMeta}
          autoFocus
        />
      </form>
    </div>
  );
}
