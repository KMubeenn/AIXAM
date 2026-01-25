import React from "react";
import { Link } from "react-router-dom";
import { LuBrainCircuit } from "react-icons/lu";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <LuBrainCircuit className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              AIXAM
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/student-dashboard"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Student
            </Link>
            <Link
              to="/teacher-dashboard"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Teacher
            </Link>
            <Link
              to="/analytics"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Analytics
            </Link>
            <a
              href="#"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              About
            </a>
          </div>
          <div className="flex items-center gap-4 relative">
            <div className="relative group">
              <button className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden sm:flex items-center gap-1">
                Log in
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                <div className="p-1">
                  <Link
                    to="/login-student"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg"
                  >
                    Student Login
                  </Link>
                  <Link
                    to="/login-teacher"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg"
                  >
                    Teacher Login
                  </Link>
                </div>
              </div>
            </div>
            <Link
              to="/create-account"
              className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
