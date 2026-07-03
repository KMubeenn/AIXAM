import React, { useState } from "react";
import {
  LuBook,
  LuUsers,
  LuExternalLink,
  LuLoader,
  LuChevronRight,
  LuCircleCheck,
  LuClock,
  LuRefreshCw,
  LuX,
  LuSend,
  LuFileText,
  LuLink,
  LuDownload,
  LuShare2,
  LuClipboardList,
  LuBrainCircuit,
} from "react-icons/lu";
import {
  useClassroomCourses,
  useClassroomSubmissions,
  useFetchSubmissionContent,
  usePushGrade,
  useClassroomCoursework,
  useGenerateClassReport,
  useAIGradeSubmission,
  usePostClassroomAnnouncement,
} from "../../../hooks/useCore";
import { ClassroomSubmission } from "../../../services/core.service";
import { useAuthStore } from "../../../store/useAuthStore";

// ── State badge ────────────────────────────────────────────────────────────────
const StateBadge: React.FC<{ state: string }> = ({ state }) => {
  const map: Record<string, { label: string; cls: string }> = {
    TURNED_IN: {
      label: "Turned In",
      cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    },
    RETURNED: {
      label: "Returned",
      cls: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    },
    CREATED: {
      label: "Not submitted",
      cls: "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400",
    },
    RECLAIMED_BY_STUDENT: {
      label: "Reclaimed",
      cls: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
    },
  };
  const { label, cls } = map[state] ?? {
    label: state,
    cls: "bg-gray-100 dark:bg-slate-800 text-gray-500",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>
      {label}
    </span>
  );
};

// ── Grade Push Modal ───────────────────────────────────────────────────────────
const GradeSubmissionModal: React.FC<{
  submission: ClassroomSubmission;
  courseId: string;
  courseworkId: string;
  onClose: () => void;
}> = ({ submission, courseId, courseworkId, onClose }) => {
  const fetchContent = useFetchSubmissionContent();
  const pushGrade = usePushGrade();
  const [grade, setGrade] = useState("");
  const [success, setSuccess] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {submission.studentName}
            </h2>
            <StateBadge state={submission.state} />
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Content fetch */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
                <LuFileText className="w-4 h-4 text-indigo-500" /> Submission
                Content
              </h3>
              <button
                onClick={() =>
                  fetchContent.mutate({
                    courseId,
                    courseworkId,
                    submissionId: submission.id,
                  })
                }
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
              <p className="text-sm text-gray-400 italic bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4">
                No attachments for this submission.
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

          {/* Push grade */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <LuSend className="w-4 h-4 text-emerald-500" /> Push Grade to
              Google Classroom
            </h3>
            {success ? (
              <div className="flex items-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <LuCircleCheck className="w-5 h-5 text-emerald-600" />
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  Grade synced to Google Classroom!
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="Enter grade (e.g. 85)"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="flex-1 h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                <button
                  onClick={async () => {
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
                      console.error(e);
                    }
                  }}
                  disabled={!grade || pushGrade.isPending}
                  className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
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
              <p className="text-xs text-red-500 mt-2">
                Failed to push grade. Please try again.
              </p>
            )}
          </div>

          {submission.assignedGrade !== null && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <p className="text-xs text-blue-500 font-semibold">
                Current Assigned Grade
              </p>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                {submission.assignedGrade}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Classroom Report Panel ─────────────────────────────────────────────────────
const ClassroomReportPanel: React.FC<{
  courseId: string;
  courseworkName: string;
  submissions: ClassroomSubmission[];
  rubrics: string;
  setRubrics: (v: string) => void;
}> = ({ courseId, courseworkName, submissions, rubrics, setRubrics }) => {
  const generateReport = useGenerateClassReport();
  const postAnnouncement = usePostClassroomAnnouncement();
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const graded = submissions.filter((s) => s.assignedGrade !== null);

  const handleDownload = async () => {
    if (graded.length === 0) {
      setErrorMsg("Grade at least one student first.");
      return;
    }
    setErrorMsg(null);
    try {
      const grades = graded.map((s) => ({
        student_name: s.studentName,
        marks: s.assignedGrade ?? 0,
        max_marks: 100,
        feedback: "",
      }));
      const avg = grades.reduce((a, g) => a + g.marks, 0) / grades.length;
      const res = await generateReport.mutateAsync({
        assignmentId: "00000000-0000-0000-0000-000000000000",
        gradesData: {
          grades,
          class_average: avg,
          overall_feedback: rubrics ? `Rubric: ${rubrics}` : "",
        },
      });
      const bytes = new Uint8Array(
        atob(res.file_base64)
          .split("")
          .map((c) => c.charCodeAt(0)),
      );
      const url = URL.createObjectURL(
        new Blob([bytes], { type: res.mime_type }),
      );
      Object.assign(document.createElement("a"), {
        href: url,
        download: res.filename || `${courseworkName}_report.pdf`,
      }).click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setErrorMsg(
        e?.response?.data?.error || e?.message || "Failed to generate report",
      );
    }
  };

  const getReportText = () => {
    const avg =
      graded.reduce((a, s) => a + (s.assignedGrade ?? 0), 0) / graded.length;
    return [
      `📊 Class Report: ${courseworkName}`,
      `Class Average: ${avg.toFixed(1)}%`,
      "",
      "Student Grades:",
      ...graded.map(
        (s) =>
          `- ${s.studentName}: ${s.assignedGrade}% (Attachment: ${s.hasAttachments ? "Yes" : "Missing"})`,
      ),
    ].join("\n");
  };

  const handleCopy = async () => {
    if (graded.length === 0) {
      setErrorMsg("Grade at least one student first.");
      return;
    }
    setErrorMsg(null);
    setCopying(true);
    try {
      await navigator.clipboard.writeText(getReportText());
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setErrorMsg("Clipboard access denied. Use Download PDF instead.");
    } finally {
      setCopying(false);
    }
  };

  const handlePublish = async () => {
    if (graded.length === 0) {
      setErrorMsg("Grade at least one student first.");
      return;
    }
    setErrorMsg(null);
    setPublishing(true);
    try {
      await postAnnouncement.mutateAsync({ courseId, text: getReportText() });
      setPublished(true);
      setTimeout(() => setPublished(false), 3000);
    } catch (e: any) {
      setErrorMsg(
        e?.response?.data?.error ||
          e?.message ||
          "Failed to publish report to Google Classroom.",
      );
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="mt-6 border-t border-gray-100 dark:border-slate-800 pt-5 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
          <LuClipboardList className="w-4 h-4 text-indigo-500" /> Grading
          Rubrics &amp; Report
        </h4>
        {errorMsg && (
          <div className="text-xs font-semibold text-red-500 flex items-center gap-2">
            <LuX className="w-4 h-4" /> {errorMsg}
          </div>
        )}
      </div>
      <div>
        <label className="text-xs text-gray-500 dark:text-slate-400 font-medium mb-1 block">
          Grading Rubric / Instructions{" "}
          <span className="font-normal">
            (optional — included in PDF &amp; AI grading context)
          </span>
        </label>
        <textarea
          value={rubrics}
          onChange={(e) => setRubrics(e.target.value)}
          placeholder="e.g. Deduct 10% per day late. Award full marks for correct reasoning..."
          rows={3}
          className="w-full px-3 py-2 rounded-xl text-sm bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
        />
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 flex items-center gap-1">
          <LuBrainCircuit className="w-3 h-3 flex-shrink-0" />
          Used automatically when you click "Auto-Grade All", or manually in the
          Chat.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleDownload}
          disabled={graded.length === 0 || generateReport.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-40"
        >
          {generateReport.isPending ? (
            <LuLoader className="w-4 h-4 animate-spin" />
          ) : (
            <LuDownload className="w-4 h-4" />
          )}
          Download PDF Report
        </button>
        <button
          onClick={handleCopy}
          disabled={graded.length === 0 || copying}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-40"
        >
          {copying ? (
            <LuLoader className="w-4 h-4 animate-spin" />
          ) : (
            <LuShare2 className="w-4 h-4" />
          )}
          {copied ? "✓ Copied!" : "Copy Report Summary"}
        </button>
        <button
          onClick={handlePublish}
          disabled={graded.length === 0 || publishing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-40"
        >
          {publishing ? (
            <LuLoader className="w-4 h-4 animate-spin" />
          ) : (
            <LuShare2 className="w-4 h-4" />
          )}
          {published ? "✓ Published!" : "Publish to Classroom"}
        </button>
        {graded.length === 0 && (
          <p className="text-xs text-gray-400 dark:text-slate-500 self-center">
            Grade at least one student to enable reporting.
          </p>
        )}
      </div>
    </div>
  );
};

// ── Submissions List ───────────────────────────────────────────────────────────
const SubmissionsList: React.FC<{
  courseId: string;
  courseworkId: string;
  courseworkName?: string;
  courseworkDescription?: string;
}> = ({ courseId, courseworkId, courseworkName, courseworkDescription }) => {
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useClassroomSubmissions(courseId, courseworkId);
  const [selected, setSelected] = useState<ClassroomSubmission | null>(null);
  const [rubrics, setRubrics] = useState("");
  const [isAutoGrading, setIsAutoGrading] = useState(false);
  const [gradingProgress, setGradingProgress] = useState<{
    total: number;
    current: number;
    status: string;
  } | null>(null);
  const [regradePrompt, setRegradePrompt] = useState<{
    gradedCount: number;
    ungradedCount: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchContent = useFetchSubmissionContent();
  const pushGrade = usePushGrade();

  const submissions = data?.submissions ?? [];

  const handleGradeAll = async (
    forceRegradeAll = false,
    forceGradeUngraded = false,
  ) => {
    const ungraded = submissions.filter((s) => s.assignedGrade === null);
    const graded = submissions.filter((s) => s.assignedGrade !== null);

    if (!forceRegradeAll && !forceGradeUngraded && graded.length > 0) {
      setRegradePrompt({
        gradedCount: graded.length,
        ungradedCount: ungraded.length,
      });
      return;
    }

    const toGrade = forceRegradeAll ? submissions : ungraded;

    if (toGrade.length === 0) {
      setErrorMessage("No submissions to grade.");
      return;
    }

    setRegradePrompt(null);
    setIsAutoGrading(true);
    const submissionsToGrade = [];
    for (let i = 0; i < toGrade.length; i++) {
      const sub = toGrade[i];
      setGradingProgress({
        total: toGrade.length,
        current: i + 1,
        status: `Fetching ${sub.studentName}...`,
      });
      try {
        if (!sub.hasAttachments) {
          await pushGrade.mutateAsync({
            courseId,
            courseworkId,
            submissionId: sub.id,
            assignedGrade: 0,
          });
          continue;
        }
        const contentRes = await fetchContent.mutateAsync({
          courseId,
          courseworkId,
          submissionId: sub.id,
        });
        if (contentRes && contentRes.content) {
          submissionsToGrade.push({
            student_id: sub.id,
            student_name: sub.studentName,
            submission_content: contentRes.content,
            max_points: 100,
          });
        }
      } catch (e) {
        console.error(`Failed to fetch ${sub.studentName}`, e);
      }
    }

    if (submissionsToGrade.length === 0) {
      setIsAutoGrading(false);
      setGradingProgress(null);
      refetch();
      return;
    }

    setGradingProgress({
      total: submissionsToGrade.length,
      current: submissionsToGrade.length,
      status: "Grading via Teacher Agent...",
    });

    const contextStr = courseworkDescription
      ? `Assignment Description/Questions:\n${courseworkDescription}\n\n`
      : "";
    const gradingInstructions =
      contextStr + (rubrics || "Grade fairly based on correctness.");

    try {
      const { ChatService } = await import("../../../services/chat.service");
      await ChatService.sendMessageStream(
        {
          message: `Grade these Google Classroom submissions for the assignment: ${courseworkName || "Assignment"}.`,
          create_session: true,
          grade_test: true,
          test_submission: submissionsToGrade,
          grading_instructions: gradingInstructions,
        },
        (token) => {},
        async (data) => {
          if (data.type === "batch_grades") {
            setGradingProgress({
              total: submissionsToGrade.length,
              current: submissionsToGrade.length,
              status: "Pushing grades to Classroom...",
            });
            const grades = data.data?.grades || [];
            for (const g of grades) {
              if (g.student_id && g.marks !== undefined) {
                try {
                  await pushGrade.mutateAsync({
                    courseId,
                    courseworkId,
                    submissionId: g.student_id,
                    assignedGrade: g.marks,
                  });
                } catch (e) {
                  console.error(e);
                }
              }
            }
          }
        },
        (sessionId) => {},
      );
    } catch (e) {
      console.error("Grading failed", e);
      setErrorMessage("Auto-grading failed. Check console for details.");
    }

    setGradingProgress(null);
    setIsAutoGrading(false);
    refetch();
  };

  return (
    <div className="mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
          <LuUsers className="w-4 h-4 text-blue-500" />{" "}
          {courseworkName || "Submissions"}
        </h3>
        <div className="flex items-center gap-2">
          {isAutoGrading && gradingProgress && (
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <LuLoader className="w-3 h-3 animate-spin" />
              {gradingProgress.current} / {gradingProgress.total} -{" "}
              {gradingProgress.status}
            </span>
          )}
          <button
            onClick={() => handleGradeAll()}
            disabled={isAutoGrading || submissions.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <LuBrainCircuit className="w-3.5 h-3.5" />
            Auto-Grade All
          </button>
          <button
            onClick={() => refetch()}
            disabled={isRefetching || isAutoGrading}
            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors border border-gray-200 dark:border-slate-700"
          >
            <LuRefreshCw
              className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Custom Alerts & Prompts */}
      {errorMessage && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="text-sm text-red-600 dark:text-red-400 font-medium">
            {errorMessage}
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-700 p-1 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {regradePrompt && (
        <div className="mb-4 p-5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 animate-in fade-in slide-in-from-top-2">
          <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-100 mb-2">
            Grading Options
          </h4>
          <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-4">
            There are {regradePrompt.gradedCount} already graded and{" "}
            {regradePrompt.ungradedCount} ungraded submissions.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleGradeAll(true, false)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Re-Grade All
            </button>
            <button
              onClick={() => handleGradeAll(false, true)}
              className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700 rounded-lg text-sm font-semibold transition-colors"
            >
              Grade Ungraded Only
            </button>
            <button
              onClick={() => setRegradePrompt(null)}
              className="px-4 py-2 bg-transparent hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm transition-colors ml-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {selected && (
        <GradeSubmissionModal
          submission={selected}
          courseId={courseId}
          courseworkId={courseworkId}
          onClose={() => setSelected(null)}
        />
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl text-sm">
          Failed to load:{" "}
          {(error as any)?.response?.data?.error ||
            (error as any)?.message ||
            "Unknown error"}
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
          <LuUsers className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No submissions found.</p>
        </div>
      ) : (
        <>
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
                  <tr
                    key={s.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {s.studentName}
                    </td>
                    <td className="px-4 py-3">
                      <StateBadge state={s.state} />
                    </td>
                    <td className="px-4 py-3">
                      {s.assignedGrade !== null ? (
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {s.assignedGrade}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {s.hasAttachments ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                          <LuCircleCheck className="w-3.5 h-3.5" /> Yes
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-red-500 dark:text-red-400">
                          Missing
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelected(s)}
                        disabled={isAutoGrading}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${s.assignedGrade !== null ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white"}`}
                      >
                        {s.assignedGrade !== null ? "Regrade" : "Grade"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ClassroomReportPanel
            courseId={courseId}
            courseworkName={courseworkName || "Coursework"}
            submissions={submissions}
            rubrics={rubrics}
            setRubrics={setRubrics}
          />
        </>
      )}
    </div>
  );
};

// ── Courses List ───────────────────────────────────────────────────────────────
const CoursesList: React.FC = () => {
  const token = useAuthStore((s) => s.token);
  const { data, isLoading, isError, error } = useClassroomCourses();
  const [selectedCourse, setSelectedCourse] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [courseworkId, setCourseworkId] = useState("");
  const [cwInput, setCwInput] = useState("");
  const courses = data?.courses ?? [];
  const { data: cwData, isLoading: cwLoading } = useClassroomCoursework(
    selectedCourse?.id ?? null,
  );
  const courseworks = cwData?.coursework ?? [];
  const isNotConnected =
    isError &&
    String((error as any)?.response?.data?.error ?? "")
      .toLowerCase()
      .includes("not authorized");

  if (isLoading)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 animate-pulse"
          />
        ))}
      </div>
    );

  if (isNotConnected || (isError && courses.length === 0))
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
        <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-400 mb-4">
          <LuLink className="w-10 h-10" />
        </div>
        <h4 className="text-xl font-bold text-gray-700 dark:text-slate-300 mb-2">
          Connect Google Classroom
        </h4>
        <p className="text-sm text-gray-400 max-w-sm mb-6">
          Authorize AIXAM to access your Google Classroom to view courses and
          submissions.
        </p>
        <a
          href={`${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/auth/google/login/${token ? `?token=${token}` : ""}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-md"
        >
          <LuExternalLink className="w-4 h-4" /> Connect Google Classroom
        </a>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <button
            key={course.id}
            onClick={() => {
              setSelectedCourse({ id: course.id, name: course.name });
              setCourseworkId("");
              setCwInput("");
            }}
            className={`text-left p-5 rounded-2xl border-2 transition-all shadow-sm hover:shadow-md ${
              selectedCourse?.id === course.id
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700"
            }`}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 flex-shrink-0">
                <LuBook className="w-5 h-5" />
              </div>
              {selectedCourse?.id === course.id && (
                <span className="ml-auto text-xs font-bold text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">
                  Selected
                </span>
              )}
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">
              {course.name}
            </h3>
            {course.section && (
              <p className="text-xs text-gray-500">{course.section}</p>
            )}
            {course.description && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                {course.description}
              </p>
            )}
            <div className="flex items-center gap-1 mt-3 text-xs text-indigo-500 font-medium">
              View Submissions <LuChevronRight className="w-3.5 h-3.5" />
            </div>
          </button>
        ))}
      </div>

      {selectedCourse && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">
            Submissions:{" "}
            <span className="text-indigo-600 dark:text-indigo-400">
              {selectedCourse.name}
            </span>
          </h3>
          <div className="mb-4">
            {cwLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
              </div>
            ) : courseworks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {courseworks.map((cw: any) => (
                  <button
                    key={cw.id}
                    onClick={() => {
                      setCourseworkId(cw.id);
                      setCwInput(cw.id);
                    }}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      courseworkId === cw.id
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                        : "border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600"
                    }`}
                  >
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">
                      {cw.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      Marks: <span className="font-semibold">{cw.maxPoints || "Ungraded"}</span>
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  placeholder="Enter Coursework ID from Google Classroom"
                  value={cwInput}
                  onChange={(e) => setCwInput(e.target.value)}
                  className="flex-1 h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                <button
                  onClick={() => setCourseworkId(cwInput.trim())}
                  disabled={!cwInput.trim()}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  Load
                </button>
              </div>
            )}
          </div>
          {courseworkId && (
            <SubmissionsList
              courseId={selectedCourse.id}
              courseworkId={courseworkId}
              courseworkName={
                courseworks.find((cw) => cw.id === courseworkId)?.title ??
                courseworkId
              }
              courseworkDescription={
                courseworks.find((cw) => cw.id === courseworkId)?.description
              }
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CoursesList;
