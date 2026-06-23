import React from "react";
import Sidebar from "../TeacherDashboard/components/Sidebar";
import Header from "../TeacherDashboard/components/Header";
import CoursesList from "./components/CoursesList";
import { LuUsers } from "react-icons/lu";

const Classroom: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 dark:bg-slate-950 font-inter text-gray-800 dark:text-slate-100">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <LuUsers className="w-5 h-5" />
              </span>
              Google Classroom
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 ml-12">
              View your courses, student submissions, and push grades directly to Google Classroom.
            </p>
          </div>

          <CoursesList />
        </div>
      </main>
    </div>
  );
};

export default Classroom;
