import React, { useState } from "react";
import {
  LuCalendar, LuAward, LuFileText, LuX,
  LuInfo, LuChevronDown, LuChevronUp, LuLayers,
} from "react-icons/lu";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import { useSubmissions, useSubmissionDetail } from "../../../hooks/useCore";
import { GradingItem } from "../../../services/core.service";

// ── Detail Modal ────────────────────────────────────────────────────────────

export const SubmissionDetailModal: React.FC<{ id: string; onClose: () => void }> = ({ id, onClose }) => {
  const { data, isLoading } = useSubmissionDetail(id);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const scoreColor = (score: number | null) => {
    if (score === null) return "text-gray-400";
    if (score >= 80) return "text-emerald-500";
    if (score >= 50) return "text-amber-500";
    return "text-red-500";
  };

  const itemColor = (marks: number, max: number) => {
    const pct = max > 0 ? marks / max : 0;
    if (pct >= 0.7) return { border: "border-emerald-200 dark:border-emerald-800", bg: "bg-emerald-50 dark:bg-emerald-900/20" };
    return { border: "border-red-200 dark:border-red-800", bg: "bg-red-50 dark:bg-red-900/20" };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {isLoading ? "Loading..." : data?.quiz_title}
            </h2>
            {!isLoading && data && (
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-sm font-bold ${scoreColor(data.score)}`}>
                  {data.score !== null ? `${Math.round(data.score)}%` : "N/A"}
                </span>
                <span className="text-xs text-gray-400 dark:text-slate-500">
                  {new Date(data.submitted_at).toLocaleDateString()}
                </span>
                {data.is_late && (
                  <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                    Late
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 transition-colors"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : !data?.grading_details?.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <LuLayers className="w-8 h-8 text-gray-300 dark:text-slate-600 mb-3" />
              <p className="text-sm text-gray-400 dark:text-slate-500">No detailed grading data available for this submission.</p>
              {data?.feedback && (
                <p className="mt-4 text-sm text-gray-600 dark:text-slate-300 italic max-w-md">"{data.feedback}"</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Overall feedback */}
              {data.feedback && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl mb-4">
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Overall Feedback</p>
                  <p className="text-sm text-gray-600 dark:text-slate-300">{data.feedback}</p>
                </div>
              )}

              {/* Per-question breakdown */}
              {(data.grading_details as GradingItem[]).map((item, idx) => {
                const pct = item.max_marks > 0 ? item.marks / item.max_marks : 0;
                const isGood = pct >= 0.7;
                const { border, bg } = itemColor(item.marks, item.max_marks);
                const isExpanded = expandedIdx === idx;

                return (
                  <div
                    key={idx}
                    className={`rounded-xl border ${border} ${bg} overflow-hidden transition-all`}
                  >
                    <button
                      className="w-full flex items-start justify-between gap-3 p-4 text-left"
                      onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {isGood ? (
                          <FiCheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <FiXCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        )}
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">
                          Q{idx + 1}. {item.question}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-sm font-bold ${isGood ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                          {item.marks}/{item.max_marks}
                        </span>
                        {isExpanded ? (
                          <LuChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <LuChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-2 text-xs border-t border-current/10">
                        {item.student_answer && (
                          <div className="pt-3">
                            <p className="font-semibold text-gray-500 dark:text-slate-400 mb-1">Your Answer</p>
                            <p className="text-gray-700 dark:text-slate-300">{item.student_answer}</p>
                          </div>
                        )}
                        {item.correct_answer && (
                          <div>
                            <p className="font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Model Answer</p>
                            <p className="text-gray-700 dark:text-slate-300">{item.correct_answer}</p>
                          </div>
                        )}
                        {item.feedback && (
                          <div className="flex items-start gap-2 pt-1">
                            <LuInfo className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                            <p className="text-gray-600 dark:text-slate-300 italic">{item.feedback}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Component ──────────────────────────────────────────────────────────

const SubmissionsHistory: React.FC = () => {
  const { data, isLoading } = useSubmissions();
  const submissions = data?.submissions ?? [];
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-gray-400";
    if (score >= 80) return "text-emerald-500";
    if (score >= 50) return "text-amber-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number | null) => {
    if (score === null) return "bg-gray-100 dark:bg-slate-800";
    if (score >= 80) return "bg-emerald-50 dark:bg-emerald-900/20";
    if (score >= 50) return "bg-amber-50 dark:bg-amber-900/20";
    return "bg-red-50 dark:bg-red-900/20";
  };

  return (
    <>
      {selectedId && (
        <SubmissionDetailModal id={selectedId} onClose={() => setSelectedId(null)} />
      )}

      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Test History</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
              {isLoading
                ? "Loading history..."
                : `${submissions.length} test${submissions.length !== 1 ? "s" : ""} completed — click a row to see details`}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="space-y-px">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-50 dark:bg-slate-800/50 animate-pulse" />
              ))}
            </div>
          ) : submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-300 mb-3">
                <FiCheckCircle className="w-6 h-6" />
              </div>
              <p className="text-sm text-gray-500 dark:text-slate-400">No test attempts yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-slate-400">
                <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs uppercase text-gray-500 dark:text-slate-500 font-semibold border-b border-gray-100 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Test Title</th>
                    <th className="px-6 py-4">Questions</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {submissions.map((sub) => (
                    <tr
                      key={sub.id}
                      onClick={() => setSelectedId(sub.id)}
                      className="hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500">
                            <LuFileText className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                            {sub.quiz_title}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 px-2.5 py-1 rounded-full">
                          {sub.question_count} Q
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-500">
                          <LuCalendar className="w-3.5 h-3.5" />
                          {new Date(sub.submitted_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getScoreBg(sub.score)} ${getScoreColor(sub.score)}`}>
                          <LuAward className="w-3.5 h-3.5" />
                          {sub.score !== null ? `${Math.round(sub.score)}%` : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SubmissionsHistory;
