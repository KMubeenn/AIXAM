import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { useTheme } from "../../../context/ThemeContext";
import { useTeacherAnalytics } from "../../../hooks/useCore";
import { LuUsers, LuTrendingUp, LuTrendingDown } from "react-icons/lu";

const DISTRIBUTION_COLORS: Record<string, string> = {
  "90-100": "#10b981",
  "75-89": "#6366f1",
  "50-74": "#f59e0b",
  "0-49": "#ef4444",
};

const TeacherAnalyticsCharts: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { data, isLoading } = useTeacherAnalytics();

  const textColor = isDark ? "#94a3b8" : "#4b5563";
  const gridColor = isDark ? "#334155" : "#e5e7eb";
  const tooltipStyle = {
    backgroundColor: isDark ? "#1e293b" : "#fff",
    borderColor: isDark ? "#334155" : "#e5e7eb",
    color: isDark ? "#f8fafc" : "#000",
  };

  const SkeletonChart = () => (
    <div className="h-72 flex items-center justify-center">
      <div className="w-full h-full bg-gray-100 dark:bg-slate-800 rounded-lg animate-pulse" />
    </div>
  );

  const distributionData = data
    ? Object.entries(data.score_distribution ?? {}).map(([range, count]) => ({ range, count }))
    : [];

  const perAssignment = data?.per_assignment ?? [];

  if (!isLoading && !data) return null;

  return (
    <div className="space-y-6 mt-6">
      {/* Highlights row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <LuUsers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-slate-400">Students Graded</p>
            {isLoading ? (
              <div className="h-6 w-12 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{data?.student_count ?? 0}</p>
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <LuTrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-slate-400">Strongest Topic</p>
            {isLoading ? (
              <div className="h-6 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                {data?.strongest_topic ?? "N/A"}
              </p>
            )}
            <p className="text-xs text-emerald-600 dark:text-emerald-400">{data?.strongest_avg ?? 0}% avg</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
            <LuTrendingDown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-slate-400">Weakest Topic</p>
            {isLoading ? (
              <div className="h-6 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                {data?.weakest_topic ?? "N/A"}
              </p>
            )}
            <p className="text-xs text-amber-600 dark:text-amber-400">{data?.weakest_avg ?? 0}% avg</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Per-Assignment Avg Scores */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Avg Score per Assignment</h3>
          {isLoading ? <SkeletonChart /> : perAssignment.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-gray-400 text-sm">No graded data yet</div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={perAssignment} margin={{ top: 5, right: 10, left: 0, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis
                    dataKey="title"
                    tick={{ fill: textColor, fontSize: 10 }}
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis domain={[0, 100]} tick={{ fill: textColor, fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v}%`, "Avg Score"]} />
                  <Bar dataKey="avg_score" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Score Distribution Pie */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Score Distribution</h3>
          {isLoading ? <SkeletonChart /> : distributionData.every((d) => d.count === 0) ? (
            <div className="h-72 flex items-center justify-center text-gray-400 text-sm">No graded data yet</div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    dataKey="count"
                    nameKey="range"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(props: any) => props.count > 0 ? `${props.range}: ${props.count}` : ""}
                  >
                    {distributionData.map((entry, i) => (
                      <Cell key={i} fill={DISTRIBUTION_COLORS[entry.range] ?? "#6366f1"} />
                    ))}
                  </Pie>
                  <Legend formatter={(value) => <span style={{ color: textColor, fontSize: 12 }}>{value}</span>} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [v, "Students"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherAnalyticsCharts;
