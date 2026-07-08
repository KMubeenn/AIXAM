import React from "react";
import { LuTrendingUp, LuBookOpen, LuTarget, LuClipboardCheck } from "react-icons/lu";
import { useStudentAnalytics } from "../../../hooks/useCore";

const Skeleton = () => (
  <div className="h-8 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
);

const ScoreCards: React.FC = () => {
  const { data, isLoading } = useStudentAnalytics();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
      {/* Overall Score */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <LuTrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">Overall Score</p>
        {isLoading ? <Skeleton /> : (
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{data?.overall_avg ?? 0}%</p>
        )}
        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
          Across {data?.total_tests ?? 0} tests
        </p>
      </div>

      {/* Total Tests */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
            <LuClipboardCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">Tests Taken</p>
        {isLoading ? <Skeleton /> : (
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{data?.total_tests ?? 0}</p>
        )}
        <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">Total assessments</p>
      </div>

      {/* Strongest Subject */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <LuBookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">Strongest Subject</p>
        {isLoading ? <Skeleton /> : (
          <p className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
            {data?.strongest_topic ?? "N/A"}
          </p>
        )}
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
          {data?.strongest_score ?? 0}% average
        </p>
      </div>

      {/* Needs Focus */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
            <LuTarget className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">Needs Focus</p>
        {isLoading ? <Skeleton /> : (
          <p className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
            {data?.weakest_topic ?? "N/A"}
          </p>
        )}
        <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
          {data?.weakest_score ?? 0}% average
        </p>
      </div>
    </div>
  );
};

export default ScoreCards;
