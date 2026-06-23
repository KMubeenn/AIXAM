import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../TeacherDashboard/components/Sidebar";
import Header from "../TeacherDashboard/components/Header";
import CoursesList from "./components/CoursesList";
import { LuUsers, LuCircleCheck, LuX } from "react-icons/lu";

const Classroom: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShowSuccess(true);
      // Clean up the URL by removing the query parameter
      searchParams.delete("success");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 dark:bg-slate-950 font-inter text-gray-800 dark:text-slate-100">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header />
        
        {/* Success Modal */}
        {showSuccess && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 w-full max-w-md p-8 flex flex-col items-center text-center relative animate-in zoom-in-95 duration-300">
              <button 
                onClick={() => setShowSuccess(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500 dark:text-emerald-400 mb-6 shadow-inner ring-8 ring-emerald-50 dark:ring-emerald-900/10">
                <LuCircleCheck className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Successfully Connected!</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-8 leading-relaxed">
                Your Google Classroom account has been successfully linked. You can now view your courses and manage submissions directly from AIXAM.
              </p>
              <button 
                onClick={() => setShowSuccess(false)}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98]"
              >
                Continue to Classroom
              </button>
            </div>
          </div>
        )}

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
