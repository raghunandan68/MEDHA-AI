import { useEffect, useState, useMemo } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { api } from "../lib/api";
import type { User, QuizAttempt } from "../types";

interface AnalyticsData {
  total_documents: number;
  total_quizzes_taken: number;
  average_score: number;
  best_score: number;
  recent_attempts: QuizAttempt[];
  score_distribution: number[];
}

export default function Analytics() {
  const { user } = useOutletContext<{ user: User }>();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<AnalyticsData>("/api/analytics/overview");
        setData(res);
      } catch {
        // no data yet
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const recommendations = useMemo(() => {
    if (!data || data.total_quizzes_taken === 0) return [];
    const recs: string[] = [];
    const avg = data.average_score;
    if (avg < 60) {
      recs.push("Focus on reviewing core concepts from your documents before taking more quizzes.");
      recs.push("Try using flashcards to build foundational knowledge.");
    } else if (avg < 80) {
      recs.push("You're doing well! Focus on the topics where you scored lowest.");
      recs.push("Practice with more quizzes to improve your accuracy.");
    } else {
      recs.push("Excellent performance! Challenge yourself with more advanced topics.");
      recs.push("Consider teaching others to reinforce your understanding.");
    }
    if (data.total_documents > 0 && data.total_quizzes_taken < data.total_documents) {
      recs.push("Take quizzes for all your documents to get a complete performance picture.");
    }
    if (data.total_quizzes_taken < 3) {
      recs.push("Take more quizzes to get better performance insights and recommendations.");
    }
    return recs;
  }, [data]);

  const weakAreas = useMemo(() => {
    if (!data || data.total_quizzes_taken === 0 || data.score_distribution.length === 0) return [];
    const areas: { name: string; level: string; color: string }[] = [];
    const dist = data.score_distribution;
    const lowBuckets = dist.slice(0, 5).reduce((a, b) => a + b, 0);
    const total = dist.reduce((a, b) => a + b, 0);
    if (total === 0) return [];
    const lowRatio = lowBuckets / total;
    if (lowRatio > 0.5) {
      areas.push({ name: "Fundamental Concepts", level: "Low", color: "bg-red-500/10 text-red-400 border border-red-500/20" });
    }
    if (data.average_score < 70) {
      areas.push({ name: "Knowledge Recall", level: "Medium", color: "bg-orange-500/10 text-orange-400 border border-orange-500/20" });
    }
    if (data.average_score < 50) {
      areas.push({ name: "Application of Concepts", level: "Low", color: "bg-red-500/10 text-red-400 border border-red-500/20" });
    }
    if (data.total_quizzes_taken >= 3 && data.average_score >= 70) {
      areas.push({ name: "Advanced Topics", level: "Needs Practice", color: "bg-amber-500/10 text-amber-400 border border-amber-500/20" });
    }
    if (areas.length === 0) {
      areas.push({ name: "Overall Performance", level: "Good", color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" });
    }
    return areas;
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2].map((i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const avgScore = data ? Math.round(data.average_score) : 0;
  const bestScore = data ? Math.round(data.best_score) : 0;
  const totalQuizzes = data?.total_quizzes_taken ?? 0;
  const totalDocs = data?.total_documents ?? 0;
  const hasData = totalQuizzes > 0;

  return (
    <div className="mx-auto max-w-6xl animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Performance</span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Feedback & Recommendations</h1>
        </div>
        <span className="text-4xl animate-bounce-gentle">🤖</span>
      </div>

      <div className="bg-medha-card rounded-2xl p-6 border border-white/5">
        <h2 className="text-base font-semibold text-slate-300 mb-6">Overall Performance</h2>
        <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
          <CircularProgress label="Documents" value={Math.min(totalDocs * 10, 100)} rating={`${totalDocs} uploaded`} color="stroke-emerald-400" textColor="text-emerald-400" />
          <CircularProgress label="Quiz Score" value={hasData ? avgScore : 0} rating={!hasData ? "No Data" : avgScore >= 80 ? "Excellent" : avgScore >= 60 ? "Good" : "Needs Improvement"} color={!hasData ? "stroke-slate-500" : avgScore >= 80 ? "stroke-blue-400" : avgScore >= 60 ? "stroke-amber-400" : "stroke-red-400"} textColor={!hasData ? "text-slate-500" : avgScore >= 80 ? "text-blue-400" : avgScore >= 60 ? "text-amber-400" : "text-red-400"} />
          <CircularProgress label="Best Score" value={hasData ? bestScore : 0} rating={!hasData ? "No Data" : bestScore >= 80 ? "Excellent" : bestScore >= 60 ? "Good" : "Fair"} color={!hasData ? "stroke-slate-500" : "stroke-violet-400"} textColor={!hasData ? "text-slate-500" : "text-violet-400"} />
          <CircularProgress label="Quizzes Taken" value={Math.min(totalQuizzes * 20, 100)} rating={`${totalQuizzes} total`} color="stroke-orange-400" textColor="text-orange-400" />
        </div>
      </div>

      {!hasData ? (
        <div className="glass-card flex flex-col items-center justify-center rounded-2xl py-16">
          <p className="text-lg font-medium text-slate-300">No quiz data yet</p>
          <p className="text-sm text-slate-500 mt-1">Upload a document and take a quiz to see your analytics!</p>
          <Link to="/dashboard" className="btn-premium mt-4 rounded-lg px-5 py-2 text-sm shadow-lg shadow-indigo-500/15">
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-medha-card rounded-2xl p-6 border border-white/5 flex flex-col items-center">
            <h3 className="text-base font-semibold text-slate-300 w-full text-left mb-6">Score Distribution</h3>
            <div className="w-full space-y-2">
              {data!.score_distribution.map((count, bucket) => {
                const maxCount = Math.max(...data!.score_distribution, 1);
                const pct = (count / maxCount) * 100;
                const label = `${bucket * 10}-${(bucket + 1) * 10 - 1}%`;
                return (
                  <div key={bucket} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-16 text-right">{label}</span>
                    <div className="flex-1 h-5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-6">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-medha-card rounded-2xl p-6 border border-white/5">
              <h3 className="text-base font-semibold text-slate-300 mb-4">Areas for Improvement</h3>
              {weakAreas.length === 0 ? (
                <p className="text-sm text-slate-400">No areas identified yet. Take more quizzes to get insights.</p>
              ) : (
                <div className="space-y-2">
                  {weakAreas.map((area) => (
                    <div key={area.name} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <span className="text-sm text-slate-300 font-medium">{area.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${area.color}`}>{area.level}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-medha-card rounded-2xl p-6 border border-white/5">
              <h3 className="text-base font-semibold text-slate-300 mb-4">Recommendations</h3>
              {recommendations.length === 0 ? (
                <p className="text-sm text-slate-400">Take a quiz to get personalized recommendations.</p>
              ) : (
                <ul className="space-y-3 text-sm text-slate-300">
                  {recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-violet-400 mt-0.5">🎯</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CircularProgress({ label, value, rating, color, textColor }: { label: string; value: number; rating: string; color: string; textColor: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative w-24 h-24 flex items-center justify-center mb-2">
        <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
          <circle cx="18" cy="18" r="16" fill="none" className={color} strokeWidth="3" strokeDasharray={`${value}, 100`} />
        </svg>
        <span className="text-lg font-bold text-white">{value}%</span>
      </div>
      <p className="text-xs text-slate-400 font-semibold">{label}</p>
      <p className={`text-xs font-bold mt-0.5 ${textColor}`}>{rating}</p>
    </div>
  );
}
