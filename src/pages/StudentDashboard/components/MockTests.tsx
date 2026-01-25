import React from "react";

const MockTests: React.FC = () => {
  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Upcoming Mock Tests
      </h3>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
              <tr>
                <th className="px-6 py-4">Test Name</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">
                  Mid-Term Full Syllabus
                </td>
                <td className="px-6 py-4">Mathematics</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Hard
                  </span>
                </td>
                <td className="px-6 py-4">120 mins</td>
                <td className="px-6 py-4 text-gray-500">Not Started</td>
                <td className="px-6 py-4">
                  <button className="text-indigo-600 hover:text-indigo-900 font-medium">
                    Start Test
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">
                  Chapter 5: Chemical Bonding
                </td>
                <td className="px-6 py-4">Chemistry</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Medium
                  </span>
                </td>
                <td className="px-6 py-4">45 mins</td>
                <td className="px-6 py-4 text-gray-500">In Progress</td>
                <td className="px-6 py-4">
                  <button className="text-indigo-600 hover:text-indigo-900 font-medium">
                    Resume
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">
                  Weekly Quiz: Mechanics
                </td>
                <td className="px-6 py-4">Physics</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Easy
                  </span>
                </td>
                <td className="px-6 py-4">30 mins</td>
                <td className="px-6 py-4 text-green-600 font-medium">
                  Completed (92%)
                </td>
                <td className="px-6 py-4">
                  <button className="text-gray-500 hover:text-gray-900 font-medium">
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
