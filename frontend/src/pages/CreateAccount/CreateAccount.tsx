import React, { useState } from "react";
import { FiUser, FiMail, FiLock, FiKey } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import logoImg from "../../assets/logo/logo_black.png";
import logoWhiteImg from "../../assets/logo/logo_white.png";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { AuthService } from "../../services/auth.service";
import { toast } from "react-hot-toast";

const CreateAccount: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student", // Default
  });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Simple validations before sending OTP
    if (!formData.name.trim()) {
      setError("Full Name is required");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("A valid Email is required");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (formData.role === "Select Role") {
      setError("Please select a valid role");
      return;
    }

    setLoading(true);
    try {
      await AuthService.sendOtp(formData.email.trim().toLowerCase(), "signup");
      toast.success("Verification code sent to your email!");
      setStep(2);
    } catch (err: any) {
      console.error(err);
      setError(err.error || err.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otp.trim()) {
      setError("Verification code is required");
      return;
    }

    setLoading(true);
    try {
      // 1. Verify OTP first to get token
      const verifyRes = await AuthService.verifyOtp(
        formData.email.trim().toLowerCase(),
        otp.trim()
      );
      
      // 2. Perform actual signup using token
      await AuthService.signup({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role.toLowerCase(),
        otp_token: verifyRes.otp_token,
      });
      
      toast.success("Account successfully created!");

      // Redirect to specific login page based on role
      if (formData.role.toLowerCase() === "student") {
        navigate("/login-student");
      } else {
        navigate("/login-teacher");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.error || err.message || "Verification or signup failed");
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
            {step === 1 ? "Create Account" : "Verify Email"}
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="w-full flex flex-col items-center">
            <Input
              icon={FiUser}
              placeholder="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
            />
            <Input
              icon={FiMail}
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
            <Input
              icon={FiLock}
              type="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
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

            <Button
              type="submit"
              fullWidth
              className="w-[70%] mt-[14px] mx-auto block"
              disabled={loading}
            >
              {loading ? "Sending Code..." : "Create Account"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndSignup} className="w-full flex flex-col items-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6 w-[85%]">
              Enter the 6-digit verification code sent to <strong>{formData.email}</strong>.
            </p>
            <Input
              icon={FiKey}
              placeholder="Verification Code (OTP)"
              name="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              className="w-[70%] mt-[14px] mx-auto block"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify & Sign Up"}
            </Button>
            <div className="mt-4 text-center">
              <span
                onClick={() => setStep(1)}
                className="text-xs text-indigo-600 hover:text-indigo-700 cursor-pointer font-semibold"
              >
                Back to Edit Info
              </span>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default CreateAccount;
