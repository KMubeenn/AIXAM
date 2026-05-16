import { LuTarget, LuCirclePlay, LuTrendingUp } from "react-icons/lu";
import { usePerformance } from "../../../hooks/useCore";

const DashboardStats: React.FC = () => {
  const { data, isLoading } = usePerformance();
  const stats = data?.performance;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Today's Focus */}
      <div className="lg:col-span-2 bg-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 text-indigo-100">
            <LuTarget className="w-4 h-4" />
            <span className="text-sm font-medium uppercase tracking-wider">
              Today's Study Focus
            </span>
          </div>
          <h2 className="text-3xl font-bold mb-2">
            Welcome Back!
          </h2>
          <p className="text-indigo-100 mb-6 max-w-lg">
            {isLoading ? "Loading your progress..." : `You have completed ${stats?.total_submissions || 0} submissions so far. Your average score is ${stats?.average_score?.toFixed(1) || 0}%.`}
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">
          Performance Overview
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <p className="text-gray-600 dark:text-slate-400">Average Score</p>
              <p className="font-medium text-gray-900 dark:text-white">{stats?.average_score?.toFixed(1) || 0}%</p>
            </div>
            <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${stats?.average_score || 0}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-slate-400">
                Submissions
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {stats?.total_submissions || 0}
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${Math.min((stats?.total_submissions || 0) * 10, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-sm text-gray-500 dark:text-slate-500">
          <span>Trend: {stats?.improvement_trend || 'N/A'}</span>
          <span className={`${stats?.improvement_trend === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-orange-600'} font-medium flex items-center gap-1 uppercase text-xs`}>
            <LuTrendingUp className="w-3 h-3" /> {stats?.improvement_trend}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
