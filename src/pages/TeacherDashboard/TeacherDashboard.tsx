import React from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import StatsCards from "./components/StatsCards";
import AssignmentGenerator from "./components/AssignmentGenerator";

const TeacherDashboard: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 dark:bg-slate-950 font-inter text-gray-800 dark:text-slate-100">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-8">
        <Header />
        <StatsCards />
        <AssignmentGenerator />
      </main>
    </div>
  );
};

export default TeacherDashboard;
