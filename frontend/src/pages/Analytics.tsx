import { useEffect, useState, useMemo, useRef } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { api } from "../lib/api";
import type { User, QuizAttempt } from "../types";

interface TopicPerformance {
  topic: string;
  correct: number;
  total: number;
  score: number;
}

interface AnalyticsData {
  total_documents: number;
  total_quizzes_taken: number;
  average_score: number;
  best_score: number;
  recent_attempts: QuizAttempt[];
  score_distribution: number[];
  topic_performance: TopicPerformance[];
}

/* ── Radar Chart ────────────────────────────────────────────── */
interface RadarPoint { label: string; value: number; }

function RadarChart({ points }: { points: RadarPoint[] }) {
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 90;
  const levels = 4;

  const angleFor = (i: number) => (Math.PI * 2 * i) / points.length - Math.PI / 2;

  const polarToCart = (r: number, angle: number) => ({
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  });

  const gridColor = "rgba(255,255,255,0.08)";
  const axisColor = "rgba(255,255,255,0.12)";

  /* grid polygons */
  const gridPolygons = Array.from({ length: levels }, (_, lvl) => {
    const r = (maxR / levels) * (lvl + 1);
    const pts = points.map((_, i) => {
      const { x, y } = polarToCart(r, angleFor(i));
      return `${x},${y}`;
    }).join(" ");
    return <polygon key={lvl} points={pts} fill="none" stroke={gridColor} strokeWidth="1" />;
  });

  /* axes */
  const axes = points.map((_, i) => {
    const { x, y } = polarToCart(maxR, angleFor(i));
    return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={axisColor} strokeWidth="1" />;
  });

  /* data polygon */
  const dataPoints = points.map((p, i) => {
    const r = (p.value / 100) * maxR;
    const { x, y } = polarToCart(r, angleFor(i));
    return `${x},${y}`;
  }).join(" ");

  /* dot markers */
  const dots = points.map((p, i) => {
    const r = (p.value / 100) * maxR;
    const { x, y } = polarToCart(r, angleFor(i));
    return <circle key={i} cx={x} cy={y} r="3.5" fill="#a855f7" stroke="#fff" strokeWidth="1" />;
  });

  /* labels */
  const labelOffset = 18;
  const labels = points.map((p, i) => {
    const { x, y } = polarToCart(maxR + labelOffset, angleFor(i));
    let anchor: "middle" | "end" | "start" = "middle";
    if (x < cx - 10) anchor = "end";
    else if (x > cx + 10) anchor = "start";
    return (
      <text
        key={i}
        x={x}
        y={y + 4}
        textAnchor={anchor}
        fontSize="10"
        fill="rgba(203,213,225,0.8)"
        fontFamily="inherit"
      >
        {p.label}
      </text>
    );
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
      {gridPolygons}
      {axes}
      <polygon
        points={dataPoints}
        fill="rgba(139,92,246,0.28)"
        stroke="#a855f7"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {dots}
      {labels}
    </svg>
  );
}

/* ── Animated Circular Progress ─────────────────────────────── */
function CircularProgress({
  label,
  value,
  rating,
  ratingColor,
  trackColor,
  progressColor,
}: {
  label: string;
  value: number;
  rating: string;
  ratingColor: string;
  trackColor: string;
  progressColor: string; // e.g. "#34d399" or a css linear-gradient id
}) {
  const R = 34;
  const circ = 2 * Math.PI * R;
  const dash = (value / 100) * circ;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        padding: "18px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <span style={{ fontSize: 11, color: "rgba(148,163,184,0.7)", fontWeight: 500 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ position: "relative", width: 78, height: 78, flexShrink: 0 }}>
          <svg width="78" height="78" viewBox="0 0 78 78" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="39" cy="39" r={R} fill="none" stroke={trackColor} strokeWidth="5" />
            <circle
              cx="39"
              cy="39"
              r={R}
              fill="none"
              stroke={progressColor}
              strokeWidth="5"
              strokeDasharray={`${dash} ${circ}`}
              strokeLinecap="round"
            />
          </svg>
          <span
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 800,
              color: "#fff",
            }}
          >
            {value}%
          </span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: ratingColor }}>{rating}</span>
      </div>
    </div>
  );
}

/* ── Recommendation icon map ────────────────────────────────── */
const recIcons: Record<number, string> = { 0: "📘", 1: "📝", 2: "🃏", 3: "🎯" };

/* ── Main Page ──────────────────────────────────────────────── */
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

  /* ── Derived stats ── */
  const avgScore = data ? Math.round(data.average_score) : 0;
  const bestScore = data ? Math.round(data.best_score) : 0;
  const totalQuizzes = data?.total_quizzes_taken ?? 0;
  const totalDocs = data?.total_documents ?? 0;
  const hasData = totalQuizzes > 0;

  /* ── Summary accuracy (docs-based proxy) ── */
  const summaryAccuracy = Math.min(Math.round(totalDocs * 12.5), 100) || 0;

  /* ── Flashcard mastery (best score proxy) ── */
  const flashcardMastery = bestScore;

  /* ── Consistency ── */
  const consistency = hasData ? Math.min(Math.round(totalQuizzes * 15), 100) : 0;

  /* ── Rating helper ── */
  const rating = (v: number, noData?: boolean) => {
    if (noData || !hasData) return "No Data";
    if (v >= 90) return "Excellent";
    if (v >= 80) return "Very Good";
    if (v >= 65) return "Good";
    if (v >= 50) return "Fair";
    return "Needs Work";
  };

  const ratingColor = (v: number) => {
    if (v >= 90) return "#34d399";
    if (v >= 80) return "#a855f7";
    if (v >= 65) return "#38bdf8";
    if (v >= 50) return "#fbbf24";
    return "#f87171";
  };

  /* ── Weak Areas ── */
  const weakAreas = useMemo(() => {
    if (!data || data.topic_performance.length === 0) return [];
    return data.topic_performance
      .slice()
      .sort((a, b) => a.score - b.score)
      .slice(0, 5)
      .map((t) => {
        const s = t.score;
        let level = "Low";
        let levelBg = "rgba(239,68,68,0.18)";
        let levelColor = "#f87171";
        let dotColor = "#f87171";
        if (s >= 60 && s < 80) {
          level = "Medium"; levelBg = "rgba(251,191,36,0.15)"; levelColor = "#fbbf24"; dotColor = "#fbbf24";
        } else if (s >= 80) {
          level = "High"; levelBg = "rgba(52,211,153,0.15)"; levelColor = "#34d399"; dotColor = "#34d399";
        }
        return { name: t.topic, level, levelBg, levelColor, dotColor };
      });
  }, [data]);

  /* ── Recommendations ── */
  const recommendations = useMemo(() => {
    if (!data || totalQuizzes === 0) return [];
    const recs: string[] = [];
    const weakTopics = data.topic_performance.filter((t) => t.score < 60);
    if (weakTopics.length > 0) {
      recs.push(`Revise Chapter: ${weakTopics[0].topic}`);
      recs.push("Practice 10 more MCQs on this topic");
    }
    recs.push("Review related flashcards");
    if (avgScore < 80) recs.push("Try a mock quiz to improve accuracy");
    else recs.push("Challenge yourself with advanced topics");
    return recs.slice(0, 4);
  }, [data, avgScore, totalQuizzes]);

  /* ── Radar data ── */
  const radarPoints: RadarPoint[] = useMemo(() => {
    const base = hasData ? avgScore : 0;
    return [
      { label: "Understanding", value: Math.min(base + 5, 100) },
      { label: "Memory", value: Math.min(flashcardMastery, 100) },
      { label: "Accuracy", value: Math.min(avgScore, 100) },
      { label: "Speed", value: Math.min(consistency + 10, 100) },
      { label: "Confidence", value: Math.min(base - 5, 100) },
    ];
  }, [avgScore, flashcardMastery, consistency, hasData]);

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="skeleton h-8 w-64 rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2].map((i) => <div key={i} className="skeleton h-72 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  /* ── Card style ── */
  const card: React.CSSProperties = {
    background: "rgba(18,12,38,0.85)",
    border: "1px solid rgba(124,58,237,0.13)",
    borderRadius: 18,
    padding: 24,
  };

  return (
    <div
      style={{ maxWidth: 900, margin: "0 auto", animation: "fade-in 0.5s ease-out forwards" }}
      className="space-y-5"
    >
      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontSize: 11, color: "rgba(148,163,184,0.6)", textTransform: "uppercase", letterSpacing: 2, fontWeight: 600 }}>
            Performance
          </span>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginTop: 2 }}>
            Feedback &amp; Recommendations
          </h1>
        </div>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            boxShadow: "0 0 20px rgba(124,58,237,0.35)",
          }}
        >
          🤖
        </div>
      </div>

      {/* ── Overall Performance ── */}
      <div style={card}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(203,213,225,0.85)", marginBottom: 16 }}>
          Overall Performance
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          <CircularProgress
            label="Summary Accuracy"
            value={hasData ? summaryAccuracy : 0}
            rating={rating(summaryAccuracy, !hasData)}
            ratingColor={hasData ? ratingColor(summaryAccuracy) : "rgba(148,163,184,0.5)"}
            trackColor="rgba(52,211,153,0.12)"
            progressColor="#34d399"
          />
          <CircularProgress
            label="Quiz Score"
            value={hasData ? avgScore : 0}
            rating={rating(avgScore, !hasData)}
            ratingColor={hasData ? ratingColor(avgScore) : "rgba(148,163,184,0.5)"}
            trackColor="rgba(56,189,248,0.12)"
            progressColor="#38bdf8"
          />
          <CircularProgress
            label="Flashcard Mastery"
            value={hasData ? flashcardMastery : 0}
            rating={rating(flashcardMastery, !hasData)}
            ratingColor={hasData ? ratingColor(flashcardMastery) : "rgba(148,163,184,0.5)"}
            trackColor="rgba(168,85,247,0.12)"
            progressColor="#a855f7"
          />
          <CircularProgress
            label="Consistency"
            value={hasData ? consistency : 0}
            rating={rating(consistency, !hasData)}
            ratingColor={hasData ? ratingColor(consistency) : "rgba(148,163,184,0.5)"}
            trackColor="rgba(251,191,36,0.12)"
            progressColor="#fbbf24"
          />
        </div>
      </div>

      {/* ── No data banner ── */}
      {!hasData && (
        <div
          style={{
            ...card,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "56px 24px",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: 40, marginBottom: 12 }}>📊</span>
          <p style={{ color: "rgba(203,213,225,0.85)", fontWeight: 600, marginBottom: 6 }}>No quiz data yet</p>
          <p style={{ color: "rgba(148,163,184,0.6)", fontSize: 13, marginBottom: 20 }}>
            Upload a document and take a quiz to see your analytics!
          </p>
          <Link
            to="/dashboard"
            className="btn-premium"
            style={{ borderRadius: 10, padding: "8px 22px", fontSize: 13 }}
          >
            Go to Dashboard
          </Link>
        </div>
      )}

      {/* ── Skills Radar + Weak Areas / Recommendations ── */}
      {hasData && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Skills Radar */}
          <div style={{ ...card, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(203,213,225,0.85)",
                alignSelf: "flex-start",
                marginBottom: 16,
              }}
            >
              Skills Radar
            </p>
            <RadarChart points={radarPoints} />
          </div>

          {/* Right column: Weak Areas + Recommendations */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Weak Areas */}
            <div style={{ ...card, flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(203,213,225,0.85)", marginBottom: 14 }}>
                Weak Areas
              </p>
              {weakAreas.length === 0 ? (
                <p style={{ fontSize: 12, color: "rgba(148,163,184,0.6)" }}>
                  No weak areas identified. Take more quizzes for insights.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {weakAreas.map((area) => (
                    <div
                      key={area.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        paddingBottom: 10,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: area.dotColor,
                            flexShrink: 0,
                            boxShadow: `0 0 6px ${area.dotColor}88`,
                          }}
                        />
                        <span style={{ fontSize: 13, color: "rgba(203,213,225,0.9)", fontWeight: 500 }}>
                          {area.name}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 10px",
                          borderRadius: 6,
                          background: area.levelBg,
                          color: area.levelColor,
                          letterSpacing: 0.5,
                        }}
                      >
                        {area.level}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div style={{ ...card, flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(203,213,225,0.85)", marginBottom: 14 }}>
                Recommendations
              </p>
              {recommendations.length === 0 ? (
                <p style={{ fontSize: 12, color: "rgba(148,163,184,0.6)" }}>
                  Take a quiz to get personalized recommendations.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {recommendations.map((rec, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        background: "rgba(255,255,255,0.025)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 10,
                        padding: "10px 14px",
                      }}
                    >
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{recIcons[i] ?? "💡"}</span>
                      <span style={{ fontSize: 12, color: "rgba(203,213,225,0.85)", lineHeight: 1.4 }}>{rec}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
