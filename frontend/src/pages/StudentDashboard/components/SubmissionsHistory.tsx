import React from "react";
import { LuCalendar, LuAward, LuFileText } from "react-icons/lu";
import { FiCheckCircle } from "react-icons/fi";
import { useSubmissions } from "../../../hooks/useCore";

const SubmissionsHistory: React.FC = () => {
  const { data, isLoading } = useSubmissions();
  const submissions = data?.submissions ?? [];

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-gray-400";
    if (score >= 80) return "text-emerald-500";
    if (score >= 50) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Attempts</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            {isLoading ? "Loading history..." : `You've completed ${submissions.length} test${submissions.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 animate-pulse">
            Loading your performance history...
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-300 mb-3">
              <FiCheckCircle className="w-6 h-6" />
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400">No attempts found yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-slate-400">
              <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs uppercase text-gray-500 dark:text-slate-500 font-semibold border-b border-gray-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Test Title</th>
                  <th className="px-6 py-4">Submitted At</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500">
                          <LuFileText className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white line-clamp-1">
                          {sub.quiz_title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-500">
                        <LuCalendar className="w-3.5 h-3.5" />
                        {new Date(sub.submitted_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <LuAward className={`w-4 h-4 ${getScoreColor(sub.score)}`} />
                        <span className={`font-bold ${getScoreColor(sub.score)}`}>
                          {sub.score !== null ? `${Math.round(sub.score)}%` : "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 max-w-md italic">
                        "{sub.feedback || "No feedback provided."}"
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionsHistory;
