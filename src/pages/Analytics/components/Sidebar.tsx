import React from "react";
import {
  LuLayoutDashboard,
  LuBookOpen,
  LuTrendingUp,
  LuFileText,
} from "react-icons/lu";

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col min-h-screen hidden lg:flex sticky top-0">
      <div className="p-6 border-b border-gray-200 dark:border-slate-800">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Analytics
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Performance Dashboard
        </p>
      </div>
      <nav className="flex-1 p-4">
        <a
          href="#"
          className="flex items-center px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg mb-2"
        >
          <LuLayoutDashboard className="w-5 h-5 mr-3" />
          Overview
        </a>
        <a
          href="#"
          className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg mb-2"
        >
          <LuBookOpen className="w-5 h-5 mr-3" />
          Subjects
        </a>
        <a
          href="#"
          className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg mb-2"
        >
          <LuTrendingUp className="w-5 h-5 mr-3" />
          Progress
        </a>
        <a
          href="#"
          className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
        >
          <LuFileText className="w-5 h-5 mr-3" />
          Reports
        </a>
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-slate-800">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
            JS
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              John Student
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              View Profile
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
