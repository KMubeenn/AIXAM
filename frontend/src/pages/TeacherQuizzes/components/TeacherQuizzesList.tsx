import React, { useState } from "react";
import {
  LuFileQuestion,
  LuTrash2,
  LuFileText,
  LuDownload,
  LuLoader,
  LuChevronDown,
  LuChevronUp,
  LuUser,
  LuCircleAlert,
  LuCircleCheck,
  LuSparkles,
} from "react-icons/lu";
import { useTeacherQuizzes, useDeleteQuiz, useBatchGrades, useGenerateClassReport } from "../../../hooks/useCore";

// ── Batch Grades Panel ────────────────────────────────────────────────────────

const BatchGradesPanel: React.FC<{ assignmentId: string }> = ({ assignmentId }) => {
  const { data, isLoading } = useBatchGrades(assignmentId);
  const generateReport = useGenerateClassReport();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const grades = data?.grades ?? [];

  const handleDownloadReport = async () => {
    try {
      const report = await generateReport.mutateAsync({ assignmentId });
      // Decode base64 and trigger download
      const bytes = atob(report.file_base64);
      const arr = new Uint8Array(bytes.length);
      for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
      const blob = new Blob([arr], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = report.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Report download failed:", e);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2 mt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (grades.length === 0) {
    return (
      <div className="text-center py-10 mt-4 bg-gray-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
        <LuSparkles className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
        <p className="text-sm text-gray-400 dark:text-slate-500">No batch grading results yet for this assignment.</p>
        <p className="text-xs text-gray-300 dark:text-slate-600 mt-1">Use the AI Chat to run batch grading first.</p>
      </div>
    );
  }

  const classAvg = grades.reduce((sum, g) => sum + (g.score ?? 0), 0) / grades.length;

  return (
    <div className="mt-4 space-y-3">
      {/* Summary bar */}
      <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
        <div>
          <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium uppercase tracking-wider">Class Average</p>
          <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{classAvg.toFixed(1)}%</p>
          <p className="text-xs text-indigo-400 dark:text-indigo-500">{grades.length} students graded</p>
        </div>
        <button
          onClick={handleDownloadReport}
          disabled={generateReport.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
        >
          {generateReport.isPending ? (
            <LuLoader className="w-4 h-4 animate-spin" />
          ) : (
            <LuDownload className="w-4 h-4" />
          )}
          {generateReport.isPending ? "Generating..." : "Download PDF Report"}
        </button>
      </div>

      {/* Per-student rows */}
      {grades.map((g) => (
        <div key={g.id} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
            onClick={() => setExpandedId(expandedId === g.id ? null : g.id)}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-sm font-bold flex-shrink-0">
                {g.student_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{g.student_name}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500">{g.student_email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {g.is_late && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                  <LuCircleAlert className="w-3 h-3" /> Late
                </span>
              )}
              <span className={`text-lg font-bold ${(g.score ?? 0) >= 50 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                {g.score !== null ? `${g.score}%` : "—"}
              </span>
              {expandedId === g.id ? (
                <LuChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <LuChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </div>
          </button>

          {expandedId === g.id && (
            <div className="border-t border-gray-100 dark:border-slate-800 p-4 space-y-3">
              {g.feedback && (
                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">Overall Feedback</p>
                  <p className="text-sm text-gray-700 dark:text-slate-300">{g.feedback}</p>
                </div>
              )}
              {g.grading_details?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">Question Breakdown</p>
                  {g.grading_details.map((d, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg p-3">
                      <span className="flex-shrink-0 text-xs font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded">
                        Q{idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 dark:text-slate-300">{d.feedback}</p>
                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                          {d.marks} / {d.max_marks} marks
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ── Teacher Quizzes List ──────────────────────────────────────────────────────

const TeacherQuizzesList: React.FC = () => {
  const { data, isLoading } = useTeacherQuizzes();
  const deleteQuiz = useDeleteQuiz();
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);
  const quizzes = data?.quizzes ?? [];

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Delete this quiz? This cannot be undone.")) {
      deleteQuiz.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quizzes Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="space-y-px">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-50 dark:bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-400 mb-4">
              <LuFileQuestion className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-semibold text-gray-700 dark:text-slate-300 mb-1">No quizzes yet</h4>
            <p className="text-sm text-gray-400 dark:text-slate-500 max-w-xs">
              Ask the AI agent to generate a quiz. Assignment quizzes will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-slate-400">
              <thead className="bg-gray-50 dark:bg-slate-800 text-xs uppercase text-gray-500 dark:text-slate-500 font-semibold">
                <tr>
                  <th className="px-6 py-4">Quiz Title</th>
                  <th className="px-6 py-4">Questions</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {quizzes.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <LuFileQuestion className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="line-clamp-1">{q.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{q.question_count}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 dark:text-slate-500">
                      {new Date(q.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setExpandedQuizId(q.id);
                            setSelectedAssignmentId(q.id);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all flex items-center gap-1"
                        >
                          <LuFileText className="w-3 h-3" /> View Grades
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, q.id)}
                          className="p-1.5 rounded-lg text-gray-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                          title="Delete quiz"
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

      {/* Batch Grades panel */}
      {selectedAssignmentId && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <LuSparkles className="w-4 h-4 text-indigo-500" />
              AI Batch Grading Results
            </h3>
            <button
              onClick={() => setSelectedAssignmentId(null)}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
            >
              Close
            </button>
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-500 mb-2">
            Showing grades for the selected quiz's assignment.
          </p>
          <BatchGradesPanel assignmentId={selectedAssignmentId} />
        </div>
      )}
    </div>
  );
};

export default TeacherQuizzesList;
