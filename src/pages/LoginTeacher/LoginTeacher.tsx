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

const LoginT: React.FC = () => {
  const [showPass, setShowPass] = useState<boolean>(false);
  const navigate = useNavigate();

  return (
    <div className="flex-1 w-full relative flex justify-center items-center py-12 px-4 overflow-hidden">
      {/* Background Blobs - positioned relative to this container */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <motion.div
        className="w-[420px] max-w-full p-[42px] rounded-[28px] bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl transition-all duration-400 z-[5] hover:-translate-y-2 flex flex-col items-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* LOGO */}
        <img
          src={logoImg}
          alt="AIXAM Logo"
          className="block mx-auto mb-3 h-[108px]"
        />

        <div className="flex justify-center items-center gap-2.5 my-[14px] mb-7 text-[1.2rem] font-semibold font-poppins text-slate-800">
          <FiUserCheck className="text-indigo-600" />
          <span className="bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
            Welcome Teacher
          </span>
        </div>

        <div className="relative w-[80%] mb-[18px]">
          <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Email"
            className="w-full h-[52px] px-[48px] rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-[0.95rem] outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10 placeholder-slate-400 transition-all"
          />
        </div>

        <div className="relative w-[80%] mb-[18px]">
          <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type={showPass ? "text" : "password"}
            placeholder="Password"
            className="w-full h-[52px] px-[48px] rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-[0.95rem] outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10 placeholder-slate-400 transition-all"
          />
          <div
            className="absolute right-[-40px] top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
            onClick={() => setShowPass(!showPass)}
          >
            {showPass ? <FiEyeOff /> : <FiEye />}
          </div>
        </div>

        <button className="w-full h-[54px] mt-2.5 rounded-[18px] font-bold text-[1rem] bg-indigo-600 text-white border-none cursor-pointer hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all">
          Login
        </button>

        <div className="mt-5 text-center text-[0.9rem] text-slate-500">
          Didn’t have account?{" "}
          <span
            onClick={() => navigate("/create-account")}
            className="font-bold cursor-pointer text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Create Account
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginT;
