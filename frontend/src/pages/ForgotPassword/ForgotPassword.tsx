import React, { useState } from "react";
import { FiMail, FiLock, FiEye, FiEyeOff, FiKey } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import logoImg from "../../assets/logo/logo_black.png";
import logoWhiteImg from "../../assets/logo/logo_white.png";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { AuthService } from "../../services/auth.service";

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPass, setShowPass] = useState<boolean>(false);
  const [showConfirmPass, setShowConfirmPass] = useState<boolean>(false);
  
  const [otpToken, setOtpToken] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await AuthService.sendOtp(email, "reset");
      setMessage("Verification code sent to your email!");
      setStep(2);
    } catch (err: any) {
      console.error(err);
      setError(err.error || err.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("Verification code is required");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const response = await AuthService.verifyOtp(email, otp);
      setOtpToken(response.otp_token);
      setMessage("Email verified successfully! You can now reset your password.");
      setStep(3);
    } catch (err: any) {
      console.error(err);
      setError(err.error || err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError("All password fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await AuthService.resetPassword({
        email,
        otp_token: otpToken,
        new_password: newPassword
      });
      setMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login-student");
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.error || err.message || "Failed to reset password");
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
          <FiKey className="text-indigo-600" />
          <span className="bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
            Reset Password
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-emerald-100 text-emerald-700 rounded-lg text-sm text-center">
            {message}
          </div>
        )}

        {/* STEP 1: Email Input */}
        {step === 1 && (
          <>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6 w-[85%]">
              Enter your email address and we'll send you a 6-digit code to verify your identity.
            </p>
            <Input
              icon={FiMail}
              placeholder="Email Address"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              fullWidth
              className="mt-2.5"
              onClick={handleSendOtp}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Verification Code"}
            </Button>
          </>
        )}

        {/* STEP 2: OTP Input */}
        {step === 2 && (
          <>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6 w-[85%]">
              Enter the 6-digit verification code sent to <strong>{email}</strong>.
            </p>
            <Input
              icon={FiKey}
              placeholder="Verification Code (OTP)"
              name="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <Button
              fullWidth
              className="mt-2.5"
              onClick={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify Code"}
            </Button>
            <div className="mt-4 text-center">
              <span
                onClick={() => setStep(1)}
                className="text-xs text-indigo-600 hover:text-indigo-700 cursor-pointer font-semibold"
              >
                Back to Email
              </span>
            </div>
          </>
        )}

        {/* STEP 3: New Password */}
        {step === 3 && (
          <>
            <div className="relative w-[85%] mb-[18px]">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPass ? "text" : "password"}
                placeholder="New Password"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-[52px] px-[48px] rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-[0.95rem] outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
              />
              <div
                className="absolute right-[-40px] top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <FiEyeOff /> : <FiEye />}
              </div>
            </div>

            <div className="relative w-[85%] mb-[18px]">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showConfirmPass ? "text" : "password"}
                placeholder="Confirm New Password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-[52px] px-[48px] rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-[0.95rem] outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
              />
              <div
                className="absolute right-[-40px] top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
              >
                {showConfirmPass ? <FiEyeOff /> : <FiEye />}
              </div>
            </div>

            <Button
              fullWidth
              className="mt-2.5"
              onClick={handleResetPassword}
              disabled={loading}
            >
              {loading ? "Resetting Password..." : "Update Password"}
            </Button>
          </>
        )}

        <div className="mt-5 text-center text-[0.9rem] text-slate-500 dark:text-slate-400">
          Remember your password?{" "}
          <span
            onClick={() => navigate("/login-student")}
            className="font-bold cursor-pointer text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Log In
          </span>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;
