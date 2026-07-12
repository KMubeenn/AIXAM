import React, { useState } from "react";
import Sidebar from "../TeacherDashboard/components/Sidebar";
import Header from "../TeacherDashboard/components/Header";
import TeacherQuizzesList from "./components/TeacherQuizzesList";
import GenerateQuizModal from "./components/GenerateQuizModal";
import { LuFileQuestion, LuSparkles } from "react-icons/lu";

const TeacherQuizzes: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 dark:bg-slate-950 font-inter text-gray-800 dark:text-slate-100">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <LuFileQuestion className="w-5 h-5" />
                </span>
                Quizzes
              </h1>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 ml-12">
                AI-generated assignment quizzes.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm"
            >
              <LuSparkles className="w-4 h-4" />
              Generate with AI
            </button>
          </div>

          <TeacherQuizzesList />
        </div>
      </main>

      <GenerateQuizModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default TeacherQuizzes;
