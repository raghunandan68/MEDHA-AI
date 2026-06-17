import { useState } from "react";

interface FlashCardProps {
  front: string;
  back: string;
  topic: string;
}

const TOPIC_COLORS: Record<string, { from: string; to: string }> = {
  "Core Concepts": { from: "from-indigo-500", to: "to-purple-600" },
  "Model Theory": { from: "from-purple-500", to: "to-pink-600" },
  "Optimization": { from: "from-blue-500", to: "to-cyan-600" },
  "Evaluation": { from: "from-emerald-500", to: "to-teal-600" },
  "Foundations": { from: "from-orange-500", to: "to-rose-600" },
  "Training": { from: "from-pink-500", to: "to-red-600" },
  "Activation Functions": { from: "from-cyan-500", to: "to-blue-600" },
  "Data Structures": { from: "from-amber-500", to: "to-orange-600" },
  "Complexity Analysis": { from: "from-teal-500", to: "to-emerald-600" },
};

const COLORS = [
  { from: "from-indigo-500", to: "to-purple-600" },
  { from: "from-purple-500", to: "to-pink-600" },
  { from: "from-blue-500", to: "to-cyan-600" },
  { from: "from-emerald-500", to: "to-teal-600" },
  { from: "from-orange-500", to: "to-rose-600" },
];

function getTopicColor(topic: string) {
  return TOPIC_COLORS[topic] ?? COLORS[topic.length % COLORS.length];
}

export default function FlashCard({ front, back, topic }: FlashCardProps) {
  const [flipped, setFlipped] = useState(false);
  const tc = getTopicColor(topic);

  return (
    <div onClick={() => setFlipped(!flipped)} className="cursor-pointer group card-hover">
      <div className="relative h-56 w-full [perspective:1000px]">
        <div className={`absolute inset-0 transition-all duration-700 [transform-style:preserve-3d] ${flipped ? "[transform:rotateY(180deg)]" : ""}`}>
          {/* Front */}
          <div className="absolute inset-0 flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm [backface-visibility:hidden] transition-all group-hover:shadow-lg group-hover:border-indigo-200">
            <div className="flex items-center justify-between mb-4">
              <span className={`rounded-full bg-gradient-to-r ${tc.from} ${tc.to} px-3 py-1 text-xs font-medium text-white shadow-sm`}>
                {topic}
              </span>
              <svg className="h-4 w-4 text-gray-300 transition-transform group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <div className="flex flex-1 items-center justify-center">
              <p className="text-center text-lg font-semibold text-gray-800 leading-relaxed">{front}</p>
            </div>
            <p className="mt-4 text-center text-xs text-gray-400 transition-all group-hover:text-indigo-500">Tap to flip →</p>
          </div>

          {/* Back */}
          <div className={`absolute inset-0 flex flex-col rounded-2xl bg-gradient-to-br ${tc.from} ${tc.to} p-6 shadow-md [backface-visibility:hidden] [transform:rotateY(180deg)]`}>
            <div className="flex items-center justify-between mb-4">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">Answer</span>
              <svg className="h-4 w-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <div className="flex flex-1 items-center justify-center">
              <p className="text-center text-lg text-white leading-relaxed font-medium">{back}</p>
            </div>
            <p className="mt-4 text-center text-xs text-white/60">Tap to flip back</p>
          </div>
        </div>
      </div>
    </div>
  );
}
