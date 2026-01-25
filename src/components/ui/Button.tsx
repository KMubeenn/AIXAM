import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  variant = "primary",
  fullWidth = false,
  ...props
}) => {
  const baseStyles =
    "font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-indigo-600 text-white border-none hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200",
    secondary:
      "bg-white text-slate-700 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600",
    outline: "border border-slate-200 text-slate-600 hover:bg-slate-50",
  };

  const sizes = "h-[54px] rounded-[18px] text-[1rem]"; // Auth button style
  // Note: Hero buttons were rounded-full and larger.
  // For now, I am specifically targeting the Auth button pattern which is reused 3 times.

  return (
    <button
      className={`${baseStyles} ${sizes} ${variants[variant]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
