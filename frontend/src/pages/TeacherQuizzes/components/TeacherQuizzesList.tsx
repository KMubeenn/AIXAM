import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  LuFileQuestion,
  LuTrash2,
  LuEye,
  LuX,
  LuClock,
  LuLoader,
  LuCircleCheck,
  LuCloudUpload,
  LuCheck,
} from "react-icons/lu";
import {
  useTeacherQuizzes,
  useDeleteQuiz,
  useQuizDetail,
  usePostQuizToClassroom,
  useClassroomCourses,
} from "../../../hooks/useCore";

// ── Quiz Detail Modal ──────────────────────────────────────────────────────────

const QuizDetailModal: React.FC<{ quizId: string; onClose: () => void }> = ({ quizId, onClose }) => {
  const { data: quizData, isLoading } = useQuizDetail(quizId);
  const quiz = quizData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <LuFileQuestion className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                {isLoading ? "Loading Quiz..." : quiz?.title}
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Quiz Preview
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

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <LuLoader className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-400">Loading quiz content...</p>
            </div>
          ) : quiz ? (
            <>
              {/* Meta Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-0.5">Total Questions</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {quiz.questions?.length ?? 0}
                  </p>
                </div>
                {quiz.time_limit_minutes && (
                  <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-0.5">Time Limit</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <LuClock className="w-4 h-4 text-blue-500" />
                      {quiz.time_limit_minutes} min
                    </p>
                  </div>
                )}
                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-0.5">Created Date</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white text-sm">
                    {new Date(quiz.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Questions
                </h3>
                {quiz.questions?.map((q: any, idx: number) => {
                  const [questionText, explanation] = (q.text || "").split("\n\nEXPLANATION:");
                  return (
                    <div
                      key={q.id}
                      className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-5 border border-gray-100 dark:border-slate-700 space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                            {questionText}
                          </p>
                        </div>
                      </div>

                      {/* Choices */}
                      {q.choices && q.choices.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-9">
                          {q.choices.map((c: any) => (
                            <div
                              key={c.id}
                              className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                                c.is_correct
                                  ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/30 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-semibold"
                                  : "border-gray-100 bg-white dark:border-slate-800 dark:bg-slate-900 text-gray-600 dark:text-slate-400"
                              }`}
                            >
                              {c.is_correct && <LuCircleCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                              <span>{c.text}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Explanation */}
                      {explanation && (
                        <div className="pl-9 text-xs text-gray-500 dark:text-slate-400 italic bg-blue-50/30 dark:bg-blue-950/10 p-2.5 rounded-lg border border-blue-50 dark:border-blue-900/20">
                          <span className="font-semibold text-blue-600 dark:text-blue-400 not-italic mr-1">Explanation:</span>
                          {explanation.trim()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// ── Post Quiz to Classroom Modal ───────────────────────────────────────────────

const PostQuizToClassroomModal: React.FC<{ quizId: string; onClose: () => void }> = ({ quizId, onClose }) => {
  const { data, isLoading } = useClassroomCourses();
  const postMutation = usePostQuizToClassroom();
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customMaxPoints, setCustomMaxPoints] = useState("");
  const [customDueDate, setCustomDueDate] = useState("");
  const [customDueTime, setCustomDueTime] = useState("");
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const courses = data?.courses ?? [];

  const toggleCourse = (id: string) => {
    setSelectedCourses(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handlePost = async () => {
    if (selectedCourses.length === 0) return;
    setStatusMsg(null);
    try {
      const overrides: { title?: string; description?: string; max_points?: number; due_date?: string; due_time?: string } = {};
      if (customTitle.trim()) overrides.title = customTitle.trim();
      if (customDescription.trim()) overrides.description = customDescription.trim();
      if (customMaxPoints.trim()) overrides.max_points = parseFloat(customMaxPoints);
      if (customDueDate) overrides.due_date = customDueDate;
      if (customDueTime) overrides.due_time = customDueTime + ":00"; // Append seconds for classroom API format

      const result = await postMutation.mutateAsync({ quizId, courseIds: selectedCourses, overrides });
      const errCount = result.errors?.length ?? 0;
      const okCount = result.results?.length ?? 0;
      if (errCount > 0 && okCount === 0) {
        setStatusMsg({ type: 'error', text: result.errors[0]?.error || 'Failed to post to any classroom.' });
      } else if (errCount > 0) {
        setStatusMsg({ type: 'success', text: `Posted to ${okCount} classroom(s). ${errCount} failed.` });
      } else {
        setStatusMsg({ type: 'success', text: `Quiz successfully posted to ${okCount} classroom(s)!` });
        setTimeout(onClose, 1500);
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.response?.data?.error || err.message || 'Failed to post quiz to classroom.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-slate-700 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <LuCloudUpload className="w-5 h-5 text-blue-500" />
            Post Quiz to Classroom
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors p-1">
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Inline status banner */}
          {statusMsg && (
            <div className={`flex items-start gap-2 px-4 py-3 rounded-xl text-sm font-medium border ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
            }`}>
              {statusMsg.type === 'success' ? '✓' : '✕'} {statusMsg.text}
            </div>
          )}

          <p className="text-xs text-gray-500 dark:text-slate-400 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 rounded-xl p-3">
            <span className="font-semibold text-blue-600 dark:text-blue-400">Note:</span> Answer keys and explanations are stripped before posting.
          </p>

        {/* Course Selection */}
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-slate-800 animate-pulse rounded-xl" />)}
          </div>
        ) : courses.length === 0 ? (
          <p className="text-gray-500 dark:text-slate-400 text-sm text-center py-4">No Google Classroom courses found. Connect Google Classroom first.</p>
        ) : (
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Select Classrooms</p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {courses.map(course => (
                <div
                  key={course.id}
                  onClick={() => toggleCourse(course.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    selectedCourses.includes(course.id)
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"
                  }`}
                >
                  {selectedCourses.includes(course.id) ? (
                    <div className="w-5 h-5 rounded border border-blue-500 bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <LuCheck className="w-3.5 h-3.5 text-white" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded border border-gray-300 dark:border-slate-600 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">{course.name}</p>
                    {course.description && <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-1">{course.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optional Overrides */}
        <div className="space-y-3 border-t border-gray-100 dark:border-slate-800 pt-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Additional Info (Optional)</p>
          <input
            type="text"
            placeholder="Custom assignment title (leave blank to use quiz title)"
            value={customTitle}
            onChange={e => setCustomTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
          />
          <textarea
            placeholder="Extra instructions or notes for students..."
            value={customDescription}
            onChange={e => setCustomDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
          />
          <div className="flex gap-3">
            <input
              type="number"
              placeholder="Max points (100)"
              value={customMaxPoints}
              onChange={e => setCustomMaxPoints(e.target.value)}
              min={1}
              className="w-1/3 px-3 py-2 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
            <input
              type="date"
              value={customDueDate}
              onChange={e => setCustomDueDate(e.target.value)}
              className="w-1/3 px-3 py-2 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
            <input
              type="time"
              value={customDueTime}
              onChange={e => setCustomDueTime(e.target.value)}
              className="w-1/3 px-3 py-2 rounded-xl text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 rounded-b-2xl flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
            Cancel
          </button>
          <button
            onClick={handlePost}
            disabled={selectedCourses.length === 0 || postMutation.isPending}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            {postMutation.isPending && <LuLoader className="w-4 h-4 animate-spin" />}
            Post to {selectedCourses.length} Classroom{selectedCourses.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Teacher Quizzes List ──────────────────────────────────────────────────────

const TeacherQuizzesList: React.FC = () => {
  const { data, isLoading } = useTeacherQuizzes();
  const deleteQuiz = useDeleteQuiz();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(searchParams.get("quizId"));
  const [postModalQuizId, setPostModalQuizId] = useState<string | null>(null);
  const quizzes = data?.quizzes ?? [];

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Delete this quiz? This cannot be undone.")) {
      deleteQuiz.mutate(id);
    }
  };

  return (
    <>
      {selectedQuizId && (
        <QuizDetailModal
          quizId={selectedQuizId}
          onClose={() => {
            setSelectedQuizId(null);
            if (searchParams.has("quizId")) {
              searchParams.delete("quizId");
              setSearchParams(searchParams);
            }
          }}
        />
      )}

      {postModalQuizId && (
        <PostQuizToClassroomModal
          quizId={postModalQuizId}
          onClose={() => setPostModalQuizId(null)}
        />
      )}

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
              Ask the AI agent to generate a quiz. Generated quizzes will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-slate-400">
              <thead className="bg-gray-50 dark:bg-slate-800 text-xs uppercase text-gray-500 dark:text-slate-500 font-semibold">
                <tr>
                  <th className="px-6 py-4">Quiz Title</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Total Marks</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {quizzes.map((q) => (
                  <tr
                    key={q.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedQuizId(q.id)}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <LuFileQuestion className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="line-clamp-1">{q.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold">
                        Quiz
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-blue-600 dark:text-blue-400">
                      {q.total_marks ?? q.question_count}
                    </td>
                    <td className="px-6 py-4 text-gray-400 dark:text-slate-500">
                      {new Date(q.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedQuizId(q.id);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all flex items-center gap-1"
                        >
                          <LuEye className="w-3.5 h-3.5" /> View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPostModalQuizId(q.id);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-all flex items-center gap-1 opacity-0 group-hover:opacity-100"
                          title="Post to Google Classroom"
                        >
                          <LuCloudUpload className="w-3.5 h-3.5" /> Post
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
    </>
  );
};

export default TeacherQuizzesList;
