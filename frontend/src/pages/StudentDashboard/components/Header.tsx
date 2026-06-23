import React from "react";
import logoImg from "../../../assets/logo/logo-only-black.png";
import { LuBell, LuMenu } from "react-icons/lu";
import { useLocation } from "react-router-dom";

const Header: React.FC = () => {
  const location = useLocation();

  const getTitle = () => {
    switch (location.pathname) {
      case "/student-dashboard":
        return "Dashboard Overview";
      case "/study-materials":
        return "Study Materials";
      case "/mock-tests":
        return "Mock Tests";
      case "/flashcards":
        return "Flashcards";
      default:
        return "Dashboard Overview";
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <img
            src={logoImg}
            alt="AIXAM Logo"
            className="h-12 w-auto dark:invert"
          />
        </div>
        <button className="p-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
          <LuMenu className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 hidden lg:flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {getTitle()}
        </h1>
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <LuBell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>
        </div>
      </header>
    </>
  );
};

export default Header;
