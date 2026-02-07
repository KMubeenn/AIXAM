import React, { useState } from "react";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import logoImg from "../../assets/logo/logo_black.png";
import logoWhiteImg from "../../assets/logo/logo_white.png";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { AuthService } from "../../services/auth.service";

const CreateAccount: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student", // Default
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      if (formData.role === "Select Role") {
        throw new Error("Please select a valid role");
      }

      await AuthService.signup(
        formData.name,
        formData.email,
        formData.password,
        formData.role.toLowerCase(),
      );

      // Redirect to specific login page based on role
      if (formData.role.toLowerCase() === "student") {
        navigate("/login-student");
      } else {
        navigate("/login-teacher");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.error || err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full relative flex justify-center items-center py-12 px-4 overflow-hidden">
      <Card>
        {/* LOGO */}
        <img
          src={logoImg}
          alt="AIXAM Logo"
          className="block dark:hidden mx-auto mb-[14px] h-[90px]"
        />
        <img
          src={logoWhiteImg}
          alt="AIXAM Logo"
          className="hidden dark:block mx-auto mb-[14px] h-[90px]"
        />

        <div className="text-center mb-[28px] text-[1.3rem] font-semibold font-poppins">
          <span className="bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
            Create Account
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center w-full">
          <Input
            icon={FiUser}
            placeholder="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <Input
            icon={FiMail}
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          <Input
            icon={FiLock}
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />

          <div className="relative w-[85%] mb-[18px]">
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full h-[52px] px-[48px] rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-[1rem] font-semibold outline-none cursor-pointer appearance-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 transition-all"
              style={{
                backgroundImage: `linear-gradient(45deg, transparent 50%, #4f46e5 50%), linear-gradient(135deg, #4f46e5 50%, transparent 50%)`,
                backgroundPosition: `calc(100% - 22px) 50%, calc(100% - 16px) 50%`,
                backgroundSize: `6px 6px`,
                backgroundRepeat: "no-repeat",
              }}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
        </div>

        <Button
          fullWidth
          className="w-[70%] mt-[14px] mx-auto block"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Account"}
        </Button>
      </Card>
    </div>
  );
};

export default CreateAccount;
