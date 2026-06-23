import React from "react";
import { LuBookOpen, LuClipboardCheck, LuCalendarClock, LuGraduationCap } from "react-icons/lu";
import { useAssignments, useTeacherAnalytics } from "../../../hooks/useCore";

const StatsCards: React.FC = () => {
  const { data: assignmentsData, isLoading: isAssignmentsLoading } = useAssignments();
  const { data: analyticsData, isLoading: isAnalyticsLoading } = useTeacherAnalytics();

  const assignments = assignmentsData?.assignments ?? [];
  const analytics = analyticsData;

  const now = Date.now();
  const upcomingDeadlines = assignments.filter((a) => {
    if (!a.deadline) return false;
    const diff = new Date(a.deadline).getTime() - now;
    return diff > 0 && diff < 48 * 60 * 60 * 1000;
  });

  const pastDeadlines = assignments.filter((a) => {
    if (!a.deadline) return false;
    return new Date(a.deadline).getTime() < now;
  });

  const Skeleton = () => (
    <div className="h-8 w-20 bg-gray-200 dark:bg-slate-800 rounded animate-pulse" />
  );

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Assignments */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <LuBookOpen className="w-6 h-6" />
            </div>
            {!isAssignmentsLoading && (
              <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${
                assignments.length > 0
                  ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30"
                  : "text-gray-400 bg-gray-100 dark:bg-slate-800"
              }`}>
                {assignments.length} total
              </span>
            )}
          </div>
          {isAssignmentsLoading ? <Skeleton /> : (
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{assignments.length}</h3>
          )}
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Assignments Created</p>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
            <p className="text-xs text-gray-400 dark:text-slate-500">
              {isAssignmentsLoading ? "Loading..." : `${pastDeadlines.length} past deadline`}
            </p>
          </div>
        </div>

        {/* Upcoming Deadlines (48h) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
              <LuClipboardCheck className="w-6 h-6" />
            </div>
            {!isAssignmentsLoading && upcomingDeadlines.length > 0 && (
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2.5 py-0.5 rounded-full">
                Due soon
              </span>
            )}
          </div>
          {isAssignmentsLoading ? <Skeleton /> : (
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{upcomingDeadlines.length}</h3>
          )}
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Due in Next 48h</p>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 space-y-1">
            {isAssignmentsLoading ? (
              <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded animate-pulse w-3/4" />
            ) : upcomingDeadlines.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-slate-500">No upcoming deadlines</p>
            ) : (
              upcomingDeadlines.slice(0, 2).map((a) => (
                <div key={a.id} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-slate-400 truncate max-w-[120px]">{a.title}</span>
                  <span className="text-orange-500 font-medium flex-shrink-0">
                    {new Date(a.deadline!).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Total Submissions */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
              <LuCalendarClock className="w-6 h-6" />
            </div>
          </div>
          {isAnalyticsLoading ? <Skeleton /> : (
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              {analytics?.total_submissions ?? 0}
            </h3>
          )}
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Total Submissions</p>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 space-y-1.5">
            {isAnalyticsLoading ? (
              <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded animate-pulse w-full" />
            ) : (
              <p className="text-xs text-gray-400 dark:text-slate-500">
                Across all synced course assignments
              </p>
            )}
          </div>
        </div>

        {/* Class Average Score */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <LuGraduationCap className="w-6 h-6" />
            </div>
            {!isAnalyticsLoading && analytics?.class_average !== undefined && (
              <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${
                analytics.class_average >= 75
                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30"
                  : "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30"
              }`}>
                {Math.round(analytics.class_average)}% Avg
              </span>
            )}
          </div>
          {isAnalyticsLoading ? <Skeleton /> : (
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              {analytics?.class_average !== undefined ? `${Math.round(analytics.class_average)}%` : "N/A"}
            </h3>
          )}
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Class Average Score</p>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 space-y-1.5">
            {isAnalyticsLoading ? (
              <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded animate-pulse w-full" />
            ) : (
              <p className="text-xs text-gray-400 dark:text-slate-500">
                Grade benchmark across all classes
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Topic Performance Breakdown */}
      {analytics && analytics.topics && analytics.topics.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Topic Performance Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.topics.map((tp: any, index: number) => {
              const scorePercent = Math.round(tp.avg_score);
              return (
                <div key={index} className="flex flex-col gap-2 p-4 bg-gray-50 dark:bg-slate-800/40 rounded-lg border border-gray-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">{tp.topic}</span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">
                      Avg: {scorePercent}%
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
                  <span className="text-xs text-gray-400 dark:text-slate-500">{tp.student_count} submissions</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsCards;
