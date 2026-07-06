import React, { useState } from "react";
import { FiX, FiCheckCircle, FiAlertCircle, FiClock, FiMessageSquare } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useQuizDetail, useSubmitQuiz } from "../../../hooks/useCore";
import { QuizQuestion } from "../../../services/core.service";
import { ChatService } from "../../../services/chat.service";
import { useQueryClient } from "@tanstack/react-query";

interface QuizTakerModalProps {
  quizId: string;
  onClose: () => void;
}

type McqAnswers = Record<string, string>;       // questionId → choiceId
type DescAnswers = Record<string, string>;      // questionId → text answer

const QuizTakerModal: React.FC<QuizTakerModalProps> = ({ quizId, onClose }) => {
  const navigate = useNavigate();
  const { data: quiz, isLoading } = useQuizDetail(quizId);
  const submitQuiz = useSubmitQuiz();

  const [mcqAnswers, setMcqAnswers] = useState<McqAnswers>({});
  const [descAnswers, setDescAnswers] = useState<DescAnswers>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);
  const [descriptiveResult, setDescriptiveResult] = useState<any | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const queryClient = useQueryClient();

  const mcqQuestions = quiz?.questions?.filter((q) => q.question_type === "mcq") ?? [];
  const descriptiveQuestions = quiz?.questions?.filter((q) => q.question_type === "descriptive") ?? [];

  const totalMcq = mcqQuestions.length;
  const totalDesc = descriptiveQuestions.length;
  const isPureMock = totalMcq === 0 && totalDesc > 0;
  const hasMcq = totalMcq > 0;

  const answeredMcqCount = Object.keys(mcqAnswers).length;
  const answeredDescCount = Object.values(descAnswers).filter((v) => v.trim().length > 0).length;

  const canSubmitMcq = answeredMcqCount === totalMcq && totalMcq > 0 && !submitted;
  const canSubmitDesc = answeredDescCount > 0 && totalDesc > 0;

  // ── MCQ auto-grade and save ───────────────────────────────────────────────
  const handleMcqSubmit = async () => {
    if (!quiz) return;
    let correct = 0;
    const gradingDetails: any[] = [];
    for (const q of mcqQuestions) {
      const selectedId = mcqAnswers[q.id];
      const selectedChoice = q.choices?.find((c) => c.id === selectedId);
      const correctChoice = q.choices?.find((c) => c.is_correct);
      const isCorrect = selectedChoice?.is_correct ?? false;
      if (isCorrect) correct++;
      gradingDetails.push({
        question: q.text,
        student_answer: selectedChoice?.text ?? "(no answer)",
        correct_answer: correctChoice?.text ?? "",
        marks: isCorrect ? q.points : 0,
        max_marks: q.points,
        feedback: isCorrect ? "Correct answer!" : `The correct answer was: ${correctChoice?.text ?? "N/A"}`,
      });
    }
    const pct = totalMcq > 0 ? Math.round((correct / totalMcq) * 100) : 0;
    setScore({ correct, total: totalMcq });
    setSubmitted(true);
    try {
      await submitQuiz.mutateAsync({
        quizId: quiz.id,
        score: pct,
        feedback: `Auto-graded MCQ: ${correct}/${totalMcq} correct (${pct}%)`,
        gradingDetails,
      });
    } catch (e) {
      console.error("Failed to save submission:", e);
    }
  };

  // ── Descriptive: grade inline using ChatService ───────────────────────────
  const handleDescriptiveGrade = async () => {
    if (!quiz) return;
    const submission = descriptiveQuestions.map((q) => ({
      question_id: q.id,
      question: q.text,
      answer: descAnswers[q.id] ?? "",
      max_marks: q.points,
    }));
    
    setIsGrading(true);
    let gradedResult: any = null;
    try {
      await ChatService.sendMessageStream(
        {
          message: `Please grade these answers for the test "${quiz.title}" and provide detailed feedback and a score out of 100.`,
          grade_test: true,
          test_submission: submission,
          quiz_id: quiz.id,
          create_session: true,
        },
        () => {},
        (structuredData) => {
          if (structuredData.type === 'mock_test_grades') {
            gradedResult = structuredData.data;
          }
        },
        () => {}
      );
      
      if (gradedResult) {
        setDescriptiveResult(gradedResult);
        setSubmitted(true);
        queryClient.invalidateQueries({ queryKey: ['submissions'] });
      }
    } catch (e: any) {
      alert("Grading failed: " + e.message);
    } finally {
      setIsGrading(false);
    }
  };

  const isChoiceCorrect = (q: QuizQuestion, choiceId: string) =>
    q.choices?.find((c) => c.id === choiceId)?.is_correct ?? false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {isLoading ? "Loading..." : quiz?.title}
            </h2>
            {!isLoading && quiz && (
              <div className="flex items-center gap-3 mt-1">

                <span className="text-xs text-gray-400 dark:text-slate-500">
                  {quiz.questions?.length ?? 0} questions
                </span>
                {hasMcq && !submitted && (
                  <span className="text-xs text-indigo-500 font-medium">
                    {answeredMcqCount}/{totalMcq} MCQ answered
                  </span>
                )}
                {totalDesc > 0 && !isPureMock && !submitted && (
                  <span className="text-xs text-amber-500 font-medium">
                    {answeredDescCount}/{totalDesc} written
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-gray-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : submitted && score ? (
            /* ── MCQ Results screen ── */
            <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold ${
                  score.correct / score.total >= 0.7
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
                    : "bg-amber-100 dark:bg-amber-900/30 text-amber-600"
                }`}
              >
                {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {score.correct >= Math.ceil(score.total * 0.7) ? "Well done!" : "Keep practising!"}
                </h3>
                <p className="text-gray-500 dark:text-slate-400 mt-1">
                  You got{" "}
                  <span className="font-bold text-gray-800 dark:text-white">
                    {score.correct} out of {score.total}
                  </span>{" "}
                  correct.
                </p>
              </div>
              {/* Answer review */}
              <div className="w-full mt-6 space-y-4 text-left">
                <h4 className="font-semibold text-gray-700 dark:text-slate-300">Answer Review</h4>
                {mcqQuestions.map((q, qi) => {
                  const selectedId = mcqAnswers[q.id];
                  const wasCorrect = isChoiceCorrect(q, selectedId);
                  return (
                    <div
                      key={q.id}
                      className={`rounded-xl border p-4 ${
                        wasCorrect
                          ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20"
                          : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {wasCorrect ? (
                          <FiCheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <FiAlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800 dark:text-white mb-2">
                            Q{qi + 1}. {q.text}
                          </p>
                          <div className="space-y-1">
                            {q.choices?.map((c) => (
                              <div
                                key={c.id}
                                className={`text-xs px-3 py-1.5 rounded-lg ${
                                  c.is_correct
                                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-semibold"
                                    : c.id === selectedId
                                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                                    : "text-gray-500 dark:text-slate-400"
                                }`}
                              >
                                {c.text}
                                {c.is_correct && " ✓"}
                                {c.id === selectedId && !c.is_correct && " ✗ (your answer)"}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : submitted && descriptiveResult ? (
            /* ── Descriptive Results screen ── */
            <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold ${
                  (descriptiveResult.total_marks / descriptiveResult.max_total_marks) >= 0.7
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
                    : "bg-amber-100 dark:bg-amber-900/30 text-amber-600"
                }`}
              >
                {descriptiveResult.max_total_marks > 0 ? Math.round((descriptiveResult.total_marks / descriptiveResult.max_total_marks) * 100) : 0}%
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {descriptiveResult.total_marks >= Math.ceil(descriptiveResult.max_total_marks * 0.7) ? "Well done!" : "Keep practising!"}
                </h3>
                <p className="text-gray-500 dark:text-slate-400 mt-1">
                  You got{" "}
                  <span className="font-bold text-gray-800 dark:text-white">
                    {descriptiveResult.total_marks} out of {descriptiveResult.max_total_marks}
                  </span>{" "}
                  marks.
                </p>
                <p className="text-gray-600 dark:text-slate-300 mt-3 text-sm italic max-w-xl mx-auto">
                  "{descriptiveResult.overall_feedback}"
                </p>
              </div>
              {/* Answer review */}
              <div className="w-full mt-6 space-y-4 text-left">
                <h4 className="font-semibold text-gray-700 dark:text-slate-300">Detailed Feedback</h4>
                {descriptiveResult.grades?.map((g: any, i: number) => (
                  <div key={i} className="rounded-xl border p-4 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                    <p className="text-sm font-bold text-gray-800 dark:text-white mb-2">Q{i + 1}. {g.question}</p>
                    <p className="text-sm text-gray-600 dark:text-slate-300 mb-2 whitespace-pre-wrap"><span className="font-semibold text-gray-700 dark:text-slate-400">Your Answer:</span><br/>{g.student_answer || "(no answer provided)"}</p>
                    <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">AI Feedback</span>
                        <span className="text-xs font-bold bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">{g.marks} / {g.max_marks} marks</span>
                      </div>
                      <p className="text-sm text-indigo-900 dark:text-indigo-200 whitespace-pre-wrap">{g.feedback}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* ── MCQ Questions ── */}
              {mcqQuestions.length > 0 && (
                <div className="space-y-5">
                  {hasMcq && totalDesc > 0 && (
                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">
                      Multiple Choice Questions
                    </p>
                  )}
                  {mcqQuestions.map((q, qi) => (
                    <div key={q.id} className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-5">
                      <p className="font-semibold text-gray-900 dark:text-white mb-4">
                        <span className="text-indigo-500 mr-2">Q{qi + 1}.</span>
                        {q.text}
                      </p>
                      <div className="space-y-2">
                        {q.choices?.map((choice) => {
                          const selected = mcqAnswers[q.id] === choice.id;
                          const letter = String.fromCharCode(65 + (q.choices?.indexOf(choice) ?? 0));
                          return (
                            <button
                              key={choice.id}
                              onClick={() =>
                                setMcqAnswers((prev) => ({ ...prev, [q.id]: choice.id }))
                              }
                              className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                                selected
                                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium"
                                  : "border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10"
                              }`}
                            >
                              <span
                                className={`w-7 h-7 rounded-full border text-xs font-bold flex items-center justify-center flex-shrink-0 transition-all ${
                                  selected
                                    ? "border-indigo-500 bg-indigo-500 text-white"
                                    : "border-gray-300 dark:border-slate-600 text-gray-400"
                                }`}
                              >
                                {letter}
                              </span>
                              {choice.text}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Descriptive / Open-ended Questions ── */}
              {descriptiveQuestions.length > 0 && (
                <div className="space-y-5">
                  {hasMcq && totalDesc > 0 && (
                    <div className="flex items-center gap-2 pt-2">
                      <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
                      <p className="text-xs font-bold text-amber-500 uppercase tracking-wider px-2">
                        Written Questions (AI Graded)
                      </p>
                      <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
                    </div>
                  )}
                  {isPureMock && (
                    <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                      <FiMessageSquare className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        Write your answers below. When ready, click <strong>Grade Written Answers</strong> — the AI will review your answers right here and give you a personalised score and feedback.
                      </p>
                    </div>
                  )}
                  {descriptiveQuestions.map((q, qi) => {
                    const qNumber = mcqQuestions.length + qi + 1;
                    const wordCount = (descAnswers[q.id] ?? "").trim().split(/\s+/).filter(Boolean).length;
                    return (
                      <div key={q.id} className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-5">
                        <p className="font-semibold text-gray-900 dark:text-white mb-1">
                          <span className="text-amber-500 mr-2">Q{qNumber}.</span>
                          {q.text}
                        </p>
                        {q.points > 1 && (
                          <p className="text-xs text-gray-400 dark:text-slate-500 mb-3">
                            {q.points} marks
                          </p>
                        )}
                        <textarea
                          rows={5}
                          value={descAnswers[q.id] ?? ""}
                          onChange={(e) =>
                            setDescAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                          }
                          placeholder="Write your answer here..."
                          className="w-full mt-2 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-sm text-gray-800 dark:text-slate-200 placeholder-gray-300 dark:placeholder-slate-600 focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 resize-none transition-all"
                        />
                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5 text-right">
                          {wordCount} word{wordCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        {!isLoading && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 flex-shrink-0">
            {submitted ? (
              /* Post-MCQ-submission close */
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs text-gray-400 dark:text-slate-500">
                  {hasMcq && !canSubmitMcq
                    ? `Answer all ${totalMcq} MCQ questions to submit.`
                    : isPureMock && !canSubmitDesc
                    ? "Write at least one answer to continue."
                    : ""}
                </p>
                <div className="flex gap-3">
                  {/* MCQ submit button */}
                  {hasMcq && (
                    <button
                      onClick={handleMcqSubmit}
                      disabled={!canSubmitMcq || submitQuiz.isPending}
                      className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        canSubmitMcq && !submitQuiz.isPending
                          ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
                          : "bg-gray-200 dark:bg-slate-800 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {submitQuiz.isPending ? "Submitting..." : "Submit MCQ"}
                    </button>
                  )}
                  {/* Descriptive: grade inline */}
                  {totalDesc > 0 && (
                    <button
                      onClick={handleDescriptiveGrade}
                      disabled={!canSubmitDesc || isGrading}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        canSubmitDesc && !isGrading
                          ? "bg-amber-500 text-white hover:bg-amber-600 shadow-md"
                          : "bg-gray-200 dark:bg-slate-800 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <FiMessageSquare className="w-4 h-4" />
                      {isGrading ? "Grading..." : "Grade Written Answers"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizTakerModal;
