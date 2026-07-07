import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";
import { useTheme } from "../../../context/ThemeContext";
import { useStudentAnalytics } from "../../../hooks/useCore";

const ChartsSection: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { data, isLoading } = useStudentAnalytics();

  const textColor = isDark ? "#94a3b8" : "#4b5563";
  const gridColor = isDark ? "#334155" : "#e5e7eb";
  const tooltipStyle = {
    backgroundColor: isDark ? "#1e293b" : "#fff",
    borderColor: isDark ? "#334155" : "#e5e7eb",
    color: isDark ? "#f8fafc" : "#000",
  };

  const timeline = data?.score_timeline ?? [];

  // Top 6 topics for bar chart
  const topicBars = (data?.topics ?? []).slice(0, 6).map((t) => ({
    topic: t.topic.length > 18 ? t.topic.slice(0, 18) + "…" : t.topic,
    score: t.strength_score,
  }));

  const getBarColor = (score: number) => {
    if (score >= 80) return "#10b981"; // green
    if (score >= 60) return "#6366f1"; // indigo
    return "#f59e0b"; // amber
  };

  const SkeletonChart = () => (
    <div className="h-80 flex items-center justify-center">
      <div className="w-full h-full bg-gray-100 dark:bg-slate-800 rounded-lg animate-pulse" />
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Progress Over Time */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Progress Over Time</h3>
        {isLoading ? <SkeletonChart /> : timeline.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-gray-400 text-sm">No test data yet</div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="date" tick={{ fill: textColor, fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: textColor, fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v}%`, "Score"]} />
                <Line
                  type="monotone" dataKey="score" stroke="#6366f1"
                  strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Topic Score Bar Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Topic Scores</h3>
        {isLoading ? <SkeletonChart /> : topicBars.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-gray-400 text-sm">No topic data yet</div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicBars} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="topic" tick={{ fill: textColor, fontSize: 10 }} angle={-30} textAnchor="end" />
                <YAxis domain={[0, 100]} tick={{ fill: textColor, fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v}%`, "Score"]} />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {topicBars.map((entry, i) => (
                    <Cell key={i} fill={getBarColor(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartsSection;
