import React from "react";

const TopicPerformance: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-slate-800 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Topic-Level Performance
      </h3>
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Algebra
            </span>
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
              95%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700/50 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: "95%" }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Geometry
            </span>
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
              88%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700/50 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: "88%" }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Physics - Mechanics
            </span>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              78%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700/50 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: "78%" }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Chemistry - Organic
            </span>
            <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
              68%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700/50 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full"
              style={{ width: "68%" }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Biology - Cell Structure
            </span>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              82%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700/50 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: "82%" }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
              English - Literature
            </span>
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
              85%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700/50 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: "85%" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicPerformance;
