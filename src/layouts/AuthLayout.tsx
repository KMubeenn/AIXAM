import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col font-inter bg-slate-50">
      <Navbar />
      <main className="flex-1 flex flex-col relative w-full pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AuthLayout;
