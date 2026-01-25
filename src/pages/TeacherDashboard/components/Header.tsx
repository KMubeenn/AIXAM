import React from "react";
import logoImg from "../../../assets/logo/logo-only-black.png";
import { LuGraduationCap, LuMenu, LuBell, LuPlus } from "react-icons/lu";

const Header: React.FC = () => {
  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <img src={logoImg} alt="AIXAM Logo" className="h-12 w-auto" />
        </div>
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <LuMenu className="w-6 h-6" />
        </button>
      </div>

      {/* Main Header Area (Welcome Section) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, Sarah!
          </h1>
          <p className="text-gray-500 mt-1">
            Here's what's happening in your classrooms today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-400 hover:text-gray-600 relative">
            <LuBell className="w-6 h-6" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <LuPlus className="w-4 h-4" />
            New Course
          </button>
        </div>
      </div>
    </>
  );
};

export default Header;
