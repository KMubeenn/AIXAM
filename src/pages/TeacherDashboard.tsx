import React from "react";
import Sidebar from "../components/teacher-dashboard/Sidebar";
import Header from "../components/teacher-dashboard/Header";
import StatsCards from "../components/teacher-dashboard/StatsCards";
import AssignmentGenerator from "../components/teacher-dashboard/AssignmentGenerator";

const TeacherDashboard: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 font-inter text-gray-800">
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
