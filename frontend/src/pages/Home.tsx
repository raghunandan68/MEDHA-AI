import { useState } from "react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: "Smart PDF Upload",
    desc: "Drag & drop any PDF. Our AI instantly extracts and structures key concepts from your documents.",
    gradient: "from-indigo-500 to-purple-500",
    gradientBg: "from-indigo-500/20 to-purple-500/20",
    borderGlow: "group-hover:border-indigo-500/30",
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    title: "AI Flashcards",
    desc: "Automatically generated flashcards covering every important topic from your uploaded materials.",
    gradient: "from-purple-500 to-pink-500",
    gradientBg: "from-purple-500/20 to-pink-500/20",
    borderGlow: "group-hover:border-purple-500/30",
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    title: "Smart Quizzes",
    desc: "Test your knowledge with AI-generated quizzes that adapt to your learning progress.",
    gradient: "from-pink-500 to-rose-500",
    gradientBg: "from-pink-500/20 to-rose-500/20",
    borderGlow: "group-hover:border-pink-500/30",
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    title: "Progress Analytics",
    desc: "Track your improvement over time with detailed charts, scores, and performance insights.",
    gradient: "from-emerald-500 to-teal-500",
    gradientBg: "from-emerald-500/20 to-teal-500/20",
    borderGlow: "group-hover:border-emerald-500/30",
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: "AI Chat Assistant",
    desc: "Have conversations with AI about your documents. Ask questions, get explanations, clarify doubts.",
    gradient: "from-cyan-500 to-blue-500",
    gradientBg: "from-cyan-500/20 to-blue-500/20",
    borderGlow: "group-hover:border-cyan-500/30",
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
    title: "Spaced Repetition",
    desc: "Built-in spaced repetition algorithm optimizes review timing for maximum memory retention.",
    gradient: "from-orange-500 to-rose-500",
    gradientBg: "from-orange-500/20 to-rose-500/20",
    borderGlow: "group-hover:border-orange-500/30",
  },
];

const steps = [
  {
    step: 1,
    title: "Upload Your PDF",
    desc: "Simply drag and drop any PDF document — textbook, article, or lecture notes.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    step: 2,
    title: "AI Processes It",
    desc: "Our AI reads, analyzes, and extracts key concepts, definitions, and relationships.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    gradient: "from-purple-500 to-pink-500",
  },
  {
    step: 3,
    title: "Learn & Track",
    desc: "Study with flashcards, test with quizzes, and monitor your progress with analytics.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    gradient: "from-pink-500 to-rose-500",
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Medical Student",
    text: "Medha AI transformed my study routine. I uploaded 3 textbooks and had comprehensive flashcards ready in minutes. My exam scores improved dramatically!",
    rating: 5,
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    name: "Marcus Johnson",
    role: "CS Graduate Student",
    text: "The AI-generated quizzes are incredible — they actually test deep understanding, not just memorization. The progress tracking keeps me motivated.",
    rating: 5,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    name: "Priya Patel",
    role: "Law Student",
    text: "I was skeptical at first, but the spaced repetition feature is a game-changer. I retain so much more compared to traditional study methods.",
    rating: 5,
    gradient: "from-pink-500 to-rose-500",
  },
];

const faqs = [
  { q: "How does the AI process my documents?", a: "Our advanced AI model analyzes your PDF, identifies key concepts, definitions, and relationships, then generates structured flashcards and quiz questions. Processing typically takes 30-60 seconds depending on document size." },
  { q: "Is my data secure?", a: "Absolutely. All documents are encrypted at rest and in transit. Your data is never shared with third parties, and you can delete your documents and account at any time." },
  { q: "Can I upload any type of PDF?", a: "Yes! Our AI handles textbooks, research papers, lecture notes, articles, and more. The broader the content, the better the flashcards and quizzes generated." },
  { q: "How many documents can I upload?", a: "Free users can upload up to 10 documents. Premium plans offer unlimited uploads, priority processing, and advanced analytics features." },
  { q: "Does it work on mobile?", a: "Absolutely! Medha AI is fully responsive and works seamlessly on all devices — phone, tablet, and desktop." },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`h-4 w-4 ${i < rating ? "text-amber-400" : "text-slate-600"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function FAQItem({ q, a, isOpen, toggle }: { q: string; a: string; isOpen: boolean; toggle: () => void }) {
  return (
    <div className="border-b border-slate-700/50 last:border-0">
      <button
        onClick={toggle}
        className="flex w-full items-center justify-between py-5 text-left transition-all hover:opacity-80"
      >
        <span className="text-base font-medium text-slate-200 pr-4">{q}</span>
        <svg
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-48 pb-5" : "max-h-0"}`}>
        <p className="text-sm text-slate-400 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="overflow-hidden">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,80,255,0.3)_0%,transparent_60%)]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]" />
        </div>

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-500/20 blur-[120px] animate-float-slow" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-pink-500/15 blur-[120px] animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full bg-indigo-500/20 blur-[120px] animate-float" style={{ animationDelay: "4s" }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-amber-500/10 blur-[120px] animate-float-slow" style={{ animationDelay: "3s" }} />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className={`absolute h-1.5 w-1.5 rounded-full bg-white/20 animate-float`}
              style={{
                left: `${5 + (i * 7) % 90}%`,
                top: `${10 + (i * 11) % 80}%`,
                animationDelay: `${i * 0.7}s`,
                animationDuration: `${6 + (i % 4) * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300 backdrop-blur-sm mb-8 animate-scale-in">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
            </span>
            AI-Powered Learning Platform
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-none mb-6 animate-slide-up">
            <span className="text-white">Learn Smarter</span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              With AI
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-slate-400 mb-10 animate-slide-up animate-delay-100 leading-relaxed">
            Transform your PDFs into intelligent flashcards, quizzes, and study aids.
            <span className="block mt-1 text-slate-500">Upload once. Learn forever.</span>
          </p>

          <div className="flex flex-wrap justify-center gap-4 animate-slide-up animate-delay-200">
            <Link
              to="/register"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:-translate-y-1 hover:scale-105"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative">Get Started Free</span>
              <svg className="relative h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 rounded-2xl border border-slate-600/50 bg-slate-800/30 px-8 py-4 text-lg font-semibold text-slate-300 backdrop-blur-sm transition-all hover:bg-slate-700/50 hover:text-white hover:border-slate-500/50 hover:-translate-y-1"
            >
              Sign In
              <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto animate-fade-in-up animate-delay-400">
            {[
              { value: "10K+", label: "Students" },
              { value: "50K+", label: "Flashcards" },
              { value: "95%", label: "Satisfaction" },
              { value: "5min", label: "Setup Time" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{stat.value}</p>
                <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="relative bg-gradient-to-b from-slate-900 to-indigo-950 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08)_0%,transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300 backdrop-blur-sm mb-4">
              Simple Process
            </span>
            <h2 className="text-4xl font-bold text-white mt-3">How It Works</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">Three simple steps to transform your learning experience</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="group relative animate-slide-up" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500`} />
                <div className="relative bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm transition-all duration-300 hover:border-slate-600/50 hover:-translate-y-1">
                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${s.gradient} shadow-lg mb-5 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                    <div className="text-white">{s.icon}</div>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${s.gradient} text-xs font-bold text-white shadow-sm`}>
                      {s.step}
                    </span>
                    <h3 className="text-xl font-semibold text-white">{s.title}</h3>
                  </div>
                  <p className="text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="relative bg-gradient-to-b from-indigo-950 to-slate-950 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(168,85,247,0.08)_0%,transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-300 backdrop-blur-sm mb-4">
              Everything You Need
            </span>
            <h2 className="text-4xl font-bold text-white mt-3">Powerful Features</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">Tools designed to make studying faster, smarter, and more effective</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className={`group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 ${f.borderGlow} animate-scale-in`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${f.gradientBg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className={`relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                  <div className="text-white">{f.icon}</div>
                </div>
                <h3 className="relative text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="relative text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="relative bg-gradient-to-b from-slate-950 to-indigo-950 py-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]" />
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-sm text-amber-300 backdrop-blur-sm mb-4">
              Testimonials
            </span>
            <h2 className="text-4xl font-bold text-white mt-3">Loved by Students</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">Hear from people who transformed their study habits</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="group relative animate-slide-up" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${t.gradient} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500`} />
                <div className="relative bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 hover:border-slate-600/50 hover:-translate-y-1">
                  <StarRating rating={t.rating} />
                  <p className="text-slate-300 mt-4 mb-6 leading-relaxed text-sm">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${t.gradient} text-xs font-bold text-white shadow-md`}>
                      {t.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="relative bg-gradient-to-b from-indigo-950 to-slate-950 py-24">
        <div className="relative mx-auto max-w-7xl px-4 text-center">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-12 md:p-20 shadow-2xl">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl animate-float-slow" />
              <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-pink-300/15 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
            </div>
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Ready to Transform Your Learning?</h2>
              <p className="text-indigo-200 text-lg mb-8 max-w-lg mx-auto">Join thousands of students who study smarter with AI-powered tools.</p>
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-indigo-700 shadow-2xl transition-all hover:shadow-indigo-500/30 hover:-translate-y-1 hover:scale-105"
              >
                Start Learning Free
                <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="relative bg-slate-950 py-24">
        <div className="relative mx-auto max-w-3xl px-4">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-600/30 bg-slate-800/30 px-4 py-1.5 text-sm text-slate-300 backdrop-blur-sm mb-4">
              FAQ
            </span>
            <h2 className="text-4xl font-bold text-white mt-3">Got Questions?</h2>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl px-6">
            {faqs.map((faq, i) => (
              <FAQItem
                key={i}
                q={faq.q}
                a={faq.a}
                isOpen={openFaq === i}
                toggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative border-t border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/20">
                  M
                </div>
                <span className="text-lg font-bold text-white">Medha AI</span>
              </div>
              <p className="text-sm text-slate-500 max-w-md leading-relaxed">
                Transform your PDFs into intelligent study materials with AI-powered flashcards, quizzes, and progress tracking. Study smarter, not harder.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2">
                {["Features", "Pricing", "FAQ", "Changelog"].map((item) => (
                  <li key={item}><a href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                {["About", "Blog", "Careers", "Contact"].map((item) => (
                  <li key={item}><a href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">© {new Date().getFullYear()} Medha AI. All rights reserved.</p>
            <div className="flex gap-6">
              {["Privacy", "Terms", "Security"].map((item) => (
                <a key={item} href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">{item}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
