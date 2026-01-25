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
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden sm:block"
            >
              Log in
            </a>
            <a
              href="#"
              className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
