import React from "react";
import { LuBookOpen, LuClipboardCheck, LuCalendarClock } from "react-icons/lu";
import { useAssignments } from "../../../hooks/useCore";

const StatsCards: React.FC = () => {
  const { data, isLoading } = useAssignments();
  const assignments = data?.assignments ?? [];

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Assignments */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
            <LuBookOpen className="w-6 h-6" />
          </div>
          {!isLoading && (
            <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${
              assignments.length > 0
                ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30"
                : "text-gray-400 bg-gray-100 dark:bg-slate-800"
            }`}>
              {assignments.length} total
            </span>
          )}
        </div>
        {isLoading ? <Skeleton /> : (
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{assignments.length}</h3>
        )}
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Assignments Created</p>
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
          <p className="text-xs text-gray-400 dark:text-slate-500">
            {isLoading ? "Loading..." : `${pastDeadlines.length} past deadline`}
          </p>
        </div>
      </div>

      {/* Upcoming Deadlines (48h) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
            <LuClipboardCheck className="w-6 h-6" />
          </div>
          {!isLoading && upcomingDeadlines.length > 0 && (
            <span className="text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2.5 py-0.5 rounded-full">
              Due soon
            </span>
          )}
        </div>
        {isLoading ? <Skeleton /> : (
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{upcomingDeadlines.length}</h3>
        )}
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Due in Next 48h</p>
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 space-y-1">
          {isLoading ? (
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

      {/* Deadline Calendar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
            <LuCalendarClock className="w-6 h-6" />
          </div>
        </div>
        {isLoading ? <Skeleton /> : (
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
            {assignments.filter((a) => a.deadline && new Date(a.deadline).getTime() > now).length}
          </h3>
        )}
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Active Assignments</p>
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 space-y-1.5">
          {isLoading ? (
            <>
              <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded animate-pulse w-full" />
              <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded animate-pulse w-2/3" />
            </>
          ) : assignments.filter((a) => a.deadline && new Date(a.deadline).getTime() > now).slice(0, 2).map((a) => (
            <div key={a.id} className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-slate-400 truncate max-w-[130px]">{a.title}</span>
              <span className="text-purple-500 font-medium flex-shrink-0">
                {new Date(a.deadline!).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
