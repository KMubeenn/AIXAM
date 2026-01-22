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
    <nav className="w-[95%] mx-auto mt-5 px-6 py-3.5 flex items-center justify-between bg-white/10 backdrop-blur-lg rounded-[22px] border border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.35)] relative z-10 transition-all duration-300">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <img
          src={logo}
          alt="AIXAM Logo"
          className="w-[46px] h-[56px] object-contain"
        />
        <span className="text-[22px] font-semibold">AIXAM</span>
      </div>

      {/* Desktop Links */}
      <ul className="hidden md:flex gap-8 list-none">
        {["home", "about", "whyus"].map((item) => (
          <li
            key={item}
            onClick={() => scrollToSection(item)}
            className="cursor-pointer hover:text-blue-400 transition-colors capitalize"
          >
            {item === "whyus" ? "Why Us" : item}
          </li>
        ))}
      </ul>

      {/* Desktop Buttons */}
      <div className="hidden md:flex gap-3.5 items-center">
        <button
          className="px-[18px] py-[10px] rounded-[14px] border-none text-[13px] cursor-pointer bg-gradient-to-br from-[#e7f6ff] to-[#9edcff] text-slate-800 hover:scale-105 transition-transform font-medium shadow-sm"
          onClick={() => navigate("/login-student")}
        >
          Student
        </button>
        <button
          className="px-[18px] py-[10px] rounded-[14px] border-none text-[13px] cursor-pointer bg-gradient-to-br from-[#eafff3] to-[#9ff0c6] text-slate-800 hover:scale-105 transition-transform font-medium shadow-sm"
          onClick={() => navigate("/login-teacher")}
        >
          Teacher
        </button>
        <div
          className="w-[42px] h-[42px] rounded-full flex items-center justify-center cursor-pointer bg-white/10 hover:bg-white/20 transition-colors"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "🌙" : "☀️"}
        </div>
      </div>

      {/* Hamburger */}
      <div
        className="flex md:hidden flex-col gap-[5px] cursor-pointer"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span className="w-[26px] h-[3px] bg-white rounded-full block" />
        <span className="w-[26px] h-[3px] bg-white rounded-full block" />
        <span className="w-[26px] h-[3px] bg-white rounded-full block" />
      </div>

      {/* Compact Mobile Panel */}
      {menuOpen && (
        <div className="absolute top-[90px] right-[-10px] w-[260px] p-[18px] bg-white/10 backdrop-blur-xl rounded-[18px] border border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.45)] z-20 animate-[fadeSlide_0.25s_ease] flex flex-col gap-4">
          <ul className="flex flex-col gap-3.5 list-none p-0 m-0">
            {["home", "about", "whyus"].map((item) => (
              <li
                key={item}
                onClick={() => {
                  scrollToSection(item);
                  setMenuOpen(false);
                }}
                className="text-base cursor-pointer hover:text-blue-300 capitalize"
              >
                {item === "whyus" ? "Why Us" : item}
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2.5 mt-2">
            <button
              className="px-[18px] py-[10px] rounded-[14px] border-none text-[13px] cursor-pointer bg-gradient-to-br from-[#e7f6ff] to-[#9edcff] text-slate-800 font-medium"
              onClick={() => navigate("/login-student")}
            >
              Student
            </button>
            <button
              className="px-[18px] py-[10px] rounded-[14px] border-none text-[13px] cursor-pointer bg-gradient-to-br from-[#eafff3] to-[#9ff0c6] text-slate-800 font-medium"
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
