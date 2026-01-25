import React from "react";

const MockTests: React.FC = () => {
  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Upcoming Mock Tests
      </h3>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-slate-400">
            <thead className="bg-gray-50 dark:bg-slate-800 text-xs uppercase text-gray-500 dark:text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4">Test Name</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              <tr className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  Mid-Term Full Syllabus
                </td>
                <td className="px-6 py-4">Mathematics</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                    Hard
                  </span>
                </td>
                <td className="px-6 py-4">120 mins</td>
                <td className="px-6 py-4 text-gray-500 dark:text-slate-500">
                  Not Started
                </td>
                <td className="px-6 py-4">
                  <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium">
                    Start Test
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  Chapter 5: Chemical Bonding
                </td>
                <td className="px-6 py-4">Chemistry</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                    Medium
                  </span>
                </td>
                <td className="px-6 py-4">45 mins</td>
                <td className="px-6 py-4 text-gray-500 dark:text-slate-500">
                  In Progress
                </td>
                <td className="px-6 py-4">
                  <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium">
                    Resume
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  Weekly Quiz: Mechanics
                </td>
                <td className="px-6 py-4">Physics</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                    Easy
                  </span>
                </td>
                <td className="px-6 py-4">30 mins</td>
                <td className="px-6 py-4 text-green-600 dark:text-green-400 font-medium">
                  Completed (92%)
                </td>
                <td className="px-6 py-4">
                  <button className="text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 font-medium">
                    Review
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MockTests;
