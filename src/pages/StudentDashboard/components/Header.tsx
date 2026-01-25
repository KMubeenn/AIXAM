import React from "react";
import { LuSearch, LuBell, LuMenu } from "react-icons/lu";

const Header: React.FC = () => {
  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
            S
          </div>
          <span className="font-bold text-lg text-gray-900">StudyMate</span>
        </div>
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <LuMenu className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 hidden lg:flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search topics..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-64"
            />
          </div>
          <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
            <LuBell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>
    </>
  );
};

export default Header;
