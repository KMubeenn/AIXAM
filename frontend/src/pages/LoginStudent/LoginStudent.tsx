import React, { useState } from "react";
import { FiMail, FiLock, FiEye, FiEyeOff, FiUserCheck } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import logoImg from "../../assets/logo/logo_black.png";
import logoWhiteImg from "../../assets/logo/logo_white.png";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { AuthService } from "../../services/auth.service";

const LoginS: React.FC = () => {
  const [showPass, setShowPass] = useState<boolean>(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const checkSession = async () => {
      const token = AuthService.getToken();
      if (!token) return;

      try {
        const data = await AuthService.getProfile();
        const user = data.user;

        if (user && user.role === "student") {
          navigate("/student-dashboard");
        } else if (user && user.role === "teacher") {
          // Wrong portal, clear session
          AuthService.logout();
          setError(
            "This account is for Teachers. Please use the Teacher Login.",
          );
        }
      } catch (err) {
        // Invalid token
        AuthService.logout();
      }
    };

    checkSession();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await AuthService.login(
        formData.email,
        formData.password,
      );
      const user = response.user;

      if (user.role === "student") {
        navigate("/student-dashboard");
      } else {
        // Logged in successfully but wrong portal
        AuthService.logout(); // Clear session
        setError("This account is for Teachers. Please use the Teacher Login.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.error || err.message || "Login failed");
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
          className="block dark:hidden mx-auto mb-3 h-[108px]"
        />
        <img
          src={logoWhiteImg}
          alt="AIXAM Logo"
          className="hidden dark:block mx-auto mb-3 h-[108px]"
        />

        <div className="flex justify-center items-center gap-2.5 my-[14px] mb-7 text-[1.2rem] font-semibold font-poppins text-slate-800 dark:text-slate-200">
          <FiUserCheck className="text-indigo-600" />
          <span className="bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
            Welcome Student
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <Input
          icon={FiMail}
          placeholder="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />

        <div className="relative w-[85%] mb-[18px]">
          <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type={showPass ? "text" : "password"}
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full h-[52px] px-[48px] rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-[0.95rem] outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
          />
          <div
            className="absolute right-[-40px] top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
            onClick={() => setShowPass(!showPass)}
          >
            {showPass ? <FiEyeOff /> : <FiEye />}
          </div>
        </div>

        <Button
          fullWidth
          className="mt-2.5"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>

        <div className="mt-5 text-center text-[0.9rem] text-slate-500 dark:text-slate-400">
          Didn’t have account?{" "}
          <span
            onClick={() => navigate("/create-account")}
            className="font-bold cursor-pointer text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Create Account
          </span>
        </div>
      </Card>
    </div>
  );
};

export default LoginS;
