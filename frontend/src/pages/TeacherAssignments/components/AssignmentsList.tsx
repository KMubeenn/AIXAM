import React, { useState } from "react";
import {
  LuWand,
  LuTrash2,
  LuEye,
  LuCalendarClock,
  LuClipboardList,
  LuX,
  LuUser,
  LuCircleCheck,
  LuCircleAlert,
  LuFileQuestion,
  LuDownload,
  LuShare2,
  LuCloudUpload,
  LuCheck,
  LuLoader,
} from "react-icons/lu";
import {
  useAssignments,
  useDeleteAssignment,
  useAssignment,
  useAssignmentSubmissions,
  useGradeLocalSubmission,
  usePostClassroomReport,
  useGenerateClassReport,
  usePostAssignmentToClassroom,
  useClassroomCourses,
} from "../../../hooks/useCore";
import { Assignment, AssignmentSubmission } from "../../../services/core.service";

// ── Assignment Detail Modal ────────────────────────────────────────────────────

const AssignmentDetailModal: React.FC<{ assignmentId: string; onClose: () => void }> = ({ assignmentId, onClose }) => {
  const { data: assignmentData, isLoading: loadingAssignment } = useAssignment(assignmentId);
  const { data: submissionsData, isLoading: loadingSubs } = useAssignmentSubmissions(assignmentId);
  const assignment = assignmentData?.assignment;
  const submissions = submissionsData?.submissions ?? [];

  // Mutations
  const gradeSubmission = useGradeLocalSubmission();
  const postClassroomReport = usePostClassroomReport();
  const generateReport = useGenerateClassReport();

  // Local state
  const [gradingSubmission, setGradingSubmission] = useState<AssignmentSubmission | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(0);
  const [gradeFeedback, setGradeFeedback] = useState<string>("");
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [postingReport, setPostingReport] = useState(false);
  const [savingGrade, setSavingGrade] = useState(false);

  const startGrading = (sub: AssignmentSubmission) => {
    setGradingSubmission(sub);
    setGradeScore(sub.score ?? 0);
    setGradeFeedback(sub.feedback ?? "");
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;
    try {
      setSavingGrade(true);
      await gradeSubmission.mutateAsync({
        submissionId: gradingSubmission.id,
        score: gradeScore,
        feedback: gradeFeedback,
      });
      setGradingSubmission(null);
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || "Failed to update grade");
    } finally {
      setSavingGrade(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      setGeneratingPdf(true);
      const res = await generateReport.mutateAsync({ assignmentId });
      const byteCharacters = atob(res.file_base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: res.mime_type });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || "Failed to generate report");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handlePostReport = async () => {
    try {
      setPostingReport(true);
      await postClassroomReport.mutateAsync(assignmentId);
      alert("Performance report has been posted to Google Classroom successfully!");
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || "Failed to post report to Classroom");
    } finally {
      setPostingReport(false);
    }
  };

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
                Assignment details and student submissions
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
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1 font-medium">Total Marks</p>
                  <p className="font-bold text-gray-900 dark:text-white">{assignment.total_marks}</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1 font-medium">Deadline</p>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">
                    {assignment.deadline ? new Date(assignment.deadline).toLocaleDateString() : "—"}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1 font-medium">Created</p>
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
                    {(assignment as any).questions.map((q: any, idx: number) => {
                      const [questionText, rubric] = (q.text || "").split("\n\nRUBRIC:");
                      return (
                        <div key={q.id} className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 border border-gray-100 dark:border-slate-700 space-y-2">
                          <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">{questionText}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-xs text-gray-400 dark:text-slate-500 capitalize">{q.question_type}</span>
                                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{q.points} pts</span>
                              </div>
                            </div>
                          </div>
                          {rubric && (
                            <div className="pl-9 text-xs text-gray-500 dark:text-slate-400 bg-amber-50/20 dark:bg-amber-950/10 p-2.5 rounded-lg border border-amber-100/20">
                              <span className="font-semibold text-amber-600 dark:text-amber-400 mr-1">Rubric:</span>
                              {rubric.trim()}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : null}

          {/* Grading sub-modal / form section */}
          {gradingSubmission && (
            <div className="bg-indigo-50/30 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700 rounded-xl p-5 space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <LuUser className="w-4 h-4 text-indigo-500" />
                Grading: {gradingSubmission.student_name}
              </h4>
              <form onSubmit={handleSaveGrade} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                      Score (out of {assignment?.total_marks ?? 100})
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max={assignment?.total_marks ?? 100}
                      value={gradeScore}
                      onChange={(e) => setGradeScore(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                      Feedback
                    </label>
                    <textarea
                      value={gradeFeedback}
                      onChange={(e) => setGradeFeedback(e.target.value)}
                      placeholder="Add guidance or notes..."
                      className="w-full px-3.5 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none h-[40px] resize-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setGradingSubmission(null)}
                    className="px-3.5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingGrade}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {savingGrade ? (
                      <LuLoader className="w-3.5 h-3.5 animate-spin" />
                    ) : null}
                    Save Grade
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Submissions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
                <LuUser className="w-4 h-4 text-emerald-500" />
                Student Submissions
              </h3>

              {/* Actions at bottom of submissions */}
              {!loadingSubs && submissions.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadReport}
                    disabled={generatingPdf}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {generatingPdf ? (
                      <LuLoader className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <LuDownload className="w-3.5 h-3.5" />
                    )}
                    Download Report
                  </button>

                  {assignment?.course_id && (
                    <button
                      onClick={handlePostReport}
                      disabled={postingReport}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {postingReport ? (
                        <LuLoader className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <LuShare2 className="w-3.5 h-3.5" />
                      )}
                      Post to Classroom
                    </button>
                  )}
                </div>
              )}
            </div>

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
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {submissions.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                          <div>
                            <p className="font-semibold text-xs">{s.student_name}</p>
                            {s.feedback && (
                              <p className="text-[10px] text-gray-400 dark:text-slate-500 italic mt-0.5 line-clamp-1">
                                Feedback: {s.feedback}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {s.score !== null ? (
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                              {s.score} / {assignment?.total_marks}
                            </span>
                          ) : (
                            <span className="text-gray-400 dark:text-slate-500">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {s.is_late ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                              <LuCircleAlert className="w-3 h-3" /> Late
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                              <LuCircleCheck className="w-3 h-3" /> On time
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-400 dark:text-slate-500 text-xs">
                          {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => startGrading(s)}
                            className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all"
                          >
                            Grade
                          </button>
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

// ── Post to Classroom Modal ────────────────────────────────────────────────────

const PostToClassroomModal: React.FC<{ assignmentId: string; onClose: () => void }> = ({ assignmentId, onClose }) => {
  const { data, isLoading } = useClassroomCourses();
  const postMutation = usePostAssignmentToClassroom();
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const courses = data?.courses ?? [];

  const toggleCourse = (id: string) => {
    setSelectedCourses(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handlePost = async () => {
    if (selectedCourses.length === 0) return;
    try {
      await postMutation.mutateAsync({ assignmentId, courseIds: selectedCourses });
      alert("Successfully posted assignment to selected classrooms!");
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || "Failed to post to classroom");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-slate-700 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <LuCloudUpload className="w-5 h-5 text-indigo-500" />
            Post to Classroom
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <LuX className="w-5 h-5" />
          </button>
        </div>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-slate-800 animate-pulse rounded-xl" />)}
          </div>
        ) : courses.length === 0 ? (
          <p className="text-gray-500 dark:text-slate-400 text-sm text-center py-4">No Google Classroom courses found.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {courses.map(course => (
              <div 
                key={course.id} 
                onClick={() => toggleCourse(course.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  selectedCourses.includes(course.id) 
                    ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20" 
                    : "border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                }`}
              >
                {selectedCourses.includes(course.id) ? (
                  <div className="w-5 h-5 rounded border border-indigo-500 bg-indigo-500 flex items-center justify-center">
                    <LuCheck className="w-3.5 h-3.5 text-white" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded border border-gray-300 dark:border-slate-600" />
                )}
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">{course.name}</p>
                  {course.description && <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-1">{course.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button 
            onClick={handlePost}
            disabled={selectedCourses.length === 0 || postMutation.isPending}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            {postMutation.isPending && <LuLoader className="w-4 h-4 animate-spin" />}
            Post ({selectedCourses.length})
          </button>
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
  const [postModalAssignmentId, setPostModalAssignmentId] = useState<string | null>(null);
  const assignments = (data?.assignments ?? []) as Assignment[];

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
      {postModalAssignmentId && (
        <PostToClassroomModal assignmentId={postModalAssignmentId} onClose={() => setPostModalAssignmentId(null)} />
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
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Deadline</th>
                  <th className="px-6 py-4">Total Marks</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4">AI Graded</th>
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
                          <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold">GC</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-semibold">
                        Assignment
                      </span>
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
                      {a.has_submissions ? (
                        a.is_graded ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                            No
                          </span>
                        )
                      ) : (
                        <span className="text-gray-400 dark:text-slate-500">No Submissions</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setPostModalAssignmentId(a.id); }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-600 hover:text-white dark:hover:bg-green-600 transition-all flex items-center gap-1 opacity-0 group-hover:opacity-100"
                          title="Post to Google Classroom"
                        >
                          <LuCloudUpload className="w-3.5 h-3.5" /> Post
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedId(a.id); }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-all flex items-center gap-1"
                        >
                          <LuEye className="w-3.5 h-3.5" /> View
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
