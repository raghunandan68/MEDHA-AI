import { useEffect, useState } from "react";
import { useParams, useOutletContext, Link } from "react-router-dom";
import { api } from "../lib/api";
import type { User, FlashCard, Document } from "../types";

export default function FlashcardsPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const { user } = useOutletContext<{ user: User }>();
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flippedId, setFlippedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cardsRes, docsRes] = await Promise.allSettled([
          api.get<{ flashcards: FlashCard[] }>(`/api/flashcards/document/${documentId}`),
          api.get<{ documents: Document[] }>("/api/documents"),
        ]);
        if (cardsRes.status === "fulfilled") {
          setFlashcards(cardsRes.value.flashcards);
        }
        if (docsRes.status === "fulfilled") {
          const found = docsRes.value.documents.find((d) => d.id === documentId);
          if (found) setDoc(found);
        }
      } catch {
        // no flashcards yet
      }
      setLoading(false);
    };
    fetchData();
  }, [documentId]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await api.post<{ flashcards: FlashCard[] }>(`/api/flashcards/generate/${documentId}`);
      if (!res.flashcards || res.flashcards.length === 0) {
        setError("No flashcards could be generated. Make sure your document is uploaded correctly.");
        return;
      }
      setFlashcards(res.flashcards);
    } catch (e: any) {
      setError(e?.message || "Failed to generate flashcards. Please try again.");
    }
    setGenerating(false);
  };

  const topics = [...new Set(flashcards.map((c) => c.topic))];

  if (loading) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-4 w-full rounded-full" />
        <div className="skeleton h-80 rounded-2xl" />
      </div>
    );
  }

  if (!flashcards.length) {
    return (
      <div className="glass-card flex flex-col items-center justify-center rounded-2xl py-16 animate-fade-in">
        <p className="text-lg font-medium text-slate-300">No flashcards yet</p>
        <p className="text-sm text-slate-500 mt-1">Generate flashcards from your document to start studying!</p>
        {error && (
          <p className="text-sm text-red-300 mt-3 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{error}</p>
        )}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="btn-premium mt-4 rounded-lg px-5 py-2 text-sm shadow-lg shadow-indigo-500/15"
        >
          {generating ? "Generating..." : "Generate Flashcards"}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            📄 {doc?.filename || "Document"}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {flashcards.length} cards · {topics.length} topics
          </p>
        </div>
        <div className="flex gap-3">
          {error && (
            <p className="text-xs text-red-300 self-center">{error}</p>
          )}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-all"
          >
            {generating ? "Generating..." : "🔄 Regenerate"}
          </button>
          <Link
            to={`/quiz/${documentId}`}
            className="bg-medha-button text-white rounded-xl px-5 py-2 text-xs font-bold shadow-lg shadow-violet-500/20 hover:opacity-95 active:scale-[0.98] transition-all"
          >
            Take Quiz
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {flashcards.map((card) => {
          const isFlipped = flippedId === card.id;
          return (
            <div
              key={card.id}
              className="bg-medha-card rounded-2xl border border-white/5 hover:border-violet-500/30 transition-all duration-200 cursor-pointer min-h-[180px]"
              style={{ perspective: "1000px" }}
              onClick={() => setFlippedId(isFlipped ? null : card.id)}
            >
              <div
                className="relative transition-transform duration-500 w-full min-h-[180px]"
                style={{ transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "" }}
              >
                <div className="p-5 flex flex-col justify-between min-h-[180px]" style={{ backfaceVisibility: "hidden" }}>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-violet-400 font-semibold">
                      {card.topic}
                    </span>
                    <p className="text-sm font-semibold text-white mt-2 leading-relaxed">{card.front}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-2">Click to flip</span>
                </div>

                <div
                  className="absolute inset-0 p-5 flex flex-col justify-center bg-medha-card rounded-2xl border border-emerald-500/20"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold mb-2">Answer</span>
                  <p className="text-sm text-slate-200 leading-relaxed">{card.back}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
