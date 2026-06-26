import React from "react";
import Sidebar from "../StudentDashboard/components/Sidebar";
import Header from "../StudentDashboard/components/Header";
import { useProfile } from "../../hooks/useUser";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";
import { LuUser, LuMail, LuTarget, LuAward, LuBookOpen } from "react-icons/lu";

const StudentProfile: React.FC = () => {
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  
  const { data: performanceData, isLoading: isPerformanceLoading } = useQuery({
    queryKey: ["student-performance"],
    queryFn: async () => {
      const response = await api.get("/core/performance/");
      return response.data.performance || [];
    },
  });

  const getInitials = (first?: string, last?: string) => {
    if (!first) return "S";
    return `${first[0]}${last ? last[0] : ""}`.toUpperCase();
  };

  const getStrongestTopic = () => {
    if (!performanceData || performanceData.length === 0) return { topic: "N/A", score: 0 };
    const sorted = [...performanceData].sort((a, b) => b.average_score - a.average_score);
    return sorted[0];
  };

  const getWeakestTopic = () => {
    if (!performanceData || performanceData.length <= 1) return { topic: "N/A", score: 0 };
    const sorted = [...performanceData].sort((a, b) => a.average_score - b.average_score);
    return sorted[0];
  };

  const getTotalTests = () => {
    if (!performanceData) return 0;
    return performanceData.reduce((acc: number, curr: any) => acc + curr.tests_taken, 0);
  };

  const getOverallAverage = () => {
    if (!performanceData || performanceData.length === 0) return 0;
    const total = performanceData.reduce((acc: number, curr: any) => acc + curr.average_score, 0);
    return Math.round(total / performanceData.length);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 dark:bg-slate-950 font-inter text-gray-800 dark:text-slate-100">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-8">
        <Header />
        
        <div className="max-w-4xl mx-auto space-y-6 mt-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Student Profile</h1>
          
          {isProfileLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-gray-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-32 bg-gray-200 dark:bg-slate-800 rounded-xl" />
            </div>
          ) : (
            <>
              {/* Personal Info Card */}
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-md flex-shrink-0">
                    {getInitials(profile?.first_name, profile?.last_name)}
                  </div>
                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {profile?.first_name} {profile?.last_name}
                    </h2>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 dark:text-slate-400">
                      <LuMail className="w-4 h-4" />
                      <span>{profile?.email}</span>
                    </div>
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400 mt-2">
                      <LuUser className="w-3 h-3 mr-1" />
                      Student
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Summary Card */}
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Performance Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                    <LuAward className="w-6 h-6 text-indigo-500 mb-2" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {getOverallAverage()}%
                    </span>
                    <span className="text-xs text-gray-500 dark:text-slate-400">Overall Avg</span>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                    <LuBookOpen className="w-6 h-6 text-blue-500 mb-2" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {getTotalTests()}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-slate-400">Tests Taken</span>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                    <LuTarget className="w-6 h-6 text-emerald-500 mb-2" />
                    <span className="text-sm font-bold text-gray-900 dark:text-white truncate w-full px-2" title={getStrongestTopic().topic}>
                      {getStrongestTopic().topic}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-slate-400">Strongest ({Math.round(getStrongestTopic().score)}%)</span>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                    <LuTarget className="w-6 h-6 text-rose-500 mb-2" />
                    <span className="text-sm font-bold text-gray-900 dark:text-white truncate w-full px-2" title={getWeakestTopic().topic}>
                      {getWeakestTopic().topic}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-slate-400">Weakest ({Math.round(getWeakestTopic().score)}%)</span>
                  </div>
                </div>
              </div>

              {/* Topic Performance Breakdown */}
              {isPerformanceLoading ? (
                 <div className="h-32 bg-gray-200 dark:bg-slate-800 rounded-xl animate-pulse" />
              ) : performanceData && performanceData.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">Topic Mastery</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {performanceData.map((tp: any, index: number) => {
                      const scorePercent = Math.round(tp.average_score);
                      return (
                        <div key={index} className="flex flex-col gap-2 p-4 bg-gray-50 dark:bg-slate-800/40 rounded-lg border border-gray-100 dark:border-slate-800">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate pr-2">{tp.topic}</span>
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full whitespace-nowrap">
                              {scorePercent}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                scorePercent >= 80 
                                  ? 'bg-emerald-500' 
                                  : scorePercent >= 60 
                                    ? 'bg-indigo-500' 
                                    : 'bg-amber-500'
                              }`} 
                              style={{ width: `${scorePercent}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 dark:text-slate-500">{tp.tests_taken} tests taken</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentProfile;
