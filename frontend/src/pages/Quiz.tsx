import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useOutletContext, Link } from "react-router-dom";
import { api } from "../lib/api";
import type { User, Quiz as QuizType, QuizAttempt } from "../types";

interface QuestionResult {
  question: QuizType;
  selected: number;
  correct: boolean;
}

export default function QuizPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const { user } = useOutletContext<{ user: User }>();
  const [quizzes, setQuizzes] = useState<QuizType[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [config, setConfig] = useState({ questionCount: 5, timeLimit: 10 });
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timeUp, setTimeUp] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (started && !finished && config.timeLimit > 0) {
      setTimeRemaining(config.timeLimit * 60);
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setTimeUp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, finished, config.timeLimit]);

  useEffect(() => {
    if (timeUp && !finished && started) {
      finishQuiz([...answers, selectedIdx ?? -1]);
    }
  }, [timeUp]);

  const fetchExistingQuizzes = async () => {
    try {
      const res = await api.get<{ quizzes: QuizType[] }>(`/api/quizzes/document/${documentId}`);
      return res.quizzes;
    } catch {
      return [];
    }
  };

  useEffect(() => {
    fetchExistingQuizzes().then((existing) => {
      setQuizzes(existing);
      setLoading(false);
    });
  }, [documentId]);

  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await api.post<{ quizzes: QuizType[] }>(
        `/api/quizzes/generate/${documentId}?count=${config.questionCount}`
      );
      if (!res.quizzes || res.quizzes.length === 0) {
        setError("No questions could be generated. Make sure your document is uploaded correctly.");
        return;
      }
      setQuizzes(res.quizzes);
      setStarted(true);
    } catch (e: any) {
      setError(e?.message || "Failed to generate quiz. Please try again.");
    }
    setGenerating(false);
  };

  const startWithExisting = () => {
    setStarted(true);
  };

  const handleSelect = (idx: number) => {
    if (selectedIdx !== null) return;
    setSelectedIdx(idx);
    setShowExplanation(true);
    const isCorrect = idx === quizzes[currentIdx].correct_answer;
    if (isCorrect) setScore((s) => s + 1);
  };

  const handleNext = () => {
    const currentAnswer = selectedIdx ?? -1;
    if (currentIdx < quizzes.length - 1) {
      setAnswers((prev) => [...prev, currentAnswer]);
      setCurrentIdx((p) => p + 1);
      setSelectedIdx(null);
      setShowExplanation(false);
    } else {
      setAnswers((prev) => [...prev, currentAnswer]);
      finishQuiz([...answers, currentAnswer]);
    }
  };

  const finishQuiz = async (finalAnswers: number[]) => {
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      await api.post<QuizAttempt>("/api/quizzes/attempt", {
        document_id: documentId,
        score,
        total: quizzes.length,
        answers: finalAnswers,
      });
    } catch {
      // silently fail - result still shown
    }
    setFinished(true);
    setSubmitting(false);
  };

  const questionResults: QuestionResult[] = useMemo(() => {
    if (!finished) return [];
    return quizzes.map((q, i) => ({
      question: q,
      selected: answers[i],
      correct: answers[i] === q.correct_answer,
    }));
  }, [finished, quizzes, answers]);

  const recommendations = useMemo(() => {
    if (!finished) return [];
    const wrong = questionResults.filter((r) => !r.correct);
    if (wrong.length === 0) {
      return ["Great job! You got all questions correct. Try a harder quiz to challenge yourself."];
    }
    const recs: string[] = [];
    const pct = Math.round((score / quizzes.length) * 100);
    if (pct < 60) {
      recs.push("Review the document material again before attempting the quiz.");
    }
    recs.push("Practice more questions on the topics you got wrong.");
    recs.push("Use flashcards to reinforce the concepts you missed.");
    if (wrong.length >= 3) {
      recs.push("Try breaking down your study session into smaller chunks.");
    }
    if (wrong.length <= 2 && wrong.length > 0) {
      recs.push("Review the specific questions you missed and understand the explanations.");
    }
    return recs;
  }, [finished, questionResults, score, quizzes.length]);

  const weakAreas = useMemo(() => {
    if (!finished) return [];
    const wrong = questionResults.filter((r) => !r.correct);
    return wrong.map((r) => {
      const q = r.question.question;
      const topic = q.length > 50 ? q.substring(0, 50) + "..." : q;
      return { topic, explanation: r.question.explanation };
    });
  }, [finished, questionResults]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const timerPercent = config.timeLimit > 0
    ? (timeRemaining / (config.timeLimit * 60)) * 100
    : 100;

  if (loading) {
    return (
      <div className="mx-auto max-w-sm py-16">
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  if (!started) {
    return (
      <div className="mx-auto max-w-lg py-16 animate-fade-in-up">
        <div className="glass-card rounded-2xl p-10">
          <div className="mb-4 text-6xl text-center">🧠</div>
          <h1 className="text-3xl font-bold text-white mb-2 text-center">Quiz Setup</h1>
          <p className="text-sm text-slate-400 mb-8 text-center">Configure your quiz before starting</p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Number of Questions
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={3}
                  max={20}
                  value={config.questionCount}
                  onChange={(e) => setConfig((c) => ({ ...c, questionCount: parseInt(e.target.value) }))}
                  className="flex-1 accent-violet-500"
                />
                <span className="text-lg font-bold text-violet-400 w-8 text-center">{config.questionCount}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Time Limit (minutes)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={60}
                  value={config.timeLimit}
                  onChange={(e) => setConfig((c) => ({ ...c, timeLimit: parseInt(e.target.value) }))}
                  className="flex-1 accent-violet-500"
                />
                <span className="text-lg font-bold text-violet-400 w-12 text-center">
                  {config.timeLimit}m
                </span>
              </div>
            </div>

            {quizzes.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-sm text-slate-400">
                  {quizzes.length} existing questions found. Generate new ones or use existing.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              {quizzes.length > 0 && (
                <button
                  onClick={startWithExisting}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 text-sm font-semibold text-slate-300 hover:bg-white/10 transition-all"
                >
                  Use Existing ({quizzes.length})
                </button>
              )}
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex-1 bg-medha-button text-white rounded-xl py-3 text-sm font-bold shadow-lg shadow-violet-500/20 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {generating ? "Generating..." : "Generate Quiz"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((score / quizzes.length) * 100);
    const grade = pct >= 90 ? "A" : pct >= 80 ? "B" : pct >= 70 ? "C" : pct >= 60 ? "D" : "F";
    const gradeColors: Record<string, string> = { A: "from-emerald-400 to-green-400", B: "from-blue-400 to-cyan-400", C: "from-amber-400 to-yellow-400", D: "from-orange-400 to-red-400", F: "from-red-400 to-rose-400" };
    const emojis: Record<string, string> = { A: "🌟", B: "👏", C: "💪", D: "📚", F: "🤔" };

    return (
      <div className="mx-auto max-w-3xl py-8 animate-fade-in-up space-y-6">
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="mb-3 text-5xl">{emojis[grade]}</div>
          <h1 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h1>
          {timeUp && <p className="text-sm text-amber-400 mb-2">⏰ Time's up!</p>}
          <div className="mb-4">
            <span className={`text-6xl font-bold bg-gradient-to-r ${gradeColors[grade]} bg-clip-text text-transparent`}>
              {pct}%
            </span>
            <p className="text-base text-slate-400 mt-1">{score}/{quizzes.length} correct</p>
          </div>
          <div className="mb-4 max-w-xs mx-auto">
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className={`h-full rounded-full bg-gradient-to-r ${gradeColors[grade]} transition-all duration-1000`} style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setStarted(false); setCurrentIdx(0); setSelectedIdx(null); setScore(0); setFinished(false); setAnswers([]); setShowExplanation(false); setTimeUp(false); setTimeRemaining(0); }}
              className="bg-white/5 border border-white/10 rounded-xl px-5 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10 transition-all"
            >
              Try Again
            </button>
            <Link to={`/flashcards/${documentId}`}
              className="bg-medha-button text-white rounded-xl px-5 py-2 text-sm font-bold shadow-lg shadow-violet-500/20 hover:opacity-95 transition-all"
            >
              Review Flashcards
            </Link>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Question Breakdown</h2>
          <div className="space-y-4">
            {questionResults.map((r, idx) => {
              const letters = ["A", "B", "C", "D"];
              return (
                <div key={idx} className={`rounded-xl p-4 border ${r.correct ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                  <div className="flex items-start gap-3">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${r.correct ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                      {r.correct ? "✓" : "✗"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white mb-2">Q{idx + 1}: {r.question.question}</p>
                      <div className="space-y-1 text-xs">
                        <p className={r.correct ? "text-emerald-400" : "text-red-400"}>
                          Your answer: {r.selected >= 0 ? letters[r.selected] : "(none)"}
                        </p>
                        {!r.correct && (
                          <p className="text-emerald-400">
                            Correct answer: {letters[r.question.correct_answer]}
                          </p>
                        )}
                        <p className="text-slate-400 mt-1">{r.question.explanation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {weakAreas.length > 0 && (
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Areas to Improve</h2>
            <div className="space-y-3">
              {weakAreas.map((area, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                  <span className="text-lg">📚</span>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{area.topic}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{area.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Recommendations</h2>
          <ul className="space-y-3">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                <span className="text-violet-400 mt-0.5">🎯</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const current = quizzes[currentIdx];
  const progress = ((currentIdx + 1) / quizzes.length) * 100;
  const timerColor = timeRemaining < 60 ? "text-red-400" : timeRemaining < 180 ? "text-amber-400" : "text-slate-300";

  return (
    <div className="mx-auto max-w-4xl animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
            Question {currentIdx + 1} / {quizzes.length}
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Practice Quiz</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1.5 text-sm font-bold ${timerColor}`}>
            <span>⏱️</span>
            <span>{formatTime(timeRemaining)}</span>
          </div>
          <div className="text-sm text-slate-400">
            Score: <span className="text-violet-400 font-bold">{score}/{currentIdx}</span>
          </div>
        </div>
      </div>

      {config.timeLimit > 0 && (
        <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              timeRemaining < 60 ? "bg-red-500" : timeRemaining < 180 ? "bg-amber-500" : "bg-violet-500"
            }`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>
      )}

      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div className="h-full rounded-full bg-violet-500 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-medha-card rounded-2xl p-6 border border-white/5">
            <h2 className="text-lg font-bold text-white mb-6">{current.question}</h2>
            <div className="space-y-3">
              {current.options.map((opt, idx) => {
                const isCorrect = idx === current.correct_answer;
                const isSelected = idx === selectedIdx;
                const showResult = selectedIdx !== null;

                let btnClass = "border-white/5 bg-slate-900/40 hover:bg-slate-900 text-slate-300";
                if (showResult && isCorrect) btnClass = "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
                else if (showResult && isSelected && !isCorrect) btnClass = "border-red-500/30 bg-red-500/10 text-red-300";
                else if (isSelected) btnClass = "border-violet-500/30 bg-violet-500/10 text-white";

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={showResult}
                    className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left text-sm transition-all duration-200 ${btnClass} disabled:cursor-default`}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      showResult && isCorrect ? "bg-emerald-500/20 text-emerald-400" : isSelected ? "bg-violet-500/20 text-violet-400" : "bg-white/5 text-slate-400"
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 font-medium">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {showExplanation && (
            <div className="bg-medha-card rounded-2xl p-5 border border-violet-500/20 animate-fade-in">
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">💡</span>
                <div>
                  <p className="text-sm font-semibold text-violet-300 mb-1">Explanation</p>
                  <p className="text-sm text-slate-300">{current.explanation}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => { setCurrentIdx(p => Math.max(0, p - 1)); setSelectedIdx(null); setShowExplanation(false); }}
              disabled={currentIdx === 0}
              className="bg-white/5 border border-white/10 rounded-xl px-6 py-3 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-20 transition-all"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={selectedIdx === null || submitting}
              className="flex-1 bg-medha-button text-white rounded-xl py-3 text-xs font-bold shadow-lg shadow-violet-500/20 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-30"
            >
              {submitting ? "Submitting..." : currentIdx < quizzes.length - 1 ? "Next Question" : "Submit & Finish"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-medha-card rounded-2xl p-6 border border-white/5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Question Progress</h3>
            <div className="grid grid-cols-5 gap-2.5">
              {Array.from({ length: quizzes.length }).map((_, i) => {
                const isCurrent = i === currentIdx;
                const answered = i < currentIdx;
                let badgeClass = "bg-white/5 text-slate-400 border border-transparent";
                if (isCurrent) badgeClass = "bg-violet-500/20 text-violet-300 border border-violet-500/50 ring-2 ring-violet-500/20";
                else if (answered) badgeClass = "bg-violet-600 text-white";

                return (
                  <div
                    key={i}
                    className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${badgeClass}`}
                  >
                    {i + 1}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-medha-card rounded-2xl p-6 border border-white/5 text-center flex flex-col items-center">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 w-full text-left">Your Score</h3>
            <div className="relative w-28 h-28 flex items-center justify-center mb-2">
              <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <circle cx="18" cy="18" r="16" fill="none" stroke="#7c3aed" strokeWidth="3" strokeDasharray={`${currentIdx > 0 ? Math.round((score / currentIdx) * 100) : 0}, 100`} />
              </svg>
              <div>
                <p className="text-2xl font-bold text-white">{score}/{currentIdx || 1}</p>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Correct</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-medium">Accuracy</p>
            <p className="text-xl font-bold text-green-400 mt-0.5">
              {currentIdx > 0 ? Math.round((score / currentIdx) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
