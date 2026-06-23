import React, { useState } from "react";
import {
  LuWand,
  LuTrash2,
  LuEye,
  LuCalendarClock,
  LuClipboardList,
  LuChevronRight,
  LuX,
  LuUser,
  LuCircleCheck,
  LuCircleAlert,
  LuFileQuestion,
} from "react-icons/lu";
import { useAssignments, useDeleteAssignment, useAssignment, useAssignmentSubmissions } from "../../../hooks/useCore";
import { Assignment, AssignmentSubmission } from "../../../services/core.service";

// ── Assignment Detail Modal ────────────────────────────────────────────────────

const AssignmentDetailModal: React.FC<{ assignmentId: string; onClose: () => void }> = ({ assignmentId, onClose }) => {
  const { data: assignmentData, isLoading: loadingAssignment } = useAssignment(assignmentId);
  const { data: submissionsData, isLoading: loadingSubs } = useAssignmentSubmissions(assignmentId);
  const assignment = assignmentData?.assignment;
  const submissions = submissionsData?.submissions ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <LuClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                {loadingAssignment ? "Loading..." : assignment?.title}
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Assignment Details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {loadingAssignment ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : assignment ? (
            <>
              {/* Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Total Marks</p>
                  <p className="font-bold text-gray-900 dark:text-white">{assignment.total_marks}</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Deadline</p>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">
                    {assignment.deadline ? new Date(assignment.deadline).toLocaleDateString() : "—"}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Created</p>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">
                    {new Date(assignment.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Description */}
              {assignment.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Description</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4">
                    {assignment.description}
                  </p>
                </div>
              )}

              {/* Questions */}
              {(assignment as any).questions?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <LuFileQuestion className="w-4 h-4 text-indigo-500" />
                    Questions ({(assignment as any).questions.length})
                  </h3>
                  <div className="space-y-2">
                    {(assignment as any).questions.map((q: any, idx: number) => (
                      <div key={q.id} className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 border border-gray-100 dark:border-slate-700">
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">{q.text}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs text-gray-400 dark:text-slate-500 capitalize">{q.question_type}</span>
                              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{q.points} pts</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}

          {/* Submissions */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <LuUser className="w-4 h-4 text-emerald-500" />
              Student Submissions
            </h3>
            {loadingSubs ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
                <LuUser className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-gray-400 dark:text-slate-500">No submissions yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-slate-800 text-xs uppercase text-gray-500 dark:text-slate-500 font-semibold">
                    <tr>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {submissions.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{s.student_name}</td>
                        <td className="px-4 py-3">
                          {s.score !== null ? (
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{s.score}</span>
                          ) : (
                            <span className="text-gray-400 dark:text-slate-500">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {s.is_late ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                              <LuCircleAlert className="w-3 h-3" /> Late
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                              <LuCircleCheck className="w-3 h-3" /> On time
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-400 dark:text-slate-500 text-xs">
                          {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Assignments List ───────────────────────────────────────────────────────────

const AssignmentsList: React.FC = () => {
  const { data, isLoading } = useAssignments();
  const deleteAssignment = useDeleteAssignment();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const assignments = data?.assignments ?? [];

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Delete this assignment and all linked data? This cannot be undone.")) {
      deleteAssignment.mutate(id);
    }
  };

  const isUpcomingSoon = (deadline: string | null) => {
    if (!deadline) return false;
    const diff = new Date(deadline).getTime() - Date.now();
    return diff > 0 && diff < 48 * 60 * 60 * 1000;
  };

  return (
    <>
      {selectedId && (
        <AssignmentDetailModal assignmentId={selectedId} onClose={() => setSelectedId(null)} />
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="space-y-px">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-50 dark:bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-400 mb-4">
              <LuWand className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-semibold text-gray-700 dark:text-slate-300 mb-1">No assignments yet</h4>
            <p className="text-sm text-gray-400 dark:text-slate-500 max-w-xs">
              Use the AI Chat to generate assignments. They'll appear here once created.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-slate-400">
              <thead className="bg-gray-50 dark:bg-slate-800 text-xs uppercase text-gray-500 dark:text-slate-500 font-semibold">
                <tr>
                  <th className="px-6 py-4">Assignment</th>
                  <th className="px-6 py-4">Deadline</th>
                  <th className="px-6 py-4">Total Marks</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {assignments.map((a) => (
                  <tr
                    key={a.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedId(a.id)}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <LuClipboardList className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        <span className="line-clamp-1">{a.title}</span>
                        {a.course_id && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium">GC</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {a.deadline ? (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          isUpcomingSoon(a.deadline)
                            ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                            : new Date(a.deadline) < new Date()
                              ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                              : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400"
                        }`}>
                          {new Date(a.deadline).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-indigo-600 dark:text-indigo-400">{a.total_marks}</td>
                    <td className="px-6 py-4 text-gray-400 dark:text-slate-500">
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedId(a.id); }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-all flex items-center gap-1"
                        >
                          <LuEye className="w-3 h-3" /> View
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, a.id)}
                          className="p-1.5 rounded-lg text-gray-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                          title="Delete"
                        >
                          <LuTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default AssignmentsList;
