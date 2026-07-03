import React, { useState } from "react";
import { LuTrendingUp, LuBookOpen, LuLightbulb, LuLoader, LuSparkles } from "react-icons/lu";
import { useGenerateInsights } from "../../../hooks/useCore";

const iconMap: Record<string, React.ReactNode> = {
  strength: <LuTrendingUp className="w-6 h-6" />,
  weakness: <LuBookOpen className="w-6 h-6" />,
  tip: <LuLightbulb className="w-6 h-6" />,
};

type InsightResult = {
  subjects: { name: string; avg_score: number; topics: string[] }[];
  insights: { type: string; title: string; message: string }[];
};

const Insights: React.FC = () => {
  const generateInsights = useGenerateInsights();
  const [result, setResult] = useState<InsightResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setError(null);
    try {
      const data = await generateInsights.mutateAsync();
      setResult(data);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to generate insights. Please try again.");
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-sm p-8 text-white mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-2xl font-bold">AI-Powered Insights</h3>
          <p className="text-indigo-200 mt-1">
            {result ? "Your personalized subject analysis and study tips" : "Click to analyze your performance with AI"}
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generateInsights.isPending}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 flex-shrink-0"
        >
          {generateInsights.isPending
            ? <><LuLoader className="w-4 h-4 animate-spin" /> Analyzing...</>
            : <><LuSparkles className="w-4 h-4" /> {result ? "Re-generate" : "Generate Insights"}</>
          }
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-400/40 rounded-lg p-3 text-sm text-red-200 mb-4">
          {error}
        </div>
      )}

      {!result && !generateInsights.isPending && (
        <div className="text-center py-6 text-indigo-200 text-sm">
          Your performance data will be analyzed to group your topics into subjects and give you personalized tips.
        </div>
      )}

      {result && (
        <>
          {/* Subject Clusters */}
          {result.subjects.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-indigo-200 uppercase tracking-wider mb-3">Subject Overview</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {result.subjects.map((s, i) => (
                  <div key={i} className="bg-white/10 rounded-lg p-3">
                    <p className="font-semibold text-sm truncate">{s.name}</p>
                    <p className={`text-2xl font-bold mt-1 ${s.avg_score >= 75 ? "text-emerald-300" : s.avg_score >= 50 ? "text-yellow-300" : "text-red-300"}`}>
                      {Math.round(s.avg_score)}%
                    </p>
                    <p className="text-xs text-indigo-300 mt-1">{s.topics.length} topic{s.topics.length !== 1 ? "s" : ""}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Insights */}
          {result.insights.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-indigo-200 uppercase tracking-wider mb-3">Personalized Recommendations</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.insights.map((ins, i) => (
                  <div key={i} className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                      {iconMap[ins.type] ?? <LuLightbulb className="w-6 h-6" />}
                    </div>
                    <h4 className="font-semibold mb-2">{ins.title}</h4>
                    <p className="text-sm text-indigo-100">{ins.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Insights;
