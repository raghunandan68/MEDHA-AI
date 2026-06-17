import { useEffect, useState } from "react";
import { useParams, useOutletContext, Link } from "react-router-dom";
import { api } from "../lib/api";
import type { User, Quiz } from "../types";

interface AttemptDetail {
  id: string;
  document_id: string;
  document_name: string | null;
  score: number;
  total: number;
  answers: number[];
  completed_at: string;
  quizzes: Quiz[];
}

export default function AttemptReview() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const { user } = useOutletContext<{ user: User }>();
  const [attempt, setAttempt] = useState<AttemptDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        const res = await api.get<AttemptDetail>(`/api/quizzes/attempts/${attemptId}`);
        setAttempt(res);
      } catch {
        // handle error
      }
      setLoading(false);
    };
    fetchAttempt();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-sm py-16">
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="text-slate-400">Attempt not found.</p>
        <Link to="/history" className="text-violet-400 hover:underline mt-2 inline-block">Back to History</Link>
      </div>
    );
  }

  const pct = Math.round((attempt.score / attempt.total) * 100);
  const grade = pct >= 90 ? "A" : pct >= 80 ? "B" : pct >= 70 ? "C" : pct >= 60 ? "D" : "F";
  const gradeColors: Record<string, string> = { A: "from-emerald-400 to-green-400", B: "from-blue-400 to-cyan-400", C: "from-amber-400 to-yellow-400", D: "from-orange-400 to-red-400", F: "from-red-400 to-rose-400" };
  const emojis: Record<string, string> = { A: "🌟", B: "👏", C: "💪", D: "📚", F: "🤔" };

  const letters = ["A", "B", "C", "D"];

  return (
    <div className="mx-auto max-w-3xl py-8 animate-fade-in-up space-y-6">
      <div className="glass-card rounded-2xl p-8 text-center">
        <div className="mb-3 text-5xl">{emojis[grade]}</div>
        <h1 className="text-3xl font-bold text-white mb-2">Quiz Result</h1>
        <p className="text-sm text-slate-400 mb-4">
          {attempt.document_name || "Document"} &middot; {new Date(attempt.completed_at).toLocaleDateString()}
        </p>
        <div className="mb-4">
          <span className={`text-6xl font-bold bg-gradient-to-r ${gradeColors[grade]} bg-clip-text text-transparent`}>
            {pct}%
          </span>
          <p className="text-base text-slate-400 mt-1">{attempt.score}/{attempt.total} correct</p>
        </div>
        <div className="mb-4 max-w-xs mx-auto">
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className={`h-full rounded-full bg-gradient-to-r ${gradeColors[grade]} transition-all duration-1000`} style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <Link to={`/quiz/${attempt.document_id}`}
            className="bg-white/5 border border-white/10 rounded-xl px-5 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10 transition-all"
          >
            Retry Quiz
          </Link>
          <Link to={`/flashcards/${attempt.document_id}`}
            className="bg-medha-button text-white rounded-xl px-5 py-2 text-sm font-bold shadow-lg shadow-violet-500/20 hover:opacity-95 transition-all"
          >
            Review Flashcards
          </Link>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Question Breakdown</h2>
        <div className="space-y-4">
          {attempt.quizzes.map((q, idx) => {
            const selected = attempt.answers[idx];
            const correct = selected === q.correct_answer;
            return (
              <div key={q.id} className={`rounded-xl p-4 border ${correct ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                <div className="flex items-start gap-3">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${correct ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                    {correct ? "✓" : "✗"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white mb-2">Q{idx + 1}: {q.question}</p>
                    <div className="space-y-1 text-xs">
                      <p className={correct ? "text-emerald-400" : "text-red-400"}>
                        Your answer: {selected >= 0 ? letters[selected] : "(none)"}
                      </p>
                      {!correct && (
                        <p className="text-emerald-400">
                          Correct answer: {letters[q.correct_answer]}
                        </p>
                      )}
                      <p className="text-slate-400 mt-1">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
