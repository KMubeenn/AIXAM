import React, { useState } from "react";
import {
  LuSparkles,
  LuLoader,
  LuTrendingUp,
  LuBookOpen,
  LuLightbulb,
} from "react-icons/lu";
import {
  FiTarget,
  FiCheckCircle,
  FiXCircle,
  FiCalendar,
  FiCpu,
  FiBarChart2,
  FiAlertTriangle
} from "react-icons/fi";
import { useGenerateInsights } from "../../../hooks/useCore";
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

type InsightResult = {
  overall_summary: {
    accuracy: number;
    questions_attempted: number;
    total_correct: number;
    total_incorrect: number;
    avg_score: number;
    subjects_attempted: number;
    topics_covered: number;
    summary_text: string;
    performance_badge: string;
  };
  subjects: {
    name: string;
    accuracy: number;
    questions_attempted: number;
    correct: number;
    incorrect: number;
    avg_time_per_question?: string;
  }[];
  strongest_subjects: {
    subject: string;
    accuracy: number;
    reason: string;
    explanation: string;
  }[];
  weakest_subjects: {
    subject: string;
    accuracy: number;
    incorrect_answers: number;
    difficult_topics: string[];
    improvement_potential: string;
  }[];
  weakest_topics: {
    topic_name: string;
    accuracy: number;
    questions_attempted: number;
    recommendation: string;
    priority: string;
  }[];
  study_plan: {
    day: string;
    action: string;
    details: string;
  }[];
  learning_analysis: string;
  exam_readiness: {
    score: number;
    status: string;
    explanation: string;
  };
  improvement_potential: {
    text: string;
    estimated_increase: number;
  };
  topic_heatmap: {
    topic: string;
    status: string;
    accuracy: number;
    correct: number;
    incorrect: number;
    attempted: number;
  }[];
  ai_recommendations: {
    priority: string;
    topic: string;
    estimated_benefit: string;
    action: string;
  }[];
  confidence_indicator: {
    score: number;
    explanation: string;
  };
};

const getBadgeColor = (badge: string) => {
  if (badge === "Excellent") return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50";
  if (badge === "Good") return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/50";
  if (badge === "Average") return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50";
  return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/50";
};

const getPriorityColor = (priority: string) => {
  if (priority.toLowerCase().includes("high")) return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";
  if (priority.toLowerCase().includes("medium")) return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20";
  return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20";
};

const Insights: React.FC = () => {
  const generateInsights = useGenerateInsights();
  const [result, setResult] = useState<InsightResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setError(null);
    try {
      const data = await generateInsights.mutateAsync();
      setResult(data as InsightResult);
    } catch (e: any) {
      const serverError = e?.response?.data?.error;
      let displayError = "Failed to generate insights. Please try again.";
      if (serverError) {
        if (serverError.includes("exhausted") || serverError.includes("quota")) {
          displayError = "AI service is currently experiencing high demand. Please try again in a few moments.";
        } else if (serverError.length < 100) {
          displayError = serverError;
        }
      }
      setError(displayError);
    }
  };

  const getReadinessColor = (score: number) => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#3b82f6";
    if (score >= 40) return "#f59e0b";
    return "#ef4444";
  };

  if (!result) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl shadow-xl p-10 text-white flex flex-col items-center justify-center min-h-[400px] border border-white/10 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500 blur-[80px]" />
          <div className="absolute top-[60%] -right-[10%] w-[30%] h-[40%] rounded-full bg-fuchsia-500 blur-[100px]" />
        </div>

        <LuSparkles className="w-16 h-16 text-indigo-400 mb-6 animate-pulse" />
        <h2 className="text-3xl font-bold mb-3 text-center">AI-Powered Analytics</h2>
        <p className="text-indigo-200 text-center max-w-lg mb-8">
          Generate a comprehensive, data-driven dashboard that analyzes your exact quiz history to provide personalized study plans, weakness detection, and exam readiness scores.
        </p>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6 w-full max-w-md text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={generateInsights.isPending}
          className="relative group overflow-hidden bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-xl transition-all disabled:opacity-60 disabled:hover:bg-indigo-600 flex items-center gap-3 shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] hover:shadow-[0_0_60px_-15px_rgba(99,102,241,0.7)]"
        >
          {generateInsights.isPending ? (
            <>
              <LuLoader className="w-5 h-5 animate-spin" />
              Generating Deep Analysis...
            </>
          ) : (
            <>
              <FiCpu className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Analyze My Performance
            </>
          )}
        </button>
      </div>
    );
  }

  const { overall_summary } = result;

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <LuSparkles className="text-indigo-600 dark:text-indigo-400" />
            Personalized Analytics Report
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Based on {overall_summary.questions_attempted} questions across {overall_summary.topics_covered} topics.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generateInsights.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60"
        >
          {generateInsights.isPending ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuSparkles className="w-4 h-4" />}
          Re-generate
        </button>
      </div>

      {/* 1. OVERALL PERFORMANCE SUMMARY */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Overall Summary</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getBadgeColor(overall_summary.performance_badge)}`}>
                {overall_summary.performance_badge}
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              {overall_summary.summary_text}
            </p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl flex-1 md:w-32 text-center border border-slate-100 dark:border-slate-700/50">
              <FiTarget className="w-5 h-5 mx-auto mb-2 text-indigo-500" />
              <div className="text-2xl font-black text-slate-900 dark:text-white">{overall_summary.accuracy}%</div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Accuracy</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl flex-1 md:w-32 text-center border border-slate-100 dark:border-slate-700/50">
              <FiCheckCircle className="w-5 h-5 mx-auto mb-2 text-emerald-500" />
              <div className="text-2xl font-black text-slate-900 dark:text-white">{overall_summary.total_correct}</div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Correct</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. EXAM READINESS & AI ANALYSIS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exam Readiness */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 w-full text-left">Exam Readiness</h3>
          <div className="relative w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[{ value: result.exam_readiness.score }, { value: 100 - result.exam_readiness.score }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={getReadinessColor(result.exam_readiness.score)} />
                  <Cell fill="rgba(148, 163, 184, 0.1)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{result.exam_readiness.score}%</span>
            </div>
          </div>
          <h4 className="font-bold text-lg mt-4" style={{ color: getReadinessColor(result.exam_readiness.score) }}>
            {result.exam_readiness.status}
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {result.exam_readiness.explanation}
          </p>
        </div>

        {/* AI Learning Analysis */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FiCpu className="text-indigo-500" /> Deep Learning Analysis
          </h3>
          <div className="bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 rounded-xl p-5 flex-1">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {result.learning_analysis}
            </p>
            
            <div className="mt-6 pt-6 border-t border-indigo-100 dark:border-indigo-500/20">
              <div className="flex items-start gap-3">
                <LuTrendingUp className="text-emerald-500 mt-1 flex-shrink-0" />
                <div>
                  <h5 className="font-semibold text-slate-900 dark:text-white text-sm">Improvement Potential</h5>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {result.improvement_potential.text}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SUBJECT PERFORMANCE CARDS */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white px-1">Subject Performance</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...result.subjects]
            .sort((a, b) => a.accuracy - b.accuracy)
            .map((subj, idx) => {
              const color = subj.accuracy >= 80 ? "bg-emerald-500" : subj.accuracy >= 60 ? "bg-blue-500" : subj.accuracy >= 40 ? "bg-yellow-500" : "bg-red-500";
              const bg = subj.accuracy >= 80 ? "bg-emerald-50 dark:bg-emerald-500/5" : subj.accuracy >= 60 ? "bg-blue-50 dark:bg-blue-500/5" : subj.accuracy >= 40 ? "bg-yellow-50 dark:bg-yellow-500/5" : "bg-red-50 dark:bg-red-500/5";
              const border = subj.accuracy >= 80 ? "border-emerald-100 dark:border-emerald-500/10" : subj.accuracy >= 60 ? "border-blue-100 dark:border-blue-500/10" : subj.accuracy >= 40 ? "border-yellow-100 dark:border-yellow-500/10" : "border-red-100 dark:border-red-500/10";
              
              return (
                <div key={idx} className={`${bg} ${border} border rounded-xl p-5 transition-all hover:shadow-md`}>
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1 flex-1 mr-2">{subj.name}</h4>
                    <span className="font-black text-lg text-slate-900 dark:text-white">{subj.accuracy}%</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mb-4 overflow-hidden">
                    <div className={`${color} h-1.5 rounded-full`} style={{ width: `${subj.accuracy}%` }} />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white/60 dark:bg-slate-800/60 rounded p-1.5">
                      <div className="font-semibold text-slate-900 dark:text-white">{subj.questions_attempted}</div>
                      <div className="text-slate-500">Qs</div>
                    </div>
                    <div className="bg-emerald-100/50 dark:bg-emerald-500/10 rounded p-1.5">
                      <div className="font-semibold text-emerald-700 dark:text-emerald-400">{subj.correct}</div>
                      <div className="text-emerald-600/70 dark:text-emerald-500/70">Right</div>
                    </div>
                    <div className="bg-red-100/50 dark:bg-red-500/10 rounded p-1.5">
                      <div className="font-semibold text-red-700 dark:text-red-400">{subj.incorrect}</div>
                      <div className="text-red-600/70 dark:text-red-500/70">Wrong</div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* 4. STRENGTHS & WEAKNESSES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strongest Subjects */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <LuTrendingUp className="text-emerald-500" /> Strongest Areas
          </h3>
          <div className="space-y-4">
            {result.strongest_subjects.map((s, i) => (
              <div key={i} className="flex gap-4 items-start p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                  {s.accuracy}%
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{s.subject}</h4>
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">{s.reason}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.explanation}</p>
                </div>
              </div>
            ))}
            {result.strongest_subjects.length === 0 && (
              <div className="text-sm text-slate-500 text-center py-4">Keep taking quizzes to build your strengths!</div>
            )}
          </div>
        </div>

        {/* Weakest Topics (Actionable) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FiAlertTriangle className="text-red-500" /> Priority Weaknesses
          </h3>
          <div className="space-y-3">
            {result.weakest_topics.map((t, i) => (
              <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700/50 transition-colors group">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-900 dark:text-white truncate">{t.topic_name}</h4>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getPriorityColor(t.priority)}`}>
                      {t.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{t.recommendation}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-black text-red-500">{t.accuracy}%</div>
                  <div className="text-[10px] text-slate-400">{t.questions_attempted} Qs</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. STUDY PLAN ROADMAP */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <FiCalendar className="text-indigo-500" /> Personalized Study Plan
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {result.study_plan.map((plan, i) => (
            <div key={i} className="relative p-4 bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 rounded-xl">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-sm border-4 border-white dark:border-slate-900">
                {i + 1}
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1 ml-3">{plan.day}</h4>
              <p className="font-medium text-indigo-700 dark:text-indigo-400 text-sm ml-3 mb-2">{plan.action}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 ml-3">{plan.details}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 6. AI RECOMMENDATIONS & CONFIDENCE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <LuLightbulb className="text-amber-500" /> Actionable Recommendations
          </h3>
          <div className="space-y-3">
            {result.ai_recommendations.map((rec, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 dark:text-white">{rec.topic}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{rec.action}</p>
                </div>
                <div className="sm:text-right flex items-center sm:items-end flex-row sm:flex-col justify-between">
                  <span className="text-xs text-slate-500 mb-1">Est. Benefit</span>
                  <span className="font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">
                    {rec.estimated_benefit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center text-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 w-full text-left">AI Confidence Score</h3>
          <div className="relative w-32 h-32 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[{ value: result.confidence_indicator.score }, { value: 100 - result.confidence_indicator.score }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={60}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#8b5cf6" />
                  <Cell fill="rgba(148, 163, 184, 0.1)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{result.confidence_indicator.score}%</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px]">
            {result.confidence_indicator.explanation}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Insights;
