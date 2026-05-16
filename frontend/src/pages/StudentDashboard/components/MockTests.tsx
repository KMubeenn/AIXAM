import React from "react";
import { useQuizzes } from "../../../hooks/useCore";

const MockTests: React.FC = () => {
  const { data, isLoading } = useQuizzes();
  const quizzes = data?.quizzes || [];

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Your Quizzes & Mock Tests
      </h3>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-slate-400">
            <thead className="bg-gray-50 dark:bg-slate-800 text-xs uppercase text-gray-500 dark:text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4">Test Name</th>
                <th className="px-6 py-4">Created At</th>
                <th className="px-6 py-4">Questions</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">Loading quizzes...</td>
                </tr>
              ) : quizzes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No quizzes generated yet. Start a chat to generate one!</td>
                </tr>
              ) : (
                quizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {quiz.title}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(quiz.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {quiz.questions?.length || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium">
                        Start Test
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MockTests;
