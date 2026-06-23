import React from "react";
import logoImg from "../../../assets/logo/logo-only-black.png";
import { LuMenu, LuBell, LuMessageSquare } from "react-icons/lu";
import { useAuthStore } from "../../../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const fullName = user ? `${user.first_name} ${user.last_name}`.trim() || user.username : "Teacher";

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <img
            src={logoImg}
            alt="AIXAM Logo"
            className="h-12 w-auto dark:invert"
          />
        </div>
        <button className="p-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
          <LuMenu className="w-6 h-6" />
        </button>
      </div>

      {/* Main Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 px-6 pt-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {fullName}!
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Here's what's happening in your classrooms today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 relative">
            <LuBell className="w-6 h-6" />
          </button>
          <button
            onClick={() => navigate("/chat")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <LuMessageSquare className="w-4 h-4" />
            AI Assistant
          </button>
        </div>
      </div>
    </>
  );
};

export default Header;
