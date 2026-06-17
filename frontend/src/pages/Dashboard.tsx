import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { api } from "../lib/api";
import type { User, Document, QuizAttempt } from "../types";

export default function Dashboard() {
  const { user } = useOutletContext<{ user: User }>();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [attempts, setAttempts] = useState<(QuizAttempt & { document_name: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasting, setPasting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsRes, analyticsRes] = await Promise.all([
          api.get<{ documents: Document[] }>("/api/documents"),
          api.get<{ recent_attempts: (QuizAttempt & { document_name: string })[] }>("/api/analytics/overview"),
        ]);
        setDocuments(docsRes.documents.slice(0, 5));
        setAttempts(analyticsRes.recent_attempts ?? []);
      } catch {
        // silently handle - user may have no documents yet
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const doc = await api.upload<Document>("/api/documents/upload", file);
      setDocuments(prev => [doc, ...prev]);
    } catch {
      // handle error
    }
    setUploading(false);
  };

  const handleDelete = async (docId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this document?")) return;
    try {
      await api.delete(`/api/documents/${docId}`);
      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch {
      // handle error
    }
  };

  const handlePasteSubmit = async () => {
    const text = pasteText.trim();
    if (!text) return;
    setPasting(true);
    try {
      const doc = await api.post<Document>("/api/documents/from-text", { text });
      setDocuments(prev => [doc, ...prev]);
      setShowPaste(false);
      setPasteText("");
    } catch {
      // handle error
    }
    setPasting(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-64 mb-4" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2].map((i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const avgScore = attempts.length > 0
    ? Math.round(attempts.reduce((s, a) => s + (a.score / a.total) * 100, 0) / attempts.length)
    : 0;

  return (
    <div className="animate-fade-in space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Hello, {user.name || "there"} <span className="animate-bounce-gentle">👋</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Upload your notes or paste text to get started</p>
        </div>
        
        <div className="flex items-center gap-3 bg-medha-card rounded-full pl-3 pr-1 py-1 border border-white/5">
          <span className="text-xs text-slate-300 font-medium">{user.name || user.email}</span>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
            {(user.name || user.email)[0].toUpperCase()}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <label className="bg-medha-card hover:bg-slate-900/40 border-dashed border-2 border-violet-500/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group hover:border-violet-500/40">
          <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" disabled={uploading} />
          <div className="h-16 w-16 bg-violet-600/10 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300">
            <span className="text-3xl text-violet-400">{uploading ? "⏳" : "📤"}</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-1">{uploading ? "Uploading..." : "Upload File"}</h3>
          <p className="text-xs text-slate-500 mb-2">PDF only</p>
          <p className="text-xs text-slate-400">Drag & drop or click to upload</p>
        </label>

        <div
          onClick={() => setShowPaste(true)}
          className="bg-medha-card hover:bg-slate-900/40 border border-violet-500/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group"
        >
          <div className="h-16 w-16 bg-violet-600/10 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300">
            <span className="text-3xl text-violet-400">📝</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Paste Text</h3>
          <p className="text-xs text-slate-400">Paste your study material or any text here</p>
        </div>
      </div>

      {showPaste && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowPaste(false)}>
          <div className="bg-medha-card rounded-2xl p-6 w-full max-w-lg border border-white/5 mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-1">Paste Text</h3>
            <p className="text-xs text-slate-400 mb-4">Paste your study material below to create a document.</p>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={10}
              className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500 resize-none"
              placeholder="Paste your text here..."
            />
            <div className="flex gap-3 mt-4 justify-end">
              <button onClick={() => setShowPaste(false)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-all">
                Cancel
              </button>
              <button onClick={handlePasteSubmit} disabled={pasting || !pasteText.trim()} className="bg-medha-button text-white rounded-xl px-4 py-2 text-xs font-bold shadow-lg shadow-violet-500/20 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50">
                {pasting ? "Creating..." : "Create Document"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Recent Documents</h2>
          <Link to="/dashboard" className="text-xs font-semibold text-violet-400 cursor-pointer hover:underline">View all</Link>
        </div>

        {documents.length === 0 ? (
          <div className="bg-medha-card rounded-2xl p-8 text-center text-slate-400 text-sm">
            No documents uploaded yet. Upload a PDF above to get started!
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-medha-card hover:bg-[#1b1535] rounded-xl p-4 transition-all duration-200 border border-white/5 hover:border-violet-500/30 flex flex-col justify-between space-y-4 group relative"
              >
                <Link to={`/flashcards/${doc.id}`} className="space-y-3 flex-1">
                  <div className="flex justify-between items-start">
                    <span className={`${doc.filename.endsWith('.txt') ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'} text-[10px] font-bold px-2 py-0.5 rounded`}>{doc.filename.endsWith('.txt') ? 'TEXT' : 'PDF'}</span>
                    <span className="text-xs text-slate-500">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white truncate">{doc.filename}</h4>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-white/5 pt-2">
                    <span>{doc.status === "ready" ? "Ready" : doc.status}</span>
                    <span className={`h-2 w-2 rounded-full ${doc.status === "ready" ? "bg-green-500" : "bg-amber-500"}`} />
                  </div>
                </Link>
                <div className="flex gap-2">
                  <Link to={`/quiz/${doc.id}`}
                    className="flex-1 text-center bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 text-violet-400 text-[10px] font-bold px-2 py-1.5 rounded-lg transition-all"
                  >
                    Take Quiz
                  </Link>
                  <button
                    onClick={(e) => handleDelete(doc.id, e)}
                    className="h-7 w-7 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs transition-all"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
