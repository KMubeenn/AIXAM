import React from "react";
import { LuTarget, LuTrendingUp, LuBookOpen } from "react-icons/lu";
import { useStudentAnalytics } from "../../../hooks/useCore";
import { useAuthStore } from "../../../store/useAuthStore";

const DashboardStats: React.FC = () => {
  const { data, isLoading } = useStudentAnalytics();
  const { user } = useAuthStore();
  const firstName = user?.first_name || user?.username || "Student";

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Welcome Back, {firstName}!</h2>
          <p className="text-indigo-100 max-w-md">
            Ready to continue learning? Your performance analytics have been updated.
          </p>
        </div>
        
        {!isLoading && data && (
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 min-w-[140px] border border-white/20">
              <div className="flex items-center gap-2 text-indigo-100 mb-1">
                <LuTrendingUp className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase">Overall Score</span>
              </div>
              <div className="text-2xl font-bold">{data.overall_avg}%</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 min-w-[140px] border border-white/20 hidden sm:block">
              <div className="flex items-center gap-2 text-indigo-100 mb-1">
                <LuBookOpen className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase">Best Topic</span>
              </div>
              <div className="text-lg font-bold truncate max-w-[120px]">{data.strongest_topic}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardStats;
