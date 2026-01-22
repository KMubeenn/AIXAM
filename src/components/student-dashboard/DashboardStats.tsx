import { LuTarget, LuCirclePlay, LuTrendingUp } from "react-icons/lu";

const DashboardStats: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Today's Focus */}
      <div className="lg:col-span-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 text-indigo-100">
            <LuTarget className="w-4 h-4" />
            <span className="text-sm font-medium uppercase tracking-wider">
              Today's Study Focus
            </span>
          </div>
          <h2 className="text-3xl font-bold mb-2">
            Molecular Biology & Genetics
          </h2>
          <p className="text-indigo-100 mb-6 max-w-lg">
            Complete Chapter 4 revision and attempt the practice quiz before 5
            PM. You're 75% through this module.
          </p>

          <div className="flex flex-wrap gap-3">
            <button className="bg-white text-indigo-600 px-5 py-2.5 rounded-lg font-semibold hover:bg-indigo-50 transition-colors flex items-center gap-2 cursor-pointer">
              <LuCirclePlay className="w-4 h-4" />
              Continue Learning
            </button>
            <button className="bg-indigo-700 bg-opacity-50 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-opacity-70 transition-colors border border-indigo-400 border-opacity-30 cursor-pointer">
              View Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats / Progress */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
        <h3 className="font-bold text-gray-900 mb-4">Weekly Progress</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Physics</span>
              <span className="font-medium text-gray-900">85%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: "85%" }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Chemistry</span>
              <span className="font-medium text-gray-900">62%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: "62%" }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Mathematics</span>
              <span className="font-medium text-gray-900">40%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full"
                style={{ width: "40%" }}
              ></div>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>12 hrs studied this week</span>
          <span className="text-green-600 font-medium flex items-center gap-1">
            <LuTrendingUp className="w-3 h-3" /> +15%
          </span>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
