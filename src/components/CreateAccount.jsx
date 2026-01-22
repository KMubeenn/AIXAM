import React from "react";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiLock, FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import logoImg from "../assets/logo.png";

export default function CreateAccount() {
  const navigate = useNavigate();

  return (
    <>
      <style>{authCSS}</style>

      <div className="auth-page">
        {/* TOP BAR */}
        <div className="top-bar">
          <div className="back-home" onClick={() => navigate("/")}>
            <FiArrowLeft />
            <span>Back to Home</span>
          </div>
        </div>

        {/* DECORATIVE SHAPES */}
        <div className="shape circle one" />
        <div className="shape circle two" />
        <div className="shape square one" />
        <div className="shape square two" />

        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* LOGO */}
          <img src={logoImg} alt="AIXAM Logo" className="logo-img" />

          <div className="welcome">Create Account</div>

          <div className="form-center">
            <div className="field small">
              <FiUser className="icon" />
              <input placeholder="Full Name" />
            </div>

            <div className="field small">
              <FiMail className="icon" />
              <input placeholder="Email" />
            </div>

            <div className="field small">
              <FiLock className="icon" />
              <input type="password" placeholder="Password" />
            </div>

            <div className="field small">
              <select className="role-select">
                <option>Select Role</option>
                <option>Teacher</option>
                <option>Student</option>
              </select>
            </div>
          </div>

          <button className="btn center">Create Account</button>
        </motion.div>
      </div>
    </>
  );
}

const authCSS = `
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&display=swap");

/* ===============================
   PAGE BASE
================================ */
.auth-page {
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;

  display: flex;
  justify-content: center;
  align-items: center;

  background: radial-gradient(circle at top, #020617 0%, #000 70%);
  color: #f8fafc;
  font-family: "Inter", sans-serif;
}

/* ===============================
   TOP BAR
================================ */
.top-bar {
  position: absolute;
  top: 24px;
  left: 28px;
  right: 28px;
  display: flex;
  justify-content: space-between;
  z-index: 10;
}

.back-home {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 600;
  font-family: "Poppins", sans-serif;

  background: linear-gradient(90deg, #5eead4, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* ===============================
   SHAPES
================================ */
.shape {
  position: absolute;
  filter: blur(40px);
  opacity: 0.35;
  background: linear-gradient(135deg, #5eead4, #60a5fa);
}

.circle {
  border-radius: 50%;
}

.square {
  border-radius: 20%;
}

.shape.one {
  width: 220px;
  height: 220px;
  top: 10%;
  left: 8%;
}

.shape.two {
  width: 280px;
  height: 280px;
  bottom: 12%;
  right: 6%;
}

.square.one {
  width: 180px;
  height: 180px;
  top: 65%;
  left: 15%;
}

.square.two {
  width: 140px;
  height: 140px;
  top: 18%;
  right: 20%;
}

/* ===============================
   CARD
================================ */
.auth-card {
  width: 420px;
  max-width: 92%;
  padding: 42px;
  border-radius: 28px;

  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(22px);
  border: 1px solid rgba(255, 255, 255, 0.18);

  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
  z-index: 5;
}

/* ===============================
   LOGO
================================ */
.logo-img {
  height: 90px;
  margin: 0 auto 14px;
  display: block;
}

/* ===============================
   HEADING
================================ */
.welcome {
  text-align: center;
  margin-bottom: 28px;
  font-size: 1.3rem;
  font-weight: 600;
  font-family: "Poppins", sans-serif;

  background: linear-gradient(90deg, #5eead4, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* ===============================
   FORM
================================ */
.form-center {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.field {
  position: relative;
  margin-bottom: 18px;
}

.field.small {
  width: 85%;
}

.field input,
.role-select {
  width: 80%;
  height: 52px;
  padding: 0 48px;
  border-radius: 16px;

  background: #000;
  border: 1px solid rgba(255, 255, 255, 0.25);

  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;

  outline: none;
}

.field input::placeholder {
  color: #cbd5f5;
}

/* ICON */
.icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

/* ===============================
   SELECT (PROMINENT)
================================ */
.role-select {
  appearance: none;
  cursor: pointer;

  background-color: #000;
  background-image:
    linear-gradient(45deg, transparent 50%, #5eead4 50%),
    linear-gradient(135deg, #5eead4 50%, transparent 50%);
  background-position:
    calc(100% - 22px) 50%,
    calc(100% - 16px) 50%;
  background-size: 6px 6px;
  background-repeat: no-repeat;
}

/* ===============================
   BUTTON
================================ */
.btn.center {
  width: 70%;
  height: 54px;
  margin: 14px auto 0;
  display: block;

  border-radius: 18px;
  font-weight: 700;
  font-size: 1rem;

  background: linear-gradient(135deg, #5eead4, #60a5fa);
  border: none;
  color: #ffffff;
  cursor: pointer;
}

.btn.center:hover {
  box-shadow: 0 20px 60px rgba(94, 234, 212, 0.45);
}

`