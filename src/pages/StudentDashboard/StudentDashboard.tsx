import React from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardStats from "./components/DashboardStats";
import RecentMaterials from "./components/RecentMaterials";
import FlashcardDecks from "./components/FlashcardDecks";
import MockTests from "./components/MockTests";

const StudentDashboard: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 font-inter text-gray-800">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <DashboardStats />
          <RecentMaterials />
          <FlashcardDecks />
          <MockTests />
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
