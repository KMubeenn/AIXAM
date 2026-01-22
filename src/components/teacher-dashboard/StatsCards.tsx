import React from "react";
import { LuBookOpen, LuClipboardCheck, LuCalendarClock } from "react-icons/lu";

const StatsCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Active Courses */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <LuBookOpen className="w-6 h-6" />
          </div>
          <span className="text-sm font-medium text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full">
            +2 this week
          </span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">12</h3>
        <p className="text-gray-500 text-sm">Active Courses</p>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex -space-x-2 overflow-hidden">
            <img
              className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt=""
            />
            <img
              className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
              src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt=""
            />
            <img
              className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt=""
            />
            <div className="h-8 w-8 rounded-full bg-gray-100 ring-2 ring-white flex items-center justify-center text-xs font-medium text-gray-500">
              +145
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Total Students Enrolled</p>
        </div>
      </div>

      {/* Pending Evaluations */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
            <LuClipboardCheck className="w-6 h-6" />
          </div>
          <span className="text-sm font-medium text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full">
            High Priority
          </span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">28</h3>
        <p className="text-gray-500 text-sm">Pending Evaluations</p>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
            <div
              className="bg-orange-500 h-2 rounded-full"
              style={{ width: "45%" }}
            ></div>
          </div>
          <p className="text-xs text-gray-400">45% graded this week</p>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <LuCalendarClock className="w-6 h-6" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">5</h3>
        <p className="text-gray-500 text-sm">Upcoming Deadlines (48h)</p>
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 truncate">
              History 101 Final Essay
            </span>
            <span className="text-red-500 font-medium text-xs">Today</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 truncate">Math Quiz: Algebra</span>
            <span className="text-orange-500 font-medium text-xs">
              Tomorrow
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
