import React, { useState, useEffect } from "react";
import { LuFlaskConical, LuSquareCheck, LuTrash2 } from "react-icons/lu";
import { useQuizzes } from "../../../hooks/useCore";
import QuizTakerModal from "./QuizTakerModal";
import SubmissionsHistory from "./SubmissionsHistory";

interface MockTestsProps {
  initialQuizId?: string | null;
}

const MockTests: React.FC<MockTestsProps> = ({ initialQuizId }) => {
  const { data, isLoading } = useQuizzes();
  const quizzes = data?.quizzes ?? [];

  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);

  // Auto-open quiz if deep-linked from Chat
  useEffect(() => {
    if (initialQuizId) {
      setActiveQuizId(initialQuizId);
    }
  }, [initialQuizId]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "mock": return "Mock Test";
      case "assignment_quiz": return "Assignment Quiz";
      default: return type;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "mock":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300";
      case "assignment_quiz":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
      default:
        return "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400";
    }
  };

  return (
    <>
      {activeQuizId && (
        <QuizTakerModal quizId={activeQuizId} onClose={() => setActiveQuizId(null)} />
      )}

      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Quizzes & Mock Tests</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
              {isLoading ? "Loading..." : `${quizzes.length} test${quizzes.length !== 1 ? "s" : ""} available`}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
          {isLoading ? (
            <div className="space-y-px">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-50 dark:bg-slate-800/50 animate-pulse" />
              ))}
            </div>
          ) : quizzes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-400 mb-4">
                <LuFlaskConical className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-semibold text-gray-700 dark:text-slate-300 mb-1">
                No tests generated yet
              </h4>
              <p className="text-sm text-gray-400 dark:text-slate-500 max-w-xs">
                Chat with the AI and ask it to create a mock test or MCQ quiz. It'll show up here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-slate-400">
                <thead className="bg-gray-50 dark:bg-slate-800 text-xs uppercase text-gray-500 dark:text-slate-500 font-semibold">
                  <tr>
                    <th className="px-6 py-4">Test Name</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Questions</th>
                    <th className="px-6 py-4">Created</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {quizzes.map((quiz) => (
                    <tr key={quiz.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <LuSquareCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span className="line-clamp-1">{quiz.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getTypeBadge(quiz.quiz_type)}`}>
                          {getTypeLabel(quiz.quiz_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {quiz.question_count ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-400 dark:text-slate-500">
                        {new Date(quiz.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setActiveQuizId(quiz.id)}
                          className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 transition-all"
                        >
                          Start Test
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <SubmissionsHistory />
      </div>
    </>
  );
};

export default MockTests;
