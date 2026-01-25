import React from "react";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import logoImg from "../../assets/logo/logo_black.png";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const CreateAccount: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 w-full relative flex justify-center items-center py-12 px-4 overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <Card>
        {/* LOGO */}
        <img
          src={logoImg}
          alt="AIXAM Logo"
          className="block mx-auto mb-[14px] h-[90px]"
        />

        <div className="text-center mb-[28px] text-[1.3rem] font-semibold font-poppins">
          <span className="bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
            Create Account
          </span>
        </div>

        <div className="flex flex-col items-center w-full">
          <Input icon={FiUser} placeholder="Full Name" />
          <Input icon={FiMail} placeholder="Email" />
          <Input icon={FiLock} type="password" placeholder="Password" />

          <div className="relative w-[85%] mb-[18px]">
            <select
              className="w-full h-[52px] px-[48px] rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-[1rem] font-semibold outline-none cursor-pointer appearance-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10 transition-all"
              style={{
                backgroundImage: `linear-gradient(45deg, transparent 50%, #4f46e5 50%), linear-gradient(135deg, #4f46e5 50%, transparent 50%)`,
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

        <Button fullWidth className="w-[70%] mt-[14px] mx-auto block">
          Create Account
        </Button>
      </Card>
    </div>
  );
};

export default CreateAccount;
