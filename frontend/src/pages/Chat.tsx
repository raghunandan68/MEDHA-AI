import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export default function Chat() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadedDocId, setUploadedDocId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get<{ conversations: Conversation[] }>("/api/chat/conversations");
        setConversations(res.conversations);
        if (res.conversations.length > 0) {
          setActiveId(res.conversations[0].id);
        }
      } catch {
        // no conversations yet
      }
      setInitialLoading(false);
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!activeId) return;
    const fetchMessages = async () => {
      try {
        const res = await api.get<{ messages: Message[] }>(`/api/chat/conversations/${activeId}/messages`);
        setMessages(res.messages);
      } catch {
        setMessages([]);
      }
    };
    fetchMessages();
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewChat = () => {
    setActiveId(null);
    setMessages([]);
    setSending(false);
    setUploadedDocId(null);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await api.delete(`/api/chat/conversations/${id}`);
    } catch {
      // ignore
    }
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (activeId === id) {
        if (next.length > 0) {
          setActiveId(next[0].id);
        } else {
          setActiveId(null);
          setMessages([]);
        }
      }
      return next;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const doc = await api.upload<{ id: string; filename: string }>("/api/documents/upload", file);
      setUploadedDocId(doc.id);
      const msg = `📄 Uploaded: ${doc.filename}`;
      setInput(msg);
    } catch {
      // handle error
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async () => {
    if (sending) return;
    const text = input.trim();
    if (!text) return;
    setInput("");
    setSending(true);

    try {
      const res = await api.post<{
        conversation_id: string;
        user_message: Message;
        assistant_message: Message;
      }>("/api/chat/send", {
        conversation_id: activeId,
        message: text,
        document_id: uploadedDocId,
      });

      setActiveId(res.conversation_id);
      setMessages((prev) => [...prev, res.user_message, res.assistant_message]);

      setConversations((prev) => {
        const existing = prev.find((c) => c.id === res.conversation_id);
        if (existing) {
          return prev.map((c) =>
            c.id === res.conversation_id
              ? { ...c, updated_at: new Date().toISOString() }
              : c
          );
        }
        return [
          {
            id: res.conversation_id,
            title: text.slice(0, 50) + (text.length > 50 ? "\u2026" : ""),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          ...prev,
        ];
      });
    } catch {
      // handle error
    }
    setSending(false);
  };

  const isSummarizeRequest = (text: string) => {
    const t = text.toLowerCase();
    return t.includes("summarize") || t.includes("summary") || t.includes("summarise") || t.includes("summarise this");
  };

  const handleSendWithUpload = async () => {
    const text = input.trim();
    if (uploadedDocId && isSummarizeRequest(text)) {
      navigate(`/flashcards/${uploadedDocId}`);
      return;
    }
    await handleSend();
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-3 animate-fade-in">
      <button
        onClick={() => setSidebarOpen((o) => !o)}
        className="fixed bottom-4 left-4 z-20 flex h-10 w-10 items-center justify-center rounded-xl glass-nav md:hidden"
      >
        <svg className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      <aside
        className={`${
          sidebarOpen ? "flex" : "hidden"
        } md:flex w-64 shrink-0 flex-col rounded-2xl border border-white/[0.04] glass-card`}
      >
        <div className="p-3 border-b border-white/[0.04]">
          <button
            onClick={handleNewChat}
            className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-white/[0.06] hover:border-indigo-500/30"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => { setActiveId(conv.id); setSidebarOpen(false); }}
              className={`group flex items-center justify-between rounded-xl px-3 py-2 text-sm cursor-pointer transition-all duration-200 ${
                activeId === conv.id
                  ? "bg-indigo-500/10 text-indigo-200"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <svg className={`h-4 w-4 shrink-0 ${activeId === conv.id ? "text-indigo-400" : "text-slate-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
                <span className="truncate">{conv.title}</span>
              </div>
              <button
                onClick={(e) => handleDelete(e, conv.id)}
                className="shrink-0 rounded-lg p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <div className="flex-1 overflow-y-auto space-y-4 rounded-2xl border border-white/[0.04] bg-slate-900/40 backdrop-blur-sm p-4">
          {messages.length === 0 && !initialLoading && (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
              {activeId ? "No messages yet. Start a conversation!" : "Create a new chat to get started."}
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}
              style={{ animationDelay: `${i * 0.03}s` }}
            >
              <div className={`max-w-[85%] sm:max-w-[75%]`}>
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-indigo-500/20 border border-indigo-500/20 text-slate-100"
                      : "glass-card border-white/[0.04] text-slate-200"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                  <p className={`mt-1 text-[10px] ${
                    msg.role === "user" ? "text-indigo-300/50" : "text-slate-500"
                  }`}>
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {uploadedDocId && (
            <div className="flex justify-start animate-fade-in-up">
              <div className="glass-card rounded-2xl px-4 py-3 border border-violet-500/20">
                <p className="text-sm text-slate-300">
                  📄 Document uploaded!{" "}
                  <span
                    onClick={() => navigate(`/flashcards/${uploadedDocId}`)}
                    className="text-violet-400 hover:text-violet-300 underline cursor-pointer"
                  >
                    View Flashcards
                  </span>
                  {" \u2014 "}
                  or type "summarize this" to auto-generate.
                </p>
              </div>
            </div>
          )}

          {sending && (
            <div className="flex justify-start animate-fade-in-up">
              <div className="glass-card rounded-2xl rounded-tl-sm px-5 py-4 border-white/[0.04]">
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 animate-bounce-gentle rounded-full bg-indigo-400" style={{ animationDelay: "0s" }} />
                  <span className="h-2 w-2 animate-bounce-gentle rounded-full bg-purple-400" style={{ animationDelay: "0.15s" }} />
                  <span className="h-2 w-2 animate-bounce-gentle rounded-full bg-pink-400" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="relative mt-3">
          <div className="relative rounded-2xl border border-white/[0.06] bg-slate-900/60 backdrop-blur-sm transition-all duration-200 focus-within:border-indigo-500/30">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendWithUpload();
                }
              }}
              placeholder="Ask anything... Upload a PDF and type 'summarize this'"
              rows={1}
              className="block w-full resize-none rounded-2xl bg-transparent px-12 py-3 text-white placeholder:text-slate-500 outline-none text-sm"
            />

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="absolute bottom-1.5 left-1.5">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all disabled:opacity-50"
                title="Upload PDF"
              >
                {uploading ? (
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                )}
              </button>
            </div>

            <div className="absolute bottom-1.5 right-1.5">
              <button
                onClick={handleSendWithUpload}
                disabled={!input.trim() || sending}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white transition-all duration-200 hover:bg-indigo-400 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
