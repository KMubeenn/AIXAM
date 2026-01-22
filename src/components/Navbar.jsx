import React, { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "light";
  }, [darkMode]);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <nav className="navbar">
        {/* Logo */}
        <div className="nav-left">
          <img src={logo} alt="AIXAM Logo" className="logo" />
          <span className="brand">AIXAM</span>
        </div>

        {/* Desktop Links */}
        <ul className="nav-center desktop-only">
          <li onClick={() => scrollToSection("home")}>Home</li>
          <li onClick={() => scrollToSection("about")}>About</li>
          <li onClick={() => scrollToSection("whyus")}>Why Us</li>
        </ul>

        {/* Desktop Buttons */}
        <div className="nav-right desktop-only">
          <button className="btn student" onClick={() => navigate("/login-student")}>Student</button>
          <button className="btn teacher" onClick={() => navigate("/login-teacher")}>Teacher</button>
          <div className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "🌙" : "☀️"}
          </div>
        </div>

        {/* Hamburger */}
        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span />
          <span />
          <span />
        </div>
      </nav>

      {/* Compact Mobile Panel */}
      {menuOpen && (
        <div className="mobile-panel">
          <ul className="mobile-nav">
            <li onClick={() => { scrollToSection("home"); setMenuOpen(false); }}>Home</li>
            <li onClick={() => { scrollToSection("about"); setMenuOpen(false); }}>About</li>
            <li onClick={() => { scrollToSection("whyus"); setMenuOpen(false); }}>Why Us</li>
          </ul>

          <div className="mobile-buttons">
            <button className="btn student" onClick={() => navigate("/login-student")}>Student</button>
            <button className="btn teacher" onClick={() => navigate("/login-teacher")}>Teacher</button>
          </div>
        </div>
      )}

      {/* CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');

        body {
          margin: 0;
          font-family: 'Poppins', sans-serif;
        }

        body.dark {
          background: radial-gradient(circle at top, #1a132b, #0b0617);
          color: #fff;
        }

        body.light {
          background: #f5f7fb;
          color: #111;
        }

        .navbar {
          width: 95%;
          margin: 20px auto;
          padding: 14px 26px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(18px);
          border-radius: 22px;
          border: 1px solid rgba(255,255,255,0.18);
          box-shadow: 0 20px 40px rgba(0,0,0,0.35);
          position: relative;
          z-index: 10;
        }

        .nav-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo {
          width: 46px;
          height: 56px;
        }

        .brand {
          font-size: 22px;
          font-weight: 600;
        }

        .nav-center {
          display: flex;
          gap: 32px;
          list-style: none;
        }

        .nav-right {
          display: flex;
          gap: 14px;
          align-items: center;
        }

        .btn {
          padding: 10px 18px;
          border-radius: 14px;
          border: none;
          font-size: 13px;
          cursor: pointer;
        }

        .btn.student {
          background: linear-gradient(135deg, #e7f6ff, #9edcff);
        }

        .btn.teacher {
          background: linear-gradient(135deg, #eafff3, #9ff0c6);
        }

        .theme-toggle {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background: rgba(255,255,255,0.12);
        }

        .hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
        }

        .hamburger span {
          width: 26px;
          height: 3px;
          background: #fff;
          border-radius: 10px;
        }

        /* -------- COMPACT MOBILE PANEL -------- */

        .mobile-panel {
          position: absolute;
          top: 90px;
          right: -20px;
          width: 260px;
          padding: 18px;
          background: rgba(255,255,255,0.14);
          backdrop-filter: blur(20px);
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.22);
          box-shadow: 0 20px 40px rgba(0,0,0,0.45);
          z-index: 20;
          animation: fadeSlide 0.25s ease;
        }

        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mobile-nav {
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .mobile-nav li {
          font-size: 16px;
          cursor: pointer;
        }

        .mobile-buttons {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* -------- RESPONSIVE -------- */
        @media (max-width: 900px) {
          .desktop-only {
            display: none;
          }

          .hamburger {
            display: flex;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;
