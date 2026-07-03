import React from "react";
import Sidebar from "../StudentDashboard/components/Sidebar";
import ScoreCards from "./components/ScoreCards";
import ChartsSection from "./components/ChartsSection";
import TopicPerformance from "./components/TopicPerformance";
import Insights from "./components/Insights";

const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 dark:bg-slate-950 font-inter text-gray-800 dark:text-slate-100">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
          <div className="mb-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Performance Analytics
            </h2>
            <p className="text-gray-600 dark:text-slate-400 mt-2">
              Track your learning progress and identify areas for improvement.
            </p>
          </div>

          <ScoreCards />
          <ChartsSection />
          <TopicPerformance />
          <Insights />
        </div>
      </main>
    </div>
  );
};

export default AnalyticsDashboard;
