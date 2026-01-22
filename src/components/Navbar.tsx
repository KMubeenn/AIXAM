import React, { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // This side effect updates the body class for global dark mode styles if any exist outside of Tailwind's 'dark' class
    // Tailwind's dark mode strategy is 'class' or 'media'. Since we are toggling a class on body,
    // we should ensure tailwind is configured to use 'class' strategy or just rely on 'dark' class being present.
    // Assuming 'dark' class on body triggers dark variant in Tailwind.
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="max-w-7xl w-[95%] mx-auto mt-5 px-6 py-3.5 flex items-center justify-between bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl relative z-50 transition-all duration-300">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <img
          src={logo}
          alt="AIXAM Logo"
          className="w-10 h-10 lg:w-11 lg:h-14 object-contain"
        />
        <span className="text-2xl font-semibold tracking-tight">AIXAM</span>
      </div>

      {/* Desktop Links */}
      <ul className="hidden md:flex items-center gap-8 list-none">
        {["home", "about", "whyus"].map((item) => (
          <li
            key={item}
            onClick={() => scrollToSection(item)}
            className="cursor-pointer font-medium hover:text-teal-400 dark:hover:text-teal-300 transition-colors capitalize text-sm lg:text-base"
          >
            {item === "whyus" ? "Why Us" : item}
          </li>
        ))}
      </ul>

      {/* Desktop Buttons */}
      <div className="hidden md:flex gap-3 items-center">
        <button
          className="px-5 py-2.5 rounded-xl border-none text-sm font-medium cursor-pointer bg-gradient-to-br from-sky-50 to-sky-200 text-slate-800 hover:scale-105 transition-transform shadow-sm"
          onClick={() => navigate("/login-student")}
        >
          Student
        </button>
        <button
          className="px-5 py-2.5 rounded-xl border-none text-sm font-medium cursor-pointer bg-gradient-to-br from-teal-50 to-teal-200 text-slate-800 hover:scale-105 transition-transform shadow-sm"
          onClick={() => navigate("/login-teacher")}
        >
          Teacher
        </button>
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer bg-white/10 hover:bg-white/20 transition-colors border border-white/10"
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? "🌙" : "☀️"}
        </button>
      </div>

      {/* Hamburger */}
      <div
        className="flex md:hidden flex-col gap-1.5 cursor-pointer p-1"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span className="w-6 h-0.5 bg-current rounded-full block" />
        <span className="w-6 h-0.5 bg-current rounded-full block" />
        <span className="w-6 h-0.5 bg-current rounded-full block" />
      </div>

      {/* Compact Mobile Panel */}
      {menuOpen && (
        <div className="absolute top-[110%] right-0 w-64 p-5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 shadow-2xl z-50 animate-in fade-in slide-in-from-top-4 flex flex-col gap-4">
          <ul className="flex flex-col gap-4 list-none p-0 m-0">
            {["home", "about", "whyus"].map((item) => (
              <li
                key={item}
                onClick={() => {
                  scrollToSection(item);
                  setMenuOpen(false);
                }}
                className="text-base font-medium cursor-pointer hover:text-teal-500 capitalize"
              >
                {item === "whyus" ? "Why Us" : item}
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 mt-2 border-t border-slate-200 dark:border-slate-700 pt-4">
            <button
              className="px-5 py-2.5 rounded-xl border-none text-sm font-medium cursor-pointer bg-gradient-to-br from-sky-50 to-sky-200 text-slate-800"
              onClick={() => navigate("/login-student")}
            >
              Student
            </button>
            <button
              className="px-5 py-2.5 rounded-xl border-none text-sm font-medium cursor-pointer bg-gradient-to-br from-teal-50 to-teal-200 text-slate-800"
              onClick={() => navigate("/login-teacher")}
            >
              Teacher
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
