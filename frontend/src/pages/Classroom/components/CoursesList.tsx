import React, { useState } from "react";
import {
  LuBook,
  LuUsers,
  LuExternalLink,
  LuLoader,
  LuChevronRight,
  LuCircleCheck,
  LuCircleAlert,
  LuClock,
  LuRefreshCw,
  LuX,
  LuSend,
  LuFileText,
  LuLink,
} from "react-icons/lu";
import {
  useClassroomCourses,
  useClassroomSubmissions,
  useFetchSubmissionContent,
  usePushGrade,
  useClassroomCoursework,
} from "../../../hooks/useCore";
import { ClassroomSubmission } from "../../../services/core.service";
import { useAuthStore } from "../../../store/useAuthStore";

// ── State badge helper ────────────────────────────────────────────────────────
const StateBadge: React.FC<{ state: string }> = ({ state }) => {
  const map: Record<string, { label: string; cls: string }> = {
    TURNED_IN: { label: "Turned In", cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" },
    RETURNED: { label: "Returned", cls: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
    CREATED: { label: "Not submitted", cls: "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400" },
    RECLAIMED_BY_STUDENT: { label: "Reclaimed", cls: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" },
  };
  const config = map[state] ?? { label: state, cls: "bg-gray-100 dark:bg-slate-800 text-gray-500" };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${config.cls}`}>
      {config.label}
    </span>
  );
};

// ── Grade Push Modal ──────────────────────────────────────────────────────────
const GradeSubmissionModal: React.FC<{
  submission: ClassroomSubmission;
  courseId: string;
  courseworkId: string;
  onClose: () => void;
}> = ({ submission, courseId, courseworkId, onClose }) => {
  const fetchContent = useFetchSubmissionContent();
  const pushGrade = usePushGrade();
  const [grade, setGrade] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const handleFetchContent = () => {
    fetchContent.mutate({ courseId, courseworkId, submissionId: submission.id });
  };

  const handlePushGrade = async () => {
    const parsed = parseFloat(grade);
    if (isNaN(parsed)) return;
    try {
      await pushGrade.mutateAsync({
        courseId,
        courseworkId,
        submissionId: submission.id,
        assignedGrade: parsed,
      });
      setSuccess(true);
    } catch (e) {
      console.error("Grade push failed:", e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{submission.studentName}</h2>
            <StateBadge state={submission.state} />
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Submission Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
                <LuFileText className="w-4 h-4 text-indigo-500" />
                Submission Content
              </h3>
              <button
                onClick={handleFetchContent}
                disabled={fetchContent.isPending || !submission.hasAttachments}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {fetchContent.isPending ? (
                  <LuLoader className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <LuRefreshCw className="w-3.5 h-3.5" />
                )}
                {fetchContent.isPending ? "Fetching..." : "Fetch Content"}
              </button>
            </div>

            {!submission.hasAttachments && (
              <p className="text-sm text-gray-400 dark:text-slate-500 italic bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4">
                No attachments found for this submission.
              </p>
            )}

            {fetchContent.data && (
              <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 border border-gray-100 dark:border-slate-700">
                <pre className="text-xs text-gray-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {fetchContent.data.content}
                </pre>
              </div>
            )}

            {fetchContent.isError && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">
                Failed to fetch submission content.
              </div>
            )}
          </div>

          {/* Push Grade */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <LuSend className="w-4 h-4 text-emerald-500" />
              Push Grade to Google Classroom
            </h3>

            {success ? (
              <div className="flex items-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <LuCircleCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  Grade synced to Google Classroom successfully!
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="Enter grade (e.g. 85)"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
                <button
                  onClick={handlePushGrade}
                  disabled={!grade || pushGrade.isPending}
                  className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pushGrade.isPending ? (
                    <LuLoader className="w-4 h-4 animate-spin" />
                  ) : (
                    <LuSend className="w-4 h-4" />
                  )}
                  {pushGrade.isPending ? "Syncing..." : "Push Grade"}
                </button>
              </div>
            )}
            {pushGrade.isError && (
              <p className="text-xs text-red-500 mt-2">Failed to push grade. Please try again.</p>
            )}
          </div>

          {/* Current grade if returned */}
          {submission.assignedGrade !== null && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <p className="text-xs text-blue-500 dark:text-blue-400 font-semibold">Current Assigned Grade</p>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{submission.assignedGrade}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Submissions List ──────────────────────────────────────────────────────────
const SubmissionsList: React.FC<{ courseId: string; courseworkId: string; courseworkName?: string }> = ({
  courseId,
  courseworkId,
  courseworkName,
}) => {
  const { data, isLoading, isError, error, refetch, isRefetching } = useClassroomSubmissions(courseId, courseworkId);
  const [selectedSubmission, setSelectedSubmission] = useState<ClassroomSubmission | null>(null);
  const submissions = data?.submissions ?? [];

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
          <LuUsers className="w-4 h-4 text-blue-500" />
          {courseworkName || "Submissions"}
        </h3>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
          title="Refresh"
        >
          <LuRefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      {selectedSubmission && (
        <GradeSubmissionModal
          submission={selectedSubmission}
          courseId={courseId}
          courseworkId={courseworkId}
          onClose={() => setSelectedSubmission(null)}
        />
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800/30 text-sm">
          Failed to load submissions: {(error as any)?.response?.data?.error || error.message || "Unknown error"}
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
          <LuUsers className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-gray-400 dark:text-slate-500">No submissions found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-slate-800 text-xs uppercase text-gray-500 dark:text-slate-500 font-semibold">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Grade</th>
                <th className="px-4 py-3">Attachments</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {submissions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{s.studentName}</td>
                  <td className="px-4 py-3"><StateBadge state={s.state} /></td>
                  <td className="px-4 py-3">
                    {s.assignedGrade !== null ? (
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">{s.assignedGrade}</span>
                    ) : (
                      <span className="text-gray-400 dark:text-slate-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {s.hasAttachments ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <LuCircleCheck className="w-3.5 h-3.5" /> Yes
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-slate-500">None</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedSubmission(s)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-all"
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
  );
};

// ── Courses List ──────────────────────────────────────────────────────────────
const CoursesList: React.FC = () => {
  const token = useAuthStore((state) => state.token);
  const { data, isLoading, isError, error } = useClassroomCourses();
  const [selectedCourse, setSelectedCourse] = useState<{ id: string; name: string } | null>(null);
  const [courseworkId, setCourseworkId] = useState<string>("");
  const [courseworkIdInput, setCourseworkIdInput] = useState<string>("");
  const courses = data?.courses ?? [];
  const { data: courseworkData, isLoading: isCourseworkLoading } = useClassroomCoursework(
    selectedCourse?.id ?? null
  );
  const courseworks = courseworkData?.coursework ?? [];
  const isNotConnected = isError && String((error as any)?.response?.data?.error ?? "").toLowerCase().includes("not authorized");

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isNotConnected || (isError && courses.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
        <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-400 mb-4">
          <LuLink className="w-10 h-10" />
        </div>
        <h4 className="text-xl font-bold text-gray-700 dark:text-slate-300 mb-2">Connect Google Classroom</h4>
        <p className="text-sm text-gray-400 dark:text-slate-500 max-w-sm mb-6">
          Authorize AIXAM to access your Google Classroom account to view courses and submissions.
        </p>
        <a
          href={`${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/auth/google/login/${token ? `?token=${token}` : ""}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-md"
        >
          <LuExternalLink className="w-4 h-4" />
          Connect Google Classroom
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <button
            key={course.id}
            onClick={() => { setSelectedCourse({ id: course.id, name: course.name }); setCourseworkId(""); setCourseworkIdInput(""); }}
            className={`text-left p-5 rounded-2xl border-2 transition-all shadow-sm hover:shadow-md ${
              selectedCourse?.id === course.id
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700"
            }`}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                <LuBook className="w-5 h-5" />
              </div>
              {selectedCourse?.id === course.id && (
                <span className="ml-auto text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">
                  Selected
                </span>
              )}
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">{course.name}</h3>
            {course.section && (
              <p className="text-xs text-gray-500 dark:text-slate-400">{course.section}</p>
            )}
            {course.description && (
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 line-clamp-2">{course.description}</p>
            )}
            <div className="flex items-center gap-1 mt-3 text-xs text-indigo-500 dark:text-indigo-400 font-medium">
              View Submissions <LuChevronRight className="w-3.5 h-3.5" />
            </div>
          </button>
        ))}
      </div>

      {/* Coursework ID input + Submissions */}
      {selectedCourse && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">
            Submissions: <span className="text-indigo-600 dark:text-indigo-400">{selectedCourse.name}</span>
          </h3>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
            {isCourseworkLoading ? (
              <div className="flex-1 h-11 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            ) : courseworks.length > 0 ? (
              <select
                value={courseworkId}
                onChange={(e) => {
                  setCourseworkId(e.target.value);
                  setCourseworkIdInput(e.target.value);
                }}
                className="flex-1 h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
              >
                <option value="">-- Select Classroom Coursework --</option>
                {courseworks.map((cw: any) => (
                  <option key={cw.id} value={cw.id}>
                    {cw.title}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Enter Coursework / Assignment ID from Google Classroom"
                value={courseworkIdInput}
                onChange={(e) => setCourseworkIdInput(e.target.value)}
                className="flex-1 h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            )}
            {(courseworks.length === 0 || !courseworkId) && (
              <button
                onClick={() => setCourseworkId(courseworkIdInput.trim())}
                disabled={!courseworkIdInput.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              >
                Load
              </button>
            )}
          </div>
          {courseworkId && (
            <SubmissionsList
              courseId={selectedCourse.id}
              courseworkId={courseworkId}
              courseworkName={
                courseworks.find((cw: any) => cw.id === courseworkId)?.title 
                  ? `Coursework: ${courseworks.find((cw: any) => cw.id === courseworkId).title}`
                  : `Coursework: ${courseworkId}`
              }
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CoursesList;
