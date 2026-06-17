import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../lib/api";
import type { User, QuizAttempt } from "../types";

export default function History() {
  const { user } = useOutletContext<{ user: User }>();
  const [attempts, setAttempts] = useState<(QuizAttempt & { document_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<{ attempts: (QuizAttempt & { document_name?: string })[] }>("/api/quizzes/attempts");
        setAttempts(res.attempts ?? []);
      } catch {
        // no attempts yet
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-40" />
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 w-32 rounded-xl" />)}
        </div>
        <div className="skeleton h-80 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse-soft" />
          <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">History</span>
        </div>
        <h1 className="text-3xl font-bold text-white">Quiz History</h1>
        <p className="mt-1 text-slate-400">Review your past quiz attempts</p>
      </div>

      {attempts.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6 animate-fade-in-up">
          <MetricBadge label="Total" value={attempts.length} gradient="from-indigo-400 to-purple-400" />
          <MetricBadge
            label="Average"
            value={`${Math.round(attempts.reduce((s, a) => s + a.score / a.total, 0) / attempts.length * 100)}%`}
            gradient="from-emerald-400 to-teal-400"
          />
          <MetricBadge
            label="Best"
            value={`${Math.round(Math.max(...attempts.map((a) => a.score / a.total)) * 100)}%`}
            gradient="from-amber-400 to-orange-400"
          />
        </div>
      )}

      {attempts.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center rounded-2xl py-16">
          <p className="text-lg font-medium text-slate-300">No quiz attempts yet</p>
          <p className="text-sm text-slate-500 mt-1">Upload a PDF and try a quiz to start tracking your history!</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  {["Date", "Document", "Score", "Percentage", "Grade"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {attempts.map((attempt, i) => {
                  const pct = Math.round((attempt.score / attempt.total) * 100);
                  const grade = pct >= 90 ? "A" : pct >= 80 ? "B" : pct >= 70 ? "C" : pct >= 60 ? "D" : "F";
                  const gradeColor = pct >= 70 ? "text-emerald-400" : pct >= 40 ? "text-amber-400" : "text-red-400";
                  const barColor = pct >= 70 ? "bg-emerald-400" : pct >= 40 ? "bg-amber-400" : "bg-red-400";
                  return (
                    <tr key={attempt.id} className="transition-all duration-200 hover:bg-white/[0.02] animate-fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
                      <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-300">{new Date(attempt.completed_at).toLocaleDateString()}</td>
                      <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-300">{attempt.document_name || "Unknown"}</td>
                      <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-300">{attempt.score}/{attempt.total}</td>
                      <td className="whitespace-nowrap px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
                            <div className={`h-full rounded-full ${barColor} transition-all duration-1000`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-slate-400">{pct}%</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${gradeColor} bg-white/5`}>
                          {grade}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricBadge({ label, value, gradient }: { label: string; value: string | number; gradient: string }) {
  return (
    <div className="glass-card rounded-xl px-4 py-2.5 card-lift">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-lg font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>{value}</p>
    </div>
  );
}
