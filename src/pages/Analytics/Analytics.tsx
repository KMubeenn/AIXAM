import React from "react";
import Sidebar from "./components/Sidebar";
import ScoreCards from "./components/ScoreCards";
import ChartsSection from "./components/ChartsSection";
import TopicPerformance from "./components/TopicPerformance";
import Insights from "./components/Insights";

const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 font-inter text-gray-800 dark:text-slate-100">
      <Sidebar />
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto h-screen">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Performance Analytics
          </h2>
          <p className="text-gray-600 mt-2">
            Track your learning progress and identify areas for improvement
          </p>
        </div>

        <ScoreCards />
        <ChartsSection />
        <TopicPerformance />
        <Insights />
      </main>
    </div>
  );
};

export default AnalyticsDashboard;
