import React from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { useAssignments, useTeacherQuizzes, useTeacherAnalytics } from "../../hooks/useCore";
import { LuBookOpen, LuFileQuestion, LuGraduationCap, LuCalendar } from "react-icons/lu";

const TeacherDashboard: React.FC = () => {
  const { data: assignmentsData, isLoading: assignmentsLoading } = useAssignments();
  const { data: quizzesData, isLoading: quizzesLoading } = useTeacherQuizzes();
  const { data: analyticsData, isLoading: analyticsLoading } = useTeacherAnalytics();

  const assignments = assignmentsData?.assignments ?? [];
  const quizzes = quizzesData?.quizzes ?? [];
  const classAvg = analyticsData?.class_average;

  const Skeleton = () => (
    <div className="h-6 bg-gray-150 dark:bg-slate-800 rounded animate-pulse w-16 mt-1" />
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 dark:bg-slate-950 font-inter text-gray-800 dark:text-slate-100">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <Header />

        {/* Read-Only Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-500 dark:text-slate-400">Total Assignments</span>
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <LuBookOpen className="w-5 h-5" />
              </div>
            </div>
            {assignmentsLoading ? <Skeleton /> : (
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{assignments.length}</h3>
            )}
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-2 font-medium">Read-only overview</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-500 dark:text-slate-400">Total Quizzes</span>
              <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                <LuFileQuestion className="w-5 h-5" />
              </div>
            </div>
            {quizzesLoading ? <Skeleton /> : (
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{quizzes.length}</h3>
            )}
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-2 font-medium">Read-only overview</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-500 dark:text-slate-400">Class Average</span>
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <LuGraduationCap className="w-5 h-5" />
              </div>
            </div>
            {analyticsLoading ? <Skeleton /> : (
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                {classAvg !== undefined ? `${Math.round(classAvg)}%` : "N/A"}
              </h3>
            )}
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-2 font-medium">Class-wide performance</p>
          </div>
        </div>

        {/* Split Column Lists */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Assignments Panel */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <LuBookOpen className="w-5 h-5 text-indigo-500" />
              Assignments List
            </h2>
            {assignmentsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-50 dark:bg-slate-800/40 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : assignments.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-slate-500 py-6 text-center">No assignments created yet.</p>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 no-scrollbar">
                {assignments.map((item) => (
                  <div key={item.id} className="p-4 bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800/60 rounded-xl flex items-center justify-between">
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.title}</h4>
                      <p className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1 mt-1 font-medium">
                        <LuCalendar className="w-3.5 h-3.5" />
                        Due: {item.deadline ? new Date(item.deadline).toLocaleDateString() : "No deadline"}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-lg shrink-0">
                      {item.max_points} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quizzes Panel */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <LuFileQuestion className="w-5 h-5 text-blue-500" />
              Quizzes List
            </h2>
            {quizzesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-50 dark:bg-slate-800/40 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : quizzes.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-slate-500 py-6 text-center">No quizzes created yet.</p>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 no-scrollbar">
                {quizzes.map((item) => (
                  <div key={item.id} className="p-4 bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800/60 rounded-xl flex items-center justify-between">
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.title}</h4>
                      <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 font-medium">
                        AI-Generated Quiz
                      </p>
                    </div>
                    <span className="text-xs font-bold text-blue-650 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-lg shrink-0">
                      {item.questions?.length ?? 0} questions
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
