import React from "react";
import Sidebar from "../StudentDashboard/components/Sidebar";
import Header from "../StudentDashboard/components/Header";
import RecentMaterials from "../StudentDashboard/components/RecentMaterials";

const StudyMaterialsPage: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 dark:bg-slate-950 font-inter text-gray-800 dark:text-slate-100">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto p-6">
          <RecentMaterials />
        </div>
      </main>
    </div>
  );
};

export default StudyMaterialsPage;
