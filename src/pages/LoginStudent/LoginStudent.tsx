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
import logoImg from "../../assets/logo.png";

const LoginS: React.FC = () => {
  const [showPass, setShowPass] = useState<boolean>(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex justify-center items-center bg-[radial-gradient(circle_at_top,#020617_0%,#000_70%)] text-slate-50 font-inter">
      {/* BACK TO HOME */}
      <div
        className="absolute top-6 left-7 flex items-center gap-2 font-poppins font-semibold cursor-pointer z-10 bg-gradient-to-r from-[#5eead4] to-[#60a5fa] bg-clip-text text-transparent hover:opacity-80 transition-opacity"
        onClick={() => navigate("/")}
      >
        <FiArrowLeft className="text-[#5eead4]" />
        <span>Back to Home</span>
      </div>

      {/* DECORATIVE SHAPES */}
      <div className="absolute blur-[40px] opacity-35 bg-gradient-to-br from-[#5eead4] to-[#60a5fa] rounded-full w-[220px] h-[220px] top-[10%] left-[8%]" />
      <div className="absolute blur-[40px] opacity-35 bg-gradient-to-br from-[#5eead4] to-[#60a5fa] rounded-full w-[280px] h-[280px] bottom-[12%] right-[6%]" />
      <div className="absolute blur-[40px] opacity-35 bg-gradient-to-br from-[#5eead4] to-[#60a5fa] rounded-[20%] w-[180px] h-[180px] top-[65%] left-[15%]" />
      <div className="absolute blur-[40px] opacity-35 bg-gradient-to-br from-[#5eead4] to-[#60a5fa] rounded-[20%] w-[140px] h-[140px] top-[18%] right-[20%]" />

      <motion.div
        className="w-[420px] max-w-[92%] p-[42px] rounded-[28px] bg-white/10 backdrop-blur-[22px] border border-white/20 shadow-[0_30px_80px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(255,255,255,0.05)] transition-all duration-400 z-[5] hover:-translate-y-2 flex flex-col items-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* LOGO */}
        <img
          src={logoImg}
          alt="AIXAM Logo"
          className="block mx-auto mb-3 h-[108px]"
        />

        <div className="flex justify-center items-center gap-2.5 my-[14px] mb-7 text-[1.2rem] font-semibold font-poppins bg-gradient-to-r from-[#5eead4] to-[#60a5fa] bg-clip-text text-transparent">
          <FiUserCheck className="text-[#5eead4]" />
          Welcome Student
        </div>

        <div className="relative w-[80%] mb-[18px]">
          <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Email"
            className="w-full h-[52px] px-[48px] rounded-2xl bg-white/10 border border-white/20 text-slate-50 text-[0.95rem] outline-none focus:border-[#5eead4] focus:ring-[3px] focus:ring-[#5eead4]/25 placeholder-slate-400 transition-all"
          />
        </div>

        <div className="relative w-[80%] mb-[18px]">
          <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type={showPass ? "text" : "password"}
            placeholder="Password"
            className="w-full h-[52px] px-[48px] rounded-2xl bg-white/10 border border-white/20 text-slate-50 text-[0.95rem] outline-none focus:border-[#5eead4] focus:ring-[3px] focus:ring-[#5eead4]/25 placeholder-slate-400 transition-all"
          />
          <div
            className="absolute right-[-40px] top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-white transition-colors"
            onClick={() => setShowPass(!showPass)}
          >
            {showPass ? <FiEyeOff /> : <FiEye />}
          </div>
        </div>

        <button className="w-full h-[54px] mt-2.5 rounded-[18px] font-bold text-[1rem] bg-gradient-to-br from-[#5eead4] to-[#60a5fa] border-none cursor-pointer text-[#020617] hover:shadow-[0_20px_60px_rgba(94,234,212,0.45)] transition-all">
          Login
        </button>

        <div className="mt-5 text-center text-[0.9rem] text-[#cbd5f5]">
          Didn’t have account?{" "}
          <span
            onClick={() => navigate("/create-account")}
            className="font-bold cursor-pointer bg-gradient-to-r from-[#5eead4] to-[#60a5fa] bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            Create Account
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginS;
