import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiUserCheck,
  FiArrowLeft,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import logoImg from "../assets/logo.png";

export default function LoginT() {
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <style>{authCSS}</style>

      <div className="auth-page">
        {/* BACK TO HOME */}
        <div className="back-home" onClick={() => navigate("/")}>
          <FiArrowLeft />
          <span>Back to Home</span>
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

          <div className="welcome">
            <FiUserCheck /> Welcome Teacher
          </div>

          <div className="field">
            <FiMail className="icon" />
            <input placeholder="Email" />
          </div>

          <div className="field">
            <FiLock className="icon" />
            <input
              type={showPass ? "text" : "password"}
              placeholder="Password"
            />
            <div className="eye" onClick={() => setShowPass(!showPass)}>
              {showPass ? <FiEyeOff /> : <FiEye />}
            </div>
          </div>

          <button className="btn">Login</button>

          <div className="switch">
            Didn’t have account?{" "}
            <span onClick={() => navigate("/create-account")}>
              Create Account
            </span>
          </div>
        </motion.div>
      </div>
    </>
  );
}

const authCSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&display=swap');

/* ===============================
   AUTH PAGE BASE
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
   BACK TO HOME
================================ */
.back-home {
  position: absolute;
  top: 24px;
  left: 28px;

  display: flex;
  align-items: center;
  gap: 8px;

  font-family: "Poppins", sans-serif;
  font-weight: 600;
  cursor: pointer;
  z-index: 10;

  background: linear-gradient(90deg, #5eead4, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* ===============================
   DECORATIVE SHAPES
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
   AUTH CARD
================================ */
.auth-card {
  width: 420px;
  max-width: 92%;
  padding: 42px;
  border-radius: 28px;

  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);

  border: 1px solid rgba(255, 255, 255, 0.18);

  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.55),
    inset 0 0 0 1px rgba(255,255,255,0.05);

  transition: all 0.4s ease;
  z-index: 5;
}

.auth-card:hover {
  transform: translateY(-8px);
}

/* ===============================
   LOGO
================================ */
.logo-img {
  display: block;
  margin: 0 auto 12px;
  height: 108px;
}

/* ===============================
   WELCOME
================================ */
.welcome {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  
  margin: 14px 0 28px;
  font-size: 1.2rem;
  font-weight: 600;
  font-family: "Poppins", sans-serif;

  background: linear-gradient(90deg, #5eead4, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* ===============================
   FORM FIELDS
================================ */
.field {
  position: relative;
  width: 80%;
  margin-bottom: 18px;
}

.field input {
  width: 100%;
  height: 52px;
  padding: 0 48px;
  border-radius: 16px;

  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.18);

  color: #f8fafc;
  font-size: 0.95rem;
  outline: none;
}

.field input::placeholder {
  color: #94a3b8;
}

.field input:focus {
  border-color: #5eead4;
  box-shadow: 0 0 0 3px rgba(94, 234, 212, 0.25);
}

.icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.eye {
  position: absolute;
  right: -56px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #94a3b8;
}

/* ===============================
   BUTTON
================================ */
.btn {
  width: 100%;
  height: 54px;
  margin-top: 10px;
  border-radius: 18px;

  font-weight: 700;
  font-size: 1rem;

  background: linear-gradient(135deg, #5eead4, #60a5fa);
  border: none;
  cursor: pointer;
  color: #020617;
}

.btn:hover {
  box-shadow: 0 20px 60px rgba(94, 234, 212, 0.45);
}

/* ===============================
   SWITCH
================================ */
.switch {
  margin-top: 20px;
  text-align: center;
  font-size: 0.9rem;
  color: #cbd5f5;
}

.switch span {
  font-weight: 700;
  cursor: pointer;

  background: linear-gradient(90deg, #5eead4, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
`;
