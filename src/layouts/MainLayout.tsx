import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f5f7fb] dark:bg-radial-dark text-gray-900 dark:text-white font-poppins">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
