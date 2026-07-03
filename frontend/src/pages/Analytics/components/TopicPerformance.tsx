import React from "react";
import { useStudentAnalytics } from "../../../hooks/useCore";

const getColor = (score: number) => {
  if (score >= 80) return { bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" };
  if (score >= 60) return { bar: "bg-indigo-500", text: "text-indigo-600 dark:text-indigo-400" };
  return { bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" };
};

const TopicPerformance: React.FC = () => {
  const { data, isLoading } = useStudentAnalytics();
  const topics = data?.topics ?? [];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-slate-800 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Topic-Level Performance</h3>
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-1/3" />
              <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : topics.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-8">
          No topic data yet. Complete some assignments or mock tests!
        </p>
      ) : (
        <div className="space-y-4">
          {topics.map((t, i) => {
            const { bar, text } = getColor(t.strength_score);
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300 truncate max-w-[70%]">
                    {t.topic}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-400">{t.tests_taken} test{t.tests_taken !== 1 ? "s" : ""}</span>
                    <span className={`text-sm font-semibold ${text}`}>{t.strength_score}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700/50 rounded-full h-2">
                  <div
                    className={`${bar} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(t.strength_score, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TopicPerformance;
