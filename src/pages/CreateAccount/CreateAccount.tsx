import React from "react";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiLock, FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import logoImg from "../../assets/logo.png";

const CreateAccount: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex justify-center items-center bg-[radial-gradient(circle_at_top,#020617_0%,#000_70%)] text-slate-50 font-inter">
      {/* TOP BAR */}
      <div className="absolute top-6 left-7 right-7 flex justify-between z-10">
        <div
          className="flex items-center gap-2 font-poppins font-semibold cursor-pointer bg-gradient-to-r from-[#5eead4] to-[#60a5fa] bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          onClick={() => navigate("/")}
        >
          <FiArrowLeft className="text-[#5eead4]" />
          <span>Back to Home</span>
        </div>
      </div>

      {/* DECORATIVE SHAPES */}
      <div className="absolute blur-[40px] opacity-35 bg-gradient-to-br from-[#5eead4] to-[#60a5fa] rounded-full w-[220px] h-[220px] top-[10%] left-[8%]" />
      <div className="absolute blur-[40px] opacity-35 bg-gradient-to-br from-[#5eead4] to-[#60a5fa] rounded-full w-[280px] h-[280px] bottom-[12%] right-[6%]" />
      <div className="absolute blur-[40px] opacity-35 bg-gradient-to-br from-[#5eead4] to-[#60a5fa] rounded-[20%] w-[180px] h-[180px] top-[65%] left-[15%]" />
      <div className="absolute blur-[40px] opacity-35 bg-gradient-to-br from-[#5eead4] to-[#60a5fa] rounded-[20%] w-[140px] h-[140px] top-[18%] right-[20%]" />

      <motion.div
        className="w-[420px] max-w-[92%] p-[42px] rounded-[28px] bg-white/10 backdrop-blur-[22px] border border-white/20 shadow-[0_30px_80px_rgba(0,0,0,0.55)] z-[5]"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* LOGO */}
        <img
          src={logoImg}
          alt="AIXAM Logo"
          className="block mx-auto mb-[14px] h-[90px]"
        />

        <div className="text-center mb-[28px] text-[1.3rem] font-semibold font-poppins bg-gradient-to-r from-[#5eead4] to-[#60a5fa] bg-clip-text text-transparent">
          Create Account
        </div>

        <div className="flex flex-col items-center">
          <div className="relative w-[85%] mb-[18px]">
            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Full Name"
              className="h-[52px] px-[48px] rounded-2xl bg-black border border-white/25 text-white text-[1rem] font-semibold outline-none focus:border-[#5eead4] focus:ring-[3px] focus:ring-[#5eead4]/25 placeholder-[#cbd5f5] transition-all w-full"
              // Note: original css had .field.small { width: 85% } and .field input { width: 80% }.
              // Wait, .field contained input. If .field is 85%, input width: 80% means 80% of 85%. That seems small.
              // Actually looking at CSS:
              // .field.small { width: 85%; }
              // .field input { width: 80%; } -> This is inside .field.
              // So the input is 80% of the field width? Or maybe the CSS selector was global.
              // Let's assume input should fill the field wrapper which is restricted to 85% of card width (since form-center aligns items center).
              // Let's set input w-full and wrapper w-[85%].
            />
          </div>

          <div className="relative w-[85%] mb-[18px]">
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Email"
              className="w-full h-[52px] px-[48px] rounded-2xl bg-black border border-white/25 text-white text-[1rem] font-semibold outline-none focus:border-[#5eead4] focus:ring-[3px] focus:ring-[#5eead4]/25 placeholder-[#cbd5f5] transition-all"
            />
          </div>

          <div className="relative w-[85%] mb-[18px]">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              placeholder="Password"
              className="w-full h-[52px] px-[48px] rounded-2xl bg-black border border-white/25 text-white text-[1rem] font-semibold outline-none focus:border-[#5eead4] focus:ring-[3px] focus:ring-[#5eead4]/25 placeholder-[#cbd5f5] transition-all"
            />
          </div>

          <div className="relative w-[85%] mb-[18px]">
            <select
              className="w-full h-[52px] px-[48px] rounded-2xl bg-black border border-white/25 text-white text-[1rem] font-semibold outline-none cursor-pointer appearance-none"
              style={{
                backgroundImage: `linear-gradient(45deg, transparent 50%, #5eead4 50%), linear-gradient(135deg, #5eead4 50%, transparent 50%)`,
                backgroundPosition: `calc(100% - 22px) 50%, calc(100% - 16px) 50%`,
                backgroundSize: `6px 6px`,
                backgroundRepeat: "no-repeat",
              }}
            >
              <option>Select Role</option>
              <option>Teacher</option>
              <option>Student</option>
            </select>
          </div>
        </div>

        <button className="w-[70%] h-[54px] mt-[14px] mx-auto block rounded-[18px] font-bold text-[1rem] bg-gradient-to-br from-[#5eead4] to-[#60a5fa] border-none text-white cursor-pointer hover:shadow-[0_20px_60px_rgba(94,234,212,0.45)] transition-all">
          Create Account
        </button>
      </motion.div>
    </div>
  );
};

export default CreateAccount;
